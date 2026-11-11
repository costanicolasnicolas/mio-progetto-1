import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHmac } from 'node:crypto';
import WebSocket from 'ws';
import { createApp } from '../src/app.js';
import { hashPassword } from '../src/auth.js';

const PNG_1x1 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const WEBHOOK_SECRET = 'whsec_test_123';
let app, base, tmp;

async function call(path, { token, method = 'GET', body, headers = {}, raw } = {}) {
  const res = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers },
    body: raw ?? (body === undefined ? undefined : JSON.stringify(body)),
  });
  return { status: res.status, body: await res.json() };
}

let n = 0;
async function makeUser({ gender = 'woman', interested_in = ['man'], age = 28, lat = 37.85, lng = 15.28, interests = ['mare', 'cucina'], photo = true } = {}) {
  n += 1;
  const birthdate = `${new Date().getUTCFullYear() - age - 1}-01-15`;
  const r = await call('/api/auth/register', { method: 'POST', body: {
    email: `u${n}@test.local`, password: 'password-di-prova', name: `Utente${n}`, birthdate, gender, interested_in, consent_terms: true, consent_sensitive: true } });
  assert.equal(r.status, 201, JSON.stringify(r.body));
  const token = r.body.token;
  await call('/api/me/profile', { token, method: 'PUT', body: { lat, lng, city: 'Taormina', interests, bio: 'Bio di prova abbastanza lunga da contare come completa.' } });
  if (photo) await call('/api/me/photos', { token, method: 'POST', body: { dataUrl: PNG_1x1 } });
  return { token, id: r.body.me.id };
}

async function matchPair() {
  const a = await makeUser({ gender: 'man', interested_in: ['woman'] });
  const b = await makeUser({ gender: 'woman', interested_in: ['man'] });
  await call('/api/swipes', { token: a.token, method: 'POST', body: { targetId: b.id, direction: 'like' } });
  const r = await call('/api/swipes', { token: b.token, method: 'POST', body: { targetId: a.id, direction: 'like' } });
  return { a, b, matchId: r.body.match.id };
}

before(async () => {
  tmp = mkdtempSync(join(tmpdir(), 'sintonia-'));
  app = createApp({ dbFile: join(tmp, 'test.db'), uploadsDir: join(tmp, 'uploads'), secret: 'segreto-test', stripeWebhookSecret: WEBHOOK_SECRET });
  base = `http://127.0.0.1:${await app.listen(0)}`;
});
after(async () => { await app.close(); rmSync(tmp, { recursive: true, force: true }); });

test('registrazione: rifiuta minorenni e richiede il consenso art. 9', async () => {
  const minor = await call('/api/auth/register', { method: 'POST', body: { email: 'kid@test.local', password: 'password-di-prova', name: 'Kid',
    birthdate: `${new Date().getUTCFullYear() - 16}-01-01`, gender: 'man', interested_in: ['woman'], consent_terms: true, consent_sensitive: true } });
  assert.equal(minor.status, 403);
  const noConsent = await call('/api/auth/register', { method: 'POST', body: { email: 'nc@test.local', password: 'password-di-prova', name: 'Nc',
    birthdate: '1990-01-01', gender: 'man', interested_in: ['woman'], consent_terms: true } });
  assert.equal(noConsent.status, 400);
});

test('login: password errata 401, token falsificato 401', async () => {
  await makeUser();
  assert.equal((await call('/api/auth/login', { method: 'POST', body: { email: `u${n}@test.local`, password: 'sbagliata-123' } })).status, 401);
  assert.equal((await call('/api/auth/login', { method: 'POST', body: { email: `u${n}@test.local`, password: 'password-di-prova' } })).status, 200);
  assert.equal((await call('/api/me', { token: 'eyJ1aWQiOjF9.firma-falsa' })).status, 401);
});

test('discover: preferenze reciproche, raggio, età e niente dati sensibili esposti', async () => {
  const me = await makeUser({ gender: 'man', interested_in: ['woman'], lat: 37.85, lng: 15.28 });
  const ok = await makeUser({ gender: 'woman', interested_in: ['man'], lat: 37.86, lng: 15.29 });
  const wrongPref = await makeUser({ gender: 'woman', interested_in: ['woman'] });
  const tooFar = await makeUser({ gender: 'woman', interested_in: ['man'], lat: 45.46, lng: 9.19 }); // Milano
  const r = await call('/api/discover', { token: me.token });
  const ids = r.body.map((c) => c.id);
  assert.ok(ids.includes(ok.id));
  assert.ok(!ids.includes(wrongPref.id), 'non deve mostrare chi non cerca il mio genere');
  assert.ok(!ids.includes(tooFar.id), 'non deve mostrare chi è fuori raggio');
  const card = r.body.find((c) => c.id === ok.id);
  assert.equal(card.email, undefined); assert.equal(card.lat, undefined); assert.equal(card.birthdate, undefined);
  assert.ok(card.distanceKm >= 1);
});

test('like reciproco crea un match e notifica in tempo reale via WebSocket', async () => {
  const a = await makeUser({ gender: 'man', interested_in: ['woman'] });
  const b = await makeUser({ gender: 'woman', interested_in: ['man'] });
  const ws = new WebSocket(`${base.replace('http', 'ws')}/ws?token=${a.token}`);
  const events = [];
  await new Promise((ok) => ws.on('message', (d) => { events.push(JSON.parse(d)); if (events[0]?.type === 'hello') ok(); }));
  const first = await call('/api/swipes', { token: a.token, method: 'POST', body: { targetId: b.id, direction: 'like' } });
  assert.equal(first.body.match, null);
  const second = await call('/api/swipes', { token: b.token, method: 'POST', body: { targetId: a.id, direction: 'like' } });
  assert.ok(second.body.match.id);
  await new Promise((r) => setTimeout(r, 100));
  assert.ok(events.some((e) => e.type === 'notification' && e.notification.type === 'match'));
  ws.close();
});

test('messaggi ILLIMITATI anche per un utente Free (600 messaggi)', async () => {
  const { a, b, matchId } = await matchPair();
  for (let i = 0; i < 600; i++) {
    const r = await call(`/api/matches/${matchId}/messages`, { token: i % 2 ? a.token : b.token, method: 'POST', body: { body: `messaggio ${i}` } });
    assert.equal(r.status, 201, `messaggio ${i} rifiutato: ${JSON.stringify(r.body)}`);
  }
  const me = await call('/api/me', { token: a.token });
  assert.equal(me.body.plan, 'free');
  assert.equal(me.body.limits.messages, 'illimitati');
});

test('chat: un estraneo non può leggere né scrivere in un match altrui', async () => {
  const { matchId } = await matchPair();
  const intruder = await makeUser();
  assert.equal((await call(`/api/matches/${matchId}/messages`, { token: intruder.token })).status, 404);
  assert.equal((await call(`/api/matches/${matchId}/messages`, { token: intruder.token, method: 'POST', body: { body: 'ciao' } })).status, 404);
});

test('antifrode: messaggio con richiesta di denaro viene segnalato e il destinatario vede l\'avviso', async () => {
  const { a, b, matchId } = await matchPair();
  await call(`/api/matches/${matchId}/messages`, { token: a.token, method: 'POST', body: { body: 'Mi fai una ricarica postepay? Poi scrivimi su whatsapp' } });
  const seenByB = await call(`/api/matches/${matchId}/messages`, { token: b.token });
  assert.match(seenByB.body.messages[0].warning, /richiesta_denaro/);
  const seenByA = await call(`/api/matches/${matchId}/messages`, { token: a.token });
  assert.equal(seenByA.body.messages[0].warning, undefined, 'il mittente non vede il flag');
});

test('blocco: nasconde il match, impedisce messaggi e sparisce da discover', async () => {
  const { a, b, matchId } = await matchPair();
  await call('/api/blocks', { token: a.token, method: 'POST', body: { userId: b.id } });
  assert.equal((await call(`/api/matches/${matchId}/messages`, { token: b.token, method: 'POST', body: { body: 'ci sei?' } })).status, 403);
  assert.ok(!(await call('/api/matches', { token: a.token })).body.some((m) => m.id === matchId));
  assert.ok(!(await call('/api/discover', { token: b.token })).body.some((c) => c.id === a.id));
});

test('segnalazioni: 3 utenti distinti → sospensione cautelativa; admin decide con motivazione', async () => {
  const target = await makeUser({ gender: 'man', interested_in: ['woman'] });
  for (let i = 0; i < 3; i++) {
    const r = await makeUser();
    const out = await call('/api/reports', { token: r.token, method: 'POST', body: { userId: target.id, reason: 'scam', details: 'chiede soldi' } });
    assert.equal(out.body.autoSuspended, i === 2);
  }
  assert.equal((await call('/api/discover', { token: target.token })).status, 403);

  app.db.prepare(`INSERT INTO users(email, password_hash, role, consent_sensitive_at, created_at) VALUES ('adm@test.local', ?, 'admin', 0, 0)`).run(hashPassword('admin-password-1'));
  const uid = app.db.prepare(`SELECT id FROM users WHERE email='adm@test.local'`).get().id;
  app.db.prepare(`INSERT INTO profiles(user_id, name, birthdate, gender, interested_in, last_active_at) VALUES (?, 'Admin', '1980-01-01', 'man', 'woman', 0)`).run(uid);
  const admin = (await call('/api/auth/login', { method: 'POST', body: { email: 'adm@test.local', password: 'admin-password-1' } })).body.token;
  assert.equal((await call('/api/admin/stats', { token: target.token })).status, 403, 'un utente normale non accede all\'admin');
  const reports = (await call('/api/admin/reports', { token: admin })).body;
  const rep = reports.find((r) => r.reported_id === target.id);
  assert.equal((await call(`/api/admin/reports/${rep.id}`, { token: admin, method: 'POST', body: { action: 'ban' } })).status, 400, 'serve la motivazione');
  assert.equal((await call(`/api/admin/reports/${rep.id}`, { token: admin, method: 'POST', body: { action: 'ban', resolution: 'Truffa confermata' } })).status, 200);
  assert.equal((await call('/api/me', { token: target.token })).status, 401, 'utente bannato escluso');
});

test('piani: Free ha 40 like/giorno, Premium sblocca like illimitati e "chi ti ha messo like"', async () => {
  const me = await makeUser({ gender: 'man', interested_in: ['woman'] });
  const fans = [];
  for (let i = 0; i < 41; i++) fans.push(await makeUser({ gender: 'woman', interested_in: ['man'], photo: false }));
  let last;
  for (const f of fans) last = await call('/api/swipes', { token: me.token, method: 'POST', body: { targetId: f.id, direction: 'like' } });
  assert.equal(last.status, 402, 'il 41° like del giorno è bloccato per Free');

  const fan = await makeUser({ gender: 'woman', interested_in: ['man'] });
  await call('/api/swipes', { token: fan.token, method: 'POST', body: { targetId: me.id, direction: 'like' } });
  assert.equal((await call('/api/likes', { token: me.token })).body.locked, true);
  const co = await call('/api/billing/checkout', { token: me.token, method: 'POST', body: { plan: 'premium' } });
  assert.equal(co.body.me.plan, 'premium');
  const likes = await call('/api/likes', { token: me.token });
  assert.equal(likes.body.locked, false);
  assert.ok(likes.body.profiles.some((p) => p.id === fan.id));
  const extra = await makeUser({ gender: 'woman', interested_in: ['man'], photo: false });
  assert.equal((await call('/api/swipes', { token: me.token, method: 'POST', body: { targetId: extra.id, direction: 'like' } })).status, 200);
});

test('pagamenti: webhook Stripe con firma valida applicato una sola volta, firma falsa rifiutata', async () => {
  const u = await makeUser();
  const event = { id: 'evt_test_1', type: 'customer.subscription.created',
    data: { object: { id: 'sub_123', status: 'active', current_period_end: Math.floor(Date.now() / 1000) + 30 * 86400, metadata: { user_id: String(u.id), plan: 'plus' } } } };
  const raw = JSON.stringify(event);
  const t = Math.floor(Date.now() / 1000);
  const sig = createHmac('sha256', WEBHOOK_SECRET).update(`${t}.${raw}`).digest('hex');
  const bad = await call('/api/billing/stripe-webhook', { method: 'POST', raw, headers: { 'Stripe-Signature': `t=${t},v1=${'0'.repeat(64)}` } });
  assert.equal(bad.status, 400);
  const ok = await call('/api/billing/stripe-webhook', { method: 'POST', raw, headers: { 'Stripe-Signature': `t=${t},v1=${sig}` } });
  assert.equal(ok.body.result, 'applied');
  const dup = await call('/api/billing/stripe-webhook', { method: 'POST', raw, headers: { 'Stripe-Signature': `t=${t},v1=${sig}` } });
  assert.equal(dup.body.result, 'duplicate');
  assert.equal((await call('/api/me', { token: u.token })).body.plan, 'plus');
});

test('suggerimenti di conversazione: senza consenso AI si usano regole locali; limite giornaliero Free', async () => {
  const { a, matchId } = await matchPair();
  const r = await call(`/api/matches/${matchId}/suggestions`, { token: a.token, method: 'POST' });
  assert.equal(r.status, 200);
  assert.equal(r.body.source, 'regole');
  assert.ok(r.body.suggestions.length >= 1);
  await call(`/api/matches/${matchId}/suggestions`, { token: a.token, method: 'POST' });
  await call(`/api/matches/${matchId}/suggestions`, { token: a.token, method: 'POST' });
  assert.equal((await call(`/api/matches/${matchId}/suggestions`, { token: a.token, method: 'POST' })).status, 402);
});

test('upload: rifiuta file che non sono immagini reali (anche se dichiarati image/png)', async () => {
  const u = await makeUser({ photo: false });
  const fake = 'data:image/png;base64,' + Buffer.from('<script>alert(1)</script>').toString('base64');
  assert.equal((await call('/api/me/photos', { token: u.token, method: 'POST', body: { dataUrl: fake } })).status, 400);
  const svg = 'data:image/svg+xml;base64,' + Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>').toString('base64');
  assert.equal((await call('/api/me/photos', { token: u.token, method: 'POST', body: { dataUrl: svg } })).status, 400);
});

test('GDPR: export dei dati e cancellazione definitiva dell\'account', async () => {
  const { a, matchId } = await matchPair();
  await call(`/api/matches/${matchId}/messages`, { token: a.token, method: 'POST', body: { body: 'ciao!' } });
  const exp = await call('/api/me/export', { token: a.token });
  assert.equal(exp.body.messages_sent.length, 1);
  assert.equal((await call('/api/me', { token: a.token, method: 'DELETE' })).body.deleted, true);
  assert.equal((await call('/api/me', { token: a.token })).status, 401);
  assert.equal(app.db.prepare('SELECT COUNT(*) n FROM messages WHERE match_id=?').get(matchId).n, 0);
});
