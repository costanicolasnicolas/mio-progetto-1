import { createServer } from 'node:http';
import { readFileSync, writeFileSync, mkdirSync, existsSync, unlinkSync } from 'node:fs';
import { join, dirname, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes, randomInt } from 'node:crypto';
import { WebSocketServer } from 'ws';

import { openDb, tx } from './db.js';
import { hashPassword, verifyPassword, signToken, verifyToken, createRateLimiter } from './auth.js';
import { PLANS, effectivePlan, getUsage, bumpUsage } from './plans.js';
import { findCandidates, ageFrom } from './matching.js';
import { classifyMessage, AUTO_SUSPEND_REPORTS } from './moderation.js';
import { suggestMessages, ruleBasedSuggestions } from './ai.js';
import { mockCheckout, stripeCheckout, verifyStripeSignature, handleStripeEvent, cancelAtPeriodEnd } from './payments.js';

const here = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(here, '..', 'public');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.json': 'application/json' };
const GESTURES = ['pollice in su', 'mano aperta vicino al viso', 'due dita a V', 'indice sul naso', 'mano sulla testa'];
const GENDERS = ['man', 'woman', 'nonbinary'];
const REPORT_REASONS = ['fake', 'scam', 'harassment', 'inappropriate', 'underage', 'other'];

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
const bad = (msg) => new HttpError(400, msg);

/** Decodifica un data URL immagine verificando i magic bytes (non ci si fida del MIME dichiarato). */
function decodeImage(dataUrl, maxBytes = 3 * 1024 * 1024) {
  const m = /^data:image\/(png|jpeg|webp|svg\+xml);base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl || ''));
  if (!m) throw bad('Immagine non valida (servono PNG, JPEG o WEBP)');
  const buf = Buffer.from(m[2], 'base64');
  if (buf.length > maxBytes) throw bad('Immagine troppo grande (max 3 MB)');
  if (buf[0] === 0x89 && buf.toString('ascii', 1, 4) === 'PNG') return { buf, ext: '.png' };
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { buf, ext: '.jpg' };
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return { buf, ext: '.webp' };
  throw bad('Formato immagine non riconosciuto'); // gli SVG caricati dagli utenti sono rifiutati (rischio XSS)
}

export function createApp({ dbFile = ':memory:', secret = randomBytes(32).toString('hex'), uploadsDir, stripeWebhookSecret } = {}) {
  const db = openDb(dbFile);
  uploadsDir ??= join(here, '..', 'data', 'uploads');
  mkdirSync(uploadsDir, { recursive: true });
  const paymentsProvider = process.env.STRIPE_SECRET_KEY ? 'stripe' : 'mock';
  stripeWebhookSecret ??= process.env.STRIPE_WEBHOOK_SECRET;

  const loginLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 10 });
  const sockets = new Map(); // userId → Set<WebSocket>

  // ---------- helper di dominio ----------
  const now = () => Date.now();
  const getUser = (id) => db.prepare('SELECT * FROM users WHERE id=?').get(id);
  const audit = (actorId, action, targetId, details = {}) =>
    db.prepare('INSERT INTO audit_log(actor_id, action, target_id, details, created_at) VALUES (?,?,?,?,?)').run(actorId, action, targetId, JSON.stringify(details), now());

  function push(userId, event) {
    for (const ws of sockets.get(userId) ?? []) if (ws.readyState === 1) ws.send(JSON.stringify(event));
  }
  function notify(userId, type, payload) {
    const { lastInsertRowid } = db.prepare('INSERT INTO notifications(user_id, type, payload, created_at) VALUES (?,?,?,?)').run(userId, type, JSON.stringify(payload), now());
    push(userId, { type: 'notification', notification: { id: Number(lastInsertRowid), type, payload, created_at: now() } });
    // Qui in produzione: push FCM/APNs se l'utente non ha socket aperti.
  }
  const isBlockedEitherWay = (a, b) => Boolean(db.prepare(
    'SELECT 1 FROM blocks WHERE (blocker_id=? AND blocked_id=?) OR (blocker_id=? AND blocked_id=?)').get(a, b, b, a));

  function photosOf(userId, { includeRejected = false } = {}) {
    return db.prepare(`SELECT id, path, position, moderation FROM photos WHERE user_id=? ${includeRejected ? '' : "AND moderation!='rejected'"} ORDER BY position, id`)
      .all(userId).map((p) => ({ ...p, url: `/uploads/${p.path}` }));
  }

  /** Vista pubblica di un profilo: niente email, niente coordinate esatte. */
  function publicProfile(userId, { distKm } = {}) {
    const p = db.prepare('SELECT * FROM profiles WHERE user_id=?').get(userId);
    if (!p) return null;
    return {
      id: userId, name: p.name, age: ageFrom(p.birthdate), gender: p.gender, bio: p.bio,
      interests: JSON.parse(p.interests), city: p.city, verified: Boolean(p.verified),
      distanceKm: distKm == null ? undefined : Math.max(1, Math.round(distKm)),
      photos: photosOf(userId).map(({ id, url }) => ({ id, url })),
    };
  }

  function matchFor(matchId, userId) {
    const m = db.prepare('SELECT * FROM matches WHERE id=?').get(matchId);
    if (!m || (m.user_a !== userId && m.user_b !== userId)) throw new HttpError(404, 'Match non trovato');
    return { ...m, otherId: m.user_a === userId ? m.user_b : m.user_a };
  }

  function mePayload(user) {
    const plan = effectivePlan(user);
    const p = db.prepare('SELECT * FROM profiles WHERE user_id=?').get(user.id);
    const limits = PLANS[plan];
    return {
      id: user.id, email: user.email, role: user.role, status: user.status,
      plan, planExpiresAt: plan === 'free' ? null : user.plan_expires_at,
      consentAi: Boolean(user.consent_ai_at),
      cancelAtPeriodEnd: Boolean(db.prepare(`SELECT cancel_at_period_end c FROM subscriptions WHERE user_id=? AND status='active'`).get(user.id)?.c),
      limits: {
        likesLeftToday: limits.likesPerDay === Infinity ? null : Math.max(0, limits.likesPerDay - getUsage(db, user.id, 'like')),
        aiLeftToday: limits.aiPerDay === Infinity ? null : Math.max(0, limits.aiPerDay - getUsage(db, user.id, 'ai')),
        messages: 'illimitati',
        seeLikes: limits.seeLikes, advancedFilters: limits.advancedFilters,
      },
      profile: p && { ...p, interests: JSON.parse(p.interests), interested_in: p.interested_in.split(','), age: ageFrom(p.birthdate),
        only_verified: Boolean(p.only_verified), verified: Boolean(p.verified) },
      photos: photosOf(user.id, { includeRejected: true }),
      verification: db.prepare('SELECT status, gesture, created_at FROM verifications WHERE user_id=? ORDER BY id DESC LIMIT 1').get(user.id) ?? null,
    };
  }

  const normInterests = (arr) => [...new Set((Array.isArray(arr) ? arr : []).map((s) => String(s).trim().toLowerCase()).filter((s) => s && s.length <= 30))].slice(0, 12);
  const normGenders = (arr) => {
    const g = (Array.isArray(arr) ? arr : String(arr || '').split(',')).filter((x) => GENDERS.includes(x));
    if (!g.length) throw bad('Indica almeno un genere di interesse');
    return [...new Set(g)].join(',');
  };
  const clampInt = (v, lo, hi, field) => {
    const n = Number(v);
    if (!Number.isInteger(n) || n < lo || n > hi) throw bad(`${field} non valido`);
    return n;
  };

  // ---------- router ----------
  const routes = [];
  const route = (method, pattern, handler, opts = {}) => {
    const keys = [];
    const re = new RegExp('^' + pattern.replace(/:(\w+)/g, (_, k) => { keys.push(k); return '(\\d+)'; }) + '$');
    routes.push({ method, re, keys, handler, auth: opts.auth ?? true, admin: opts.admin ?? false, raw: opts.raw ?? false });
  };

  // --- Auth ---
  route('POST', '/api/auth/register', ({ body }) => {
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const name = String(body.name || '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw bad('Email non valida');
    if (password.length < 10) throw bad('La password deve avere almeno 10 caratteri');
    if (name.length < 2 || name.length > 40) throw bad('Nome non valido');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(body.birthdate))) throw bad('Data di nascita non valida');
    if (ageFrom(body.birthdate) < 18) throw new HttpError(403, "L'app è riservata ai maggiorenni");
    if (!GENDERS.includes(body.gender)) throw bad('Genere non valido');
    const interestedIn = normGenders(body.interested_in);
    if (!body.consent_terms) throw bad('Devi accettare Termini e Privacy');
    if (!body.consent_sensitive) throw bad('Serve il consenso al trattamento dei dati sulle preferenze (art. 9 GDPR)');
    if (db.prepare('SELECT 1 FROM users WHERE email=?').get(email)) throw new HttpError(409, 'Email già registrata');

    const t = now();
    const id = tx(db, () => {
      const { lastInsertRowid } = db.prepare('INSERT INTO users(email, password_hash, consent_sensitive_at, created_at) VALUES (?,?,?,?)')
        .run(email, hashPassword(password), t, t);
      db.prepare(`INSERT INTO profiles(user_id, name, birthdate, gender, interested_in, last_active_at) VALUES (?,?,?,?,?,?)`)
        .run(lastInsertRowid, name, body.birthdate, body.gender, interestedIn, t);
      return Number(lastInsertRowid);
    });
    return { status: 201, json: { token: signToken({ uid: id }, secret), me: mePayload(getUser(id)) } };
  }, { auth: false });

  route('POST', '/api/auth/login', ({ body, ip }) => {
    if (!loginLimiter(ip)) throw new HttpError(429, 'Troppi tentativi, riprova tra qualche minuto');
    const user = db.prepare('SELECT * FROM users WHERE email=?').get(String(body.email || '').trim().toLowerCase());
    if (!user || !verifyPassword(String(body.password || ''), user.password_hash)) throw new HttpError(401, 'Credenziali non valide');
    if (user.status === 'banned' || user.status === 'deleted') throw new HttpError(403, 'Account non attivo');
    return { json: { token: signToken({ uid: user.id }, secret), me: mePayload(user) } };
  }, { auth: false });

  // --- Profilo ---
  route('GET', '/api/me', ({ user }) => ({ json: mePayload(user) }));

  route('PUT', '/api/me/profile', ({ user, body }) => {
    const p = db.prepare('SELECT * FROM profiles WHERE user_id=?').get(user.id);
    const plan = PLANS[effectivePlan(user)];
    const next = {
      name: body.name !== undefined ? String(body.name).trim().slice(0, 40) : p.name,
      bio: body.bio !== undefined ? String(body.bio).slice(0, 500) : p.bio,
      interests: body.interests !== undefined ? JSON.stringify(normInterests(body.interests)) : p.interests,
      city: body.city !== undefined ? String(body.city).slice(0, 60) : p.city,
      lat: body.lat !== undefined ? Number(body.lat) : p.lat,
      lng: body.lng !== undefined ? Number(body.lng) : p.lng,
      max_distance_km: body.max_distance_km !== undefined ? clampInt(body.max_distance_km, 1, 300, 'Distanza') : p.max_distance_km,
      age_min: body.age_min !== undefined ? clampInt(body.age_min, 18, 99, 'Età minima') : p.age_min,
      age_max: body.age_max !== undefined ? clampInt(body.age_max, 18, 99, 'Età massima') : p.age_max,
      interested_in: body.interested_in !== undefined ? normGenders(body.interested_in) : p.interested_in,
      only_verified: body.only_verified !== undefined ? (body.only_verified ? 1 : 0) : p.only_verified,
    };
    if (next.name.length < 2) throw bad('Nome non valido');
    if (next.age_min > next.age_max) throw bad("L'età minima supera la massima");
    if (next.lat != null && (!(Math.abs(next.lat) <= 90) || !(Math.abs(next.lng) <= 180))) throw bad('Posizione non valida');
    if (next.only_verified && !plan.advancedFilters) throw new HttpError(402, 'Il filtro "solo profili verificati" è incluso in Premium e Plus');
    db.prepare(`UPDATE profiles SET name=:name, bio=:bio, interests=:interests, city=:city, lat=:lat, lng=:lng, max_distance_km=:max_distance_km,
                age_min=:age_min, age_max=:age_max, interested_in=:interested_in, only_verified=:only_verified WHERE user_id=:id`).run({ ...next, id: user.id });
    return { json: mePayload(getUser(user.id)) };
  });

  route('PUT', '/api/me/consents', ({ user, body }) => {
    db.prepare('UPDATE users SET consent_ai_at=? WHERE id=?').run(body.ai ? now() : null, user.id);
    return { json: mePayload(getUser(user.id)) };
  });

  route('POST', '/api/me/photos', ({ user, body }) => {
    if (db.prepare('SELECT COUNT(*) n FROM photos WHERE user_id=?').get(user.id).n >= 6) throw bad('Massimo 6 foto');
    const { buf, ext } = decodeImage(body.dataUrl);
    const name = randomBytes(16).toString('hex') + ext;
    writeFileSync(join(uploadsDir, name), buf);
    const pos = db.prepare('SELECT COALESCE(MAX(position)+1,0) p FROM photos WHERE user_id=?').get(user.id).p;
    db.prepare('INSERT INTO photos(user_id, path, position, created_at) VALUES (?,?,?,?)').run(user.id, name, pos, now());
    return { status: 201, json: mePayload(getUser(user.id)) };
  });

  route('DELETE', '/api/me/photos/:id', ({ user, params }) => {
    const ph = db.prepare('SELECT * FROM photos WHERE id=? AND user_id=?').get(params.id, user.id);
    if (!ph) throw new HttpError(404, 'Foto non trovata');
    db.prepare('DELETE FROM photos WHERE id=?').run(ph.id);
    try { unlinkSync(join(uploadsDir, ph.path)); } catch { /* già rimossa */ }
    return { json: mePayload(getUser(user.id)) };
  });

  route('GET', '/api/verification/gesture', () => ({ json: { gesture: GESTURES[randomInt(GESTURES.length)] } }));

  route('POST', '/api/me/verification', ({ user, body }) => {
    if (!GESTURES.includes(body.gesture)) throw bad('Gesto non valido');
    const { buf, ext } = decodeImage(body.dataUrl);
    const name = 'v_' + randomBytes(16).toString('hex') + ext;
    writeFileSync(join(uploadsDir, name), buf);
    db.prepare('INSERT INTO verifications(user_id, gesture, selfie_path, created_at) VALUES (?,?,?,?)').run(user.id, body.gesture, name, now());
    return { status: 201, json: mePayload(getUser(user.id)) };
  });

  // GDPR: portabilità (art. 20) e cancellazione (art. 17)
  route('GET', '/api/me/export', ({ user }) => ({
    json: {
      account: { email: user.email, created_at: user.created_at, plan: effectivePlan(user) },
      profile: db.prepare('SELECT * FROM profiles WHERE user_id=?').get(user.id),
      photos: photosOf(user.id, { includeRejected: true }),
      swipes: db.prepare('SELECT target_id, direction, created_at FROM swipes WHERE swiper_id=?').all(user.id),
      messages_sent: db.prepare('SELECT match_id, body, created_at FROM messages WHERE sender_id=?').all(user.id),
      subscriptions: db.prepare('SELECT plan, status, provider, current_period_end, created_at FROM subscriptions WHERE user_id=?').all(user.id),
    },
  }));

  route('DELETE', '/api/me', ({ user }) => {
    for (const ph of db.prepare('SELECT path FROM photos WHERE user_id=?').all(user.id)) { try { unlinkSync(join(uploadsDir, ph.path)); } catch { /* */ } }
    db.prepare('DELETE FROM users WHERE id=?').run(user.id); // ON DELETE CASCADE su profilo, foto, swipe, match, messaggi
    return { json: { deleted: true } };
  });

  // --- Scoperta e swipe ---
  route('GET', '/api/discover', ({ user }) => {
    const cands = findCandidates(db, user.id, { limit: 20 });
    return {
      json: cands.map((c) => ({
        ...publicProfile(c.userId, { distKm: c.distKm }),
        why: Object.entries(c.parts).filter(([, v]) => v >= 0.5).map(([k]) => k), // spiegabilità
        score: Math.round(c.score * 100) / 100,
      })),
    };
  });

  route('POST', '/api/swipes', ({ user, body }) => {
    const targetId = Number(body.targetId);
    const direction = body.direction;
    if (!['like', 'pass', 'superlike'].includes(direction)) throw bad('Direzione non valida');
    const target = getUser(targetId);
    if (!target || target.id === user.id || target.status !== 'active') throw new HttpError(404, 'Profilo non disponibile');
    if (isBlockedEitherWay(user.id, targetId)) throw new HttpError(404, 'Profilo non disponibile');

    const plan = PLANS[effectivePlan(user)];
    if (direction !== 'pass' && getUsage(db, user.id, 'like') >= plan.likesPerDay)
      throw new HttpError(402, `Hai usato i ${plan.likesPerDay} like di oggi. Domani si ricarica, oppure passa a Premium. I messaggi restano illimitati.`);

    const result = tx(db, () => {
      const ins = db.prepare('INSERT OR IGNORE INTO swipes(swiper_id, target_id, direction, created_at) VALUES (?,?,?,?)').run(user.id, targetId, direction, now());
      if (ins.changes === 0) return { duplicate: true };
      if (direction === 'pass') return {};
      bumpUsage(db, user.id, 'like');
      const reciprocal = db.prepare(`SELECT 1 FROM swipes WHERE swiper_id=? AND target_id=? AND direction IN ('like','superlike')`).get(targetId, user.id);
      if (!reciprocal) return { liked: true };
      const [a, b] = user.id < targetId ? [user.id, targetId] : [targetId, user.id];
      db.prepare('INSERT OR IGNORE INTO matches(user_a, user_b, created_at) VALUES (?,?,?)').run(a, b, now());
      const m = db.prepare('SELECT id FROM matches WHERE user_a=? AND user_b=?').get(a, b);
      return { matchId: m.id };
    });

    if (result.matchId) {
      notify(user.id, 'match', { matchId: result.matchId, userId: targetId, name: publicProfile(targetId).name });
      notify(targetId, 'match', { matchId: result.matchId, userId: user.id, name: publicProfile(user.id).name });
      return { json: { match: { id: result.matchId, profile: publicProfile(targetId) } } };
    }
    if (result.liked && direction === 'superlike') notify(targetId, 'superlike', {});
    return { json: { match: null } };
  });

  route('GET', '/api/likes', ({ user }) => {
    const rows = db.prepare(`SELECT s.swiper_id id FROM swipes s JOIN users u ON u.id=s.swiper_id
      WHERE s.target_id=? AND s.direction IN ('like','superlike') AND u.status='active'
      AND NOT EXISTS (SELECT 1 FROM swipes s2 WHERE s2.swiper_id=? AND s2.target_id=s.swiper_id)
      AND NOT EXISTS (SELECT 1 FROM blocks b WHERE (b.blocker_id=? AND b.blocked_id=s.swiper_id) OR (b.blocker_id=s.swiper_id AND b.blocked_id=?))
      ORDER BY s.created_at DESC`).all(user.id, user.id, user.id, user.id);
    if (!PLANS[effectivePlan(user)].seeLikes) return { json: { count: rows.length, locked: true, profiles: [] } };
    return { json: { count: rows.length, locked: false, profiles: rows.map((r) => publicProfile(r.id)) } };
  });

  // --- Match e chat (messaggi illimitati) ---
  route('GET', '/api/matches', ({ user }) => {
    const rows = db.prepare(`SELECT m.id, m.created_at, CASE WHEN m.user_a=:me THEN m.user_b ELSE m.user_a END other_id,
        (SELECT body FROM messages WHERE match_id=m.id ORDER BY id DESC LIMIT 1) last_body,
        (SELECT created_at FROM messages WHERE match_id=m.id ORDER BY id DESC LIMIT 1) last_at,
        (SELECT COUNT(*) FROM messages WHERE match_id=m.id AND sender_id!=:me AND read_at IS NULL) unread
      FROM matches m WHERE (m.user_a=:me OR m.user_b=:me) AND m.unmatched_at IS NULL
      ORDER BY COALESCE(last_at, m.created_at) DESC`).all({ me: user.id });
    return {
      json: rows.filter((r) => !isBlockedEitherWay(user.id, r.other_id) && getUser(r.other_id)?.status === 'active')
        .map((r) => ({ id: r.id, createdAt: r.created_at, lastMessage: r.last_body, lastAt: r.last_at, unread: r.unread, profile: publicProfile(r.other_id) })),
    };
  });

  route('DELETE', '/api/matches/:id', ({ user, params }) => {
    const m = matchFor(params.id, user.id);
    db.prepare('UPDATE matches SET unmatched_at=? WHERE id=?').run(now(), m.id);
    push(m.otherId, { type: 'unmatch', matchId: m.id });
    return { json: { ok: true } };
  });

  route('GET', '/api/matches/:id/messages', ({ user, params, query }) => {
    const m = matchFor(params.id, user.id);
    const after = Number(query.get('after') || 0);
    const rows = db.prepare('SELECT id, sender_id, body, flagged, created_at, read_at FROM messages WHERE match_id=? AND id>? ORDER BY id LIMIT 500').all(m.id, after);
    return {
      json: {
        profile: publicProfile(m.otherId),
        messages: rows.map((r) => ({ id: r.id, mine: r.sender_id === user.id, body: r.body, createdAt: r.created_at, readAt: r.read_at,
          // l'avviso di sicurezza è mostrato solo a chi RICEVE un messaggio sospetto
          warning: r.flagged && r.sender_id !== user.id ? r.flagged : undefined })),
      },
    };
  });

  route('POST', '/api/matches/:id/messages', ({ user, params, body }) => {
    const m = matchFor(params.id, user.id);
    if (m.unmatched_at) throw new HttpError(410, 'Questo match non è più attivo');
    if (isBlockedEitherWay(user.id, m.otherId)) throw new HttpError(403, 'Non puoi scrivere a questo utente');
    const text = String(body.body || '').trim();
    if (!text) throw bad('Messaggio vuoto');
    if (text.length > 2000) throw bad('Messaggio troppo lungo (max 2000 caratteri)'); // limite tecnico per messaggio, non sul numero
    const flagged = classifyMessage(text);
    const { lastInsertRowid } = db.prepare('INSERT INTO messages(match_id, sender_id, body, flagged, created_at) VALUES (?,?,?,?,?)').run(m.id, user.id, text, flagged, now());
    const msg = { id: Number(lastInsertRowid), matchId: m.id, body: text, createdAt: now() };
    push(m.otherId, { type: 'message', message: { ...msg, mine: false, warning: flagged ?? undefined } });
    push(user.id, { type: 'message', message: { ...msg, mine: true } });
    if (!(sockets.get(m.otherId)?.size)) notify(m.otherId, 'message', { matchId: m.id, from: publicProfile(user.id).name });
    return { status: 201, json: { ...msg, mine: true } };
  });

  route('POST', '/api/matches/:id/read', ({ user, params }) => {
    const m = matchFor(params.id, user.id);
    db.prepare('UPDATE messages SET read_at=? WHERE match_id=? AND sender_id!=? AND read_at IS NULL').run(now(), m.id, user.id);
    push(m.otherId, { type: 'read', matchId: m.id });
    return { json: { ok: true } };
  });

  route('POST', '/api/matches/:id/suggestions', async ({ user, params }) => {
    const m = matchFor(params.id, user.id);
    const plan = PLANS[effectivePlan(user)];
    if (getUsage(db, user.id, 'ai') >= plan.aiPerDay) throw new HttpError(402, `Hai usato i ${plan.aiPerDay} suggerimenti AI di oggi.`);
    const me = publicProfile(user.id), other = publicProfile(m.otherId);
    const history = db.prepare('SELECT sender_id, body FROM messages WHERE match_id=? ORDER BY id DESC LIMIT 6').all(m.id).reverse()
      .map((r) => ({ mine: r.sender_id === user.id, body: r.body }));
    // Senza consenso esplicito all'AI esterna si usano solo le regole locali: nessun dato lascia il server.
    const result = user.consent_ai_at
      ? await suggestMessages({ me, other, history })
      : { source: 'regole', suggestions: ruleBasedSuggestions({ me, other, history }) };
    bumpUsage(db, user.id, 'ai');
    return { json: { ...result, disclaimer: 'Suggerimenti generati automaticamente: modificali con parole tue.' } };
  });

  // --- Sicurezza: blocco e segnalazione ---
  route('POST', '/api/blocks', ({ user, body }) => {
    const id = Number(body.userId);
    if (!getUser(id) || id === user.id) throw new HttpError(404, 'Utente non trovato');
    db.prepare('INSERT OR IGNORE INTO blocks(blocker_id, blocked_id, created_at) VALUES (?,?,?)').run(user.id, id, now());
    return { json: { ok: true } };
  });

  route('POST', '/api/reports', ({ user, body }) => {
    const id = Number(body.userId);
    if (!getUser(id) || id === user.id) throw new HttpError(404, 'Utente non trovato');
    if (!REPORT_REASONS.includes(body.reason)) throw bad('Motivo non valido');
    db.prepare('INSERT INTO reports(reporter_id, reported_id, reason, details, created_at) VALUES (?,?,?,?,?)').run(user.id, id, body.reason, String(body.details || '').slice(0, 1000), now());
    // Chi segnala blocca automaticamente: non deve più vedere né essere contattato da quella persona.
    db.prepare('INSERT OR IGNORE INTO blocks(blocker_id, blocked_id, created_at) VALUES (?,?,?)').run(user.id, id, now());
    const distinct = db.prepare(`SELECT COUNT(DISTINCT reporter_id) n FROM reports WHERE reported_id=? AND status='open'`).get(id).n;
    let autoSuspended = false;
    if ((distinct >= AUTO_SUSPEND_REPORTS || body.reason === 'underage') && getUser(id).status === 'active') {
      db.prepare(`UPDATE users SET status='suspended' WHERE id=?`).run(id);
      audit(null, 'auto_suspend', id, { distinct_reports: distinct, reason: body.reason });
      autoSuspended = true;
    }
    return { status: 201, json: { ok: true, autoSuspended } };
  });

  // --- Notifiche ---
  route('GET', '/api/notifications', ({ user }) => ({
    json: db.prepare('SELECT id, type, payload, created_at, read_at FROM notifications WHERE user_id=? ORDER BY id DESC LIMIT 50').all(user.id)
      .map((n) => ({ ...n, payload: JSON.parse(n.payload) })),
  }));
  route('POST', '/api/notifications/read', ({ user }) => {
    db.prepare('UPDATE notifications SET read_at=? WHERE user_id=? AND read_at IS NULL').run(now(), user.id);
    return { json: { ok: true } };
  });

  // --- Abbonamenti ---
  route('GET', '/api/plans', () => ({
    json: Object.entries(PLANS).map(([id, p]) => ({ id, ...p, likesPerDay: p.likesPerDay === Infinity ? null : p.likesPerDay, aiPerDay: p.aiPerDay === Infinity ? null : p.aiPerDay, messages: 'illimitati' })),
  }), { auth: false });

  route('POST', '/api/billing/checkout', async ({ user, body, origin }) => {
    if (!['premium', 'plus'].includes(body.plan)) throw bad('Piano non valido');
    if (paymentsProvider === 'stripe')
      return { json: await stripeCheckout(user.id, body.plan, { successUrl: `${origin}/#/piani?ok=1`, cancelUrl: `${origin}/#/piani` }) };
    const r = mockCheckout(db, user.id, body.plan);
    notify(user.id, 'subscription', { plan: body.plan });
    return { json: { ...r, me: mePayload(getUser(user.id)) } };
  });

  route('POST', '/api/billing/cancel', ({ user }) => {
    if (!cancelAtPeriodEnd(db, user.id)) throw bad('Nessun abbonamento attivo');
    // Con Stripe: chiamare anche POST /v1/subscriptions/:id con cancel_at_period_end=true.
    return { json: mePayload(getUser(user.id)) };
  });

  route('POST', '/api/billing/stripe-webhook', ({ rawBody, headers }) => {
    if (!verifyStripeSignature(rawBody, headers['stripe-signature'], stripeWebhookSecret)) throw new HttpError(400, 'Firma non valida');
    return { json: { result: handleStripeEvent(db, JSON.parse(rawBody)) } };
  }, { auth: false, raw: true });

  // --- Amministrazione ---
  route('GET', '/api/admin/stats', () => {
    const one = (sql, ...a) => db.prepare(sql).get(...a).n;
    const dayAgo = now() - 24 * 3600 * 1000;
    return {
      json: {
        users: one(`SELECT COUNT(*) n FROM users WHERE role='user'`),
        activeToday: one('SELECT COUNT(*) n FROM profiles WHERE last_active_at > ?', dayAgo),
        paying: one(`SELECT COUNT(*) n FROM users WHERE plan!='free' AND plan_expires_at > ?`, now()),
        premium: one(`SELECT COUNT(*) n FROM users WHERE plan='premium' AND plan_expires_at > ?`, now()),
        plus: one(`SELECT COUNT(*) n FROM users WHERE plan='plus' AND plan_expires_at > ?`, now()),
        matches: one('SELECT COUNT(*) n FROM matches'),
        messages24h: one('SELECT COUNT(*) n FROM messages WHERE created_at > ?', dayAgo),
        openReports: one(`SELECT COUNT(*) n FROM reports WHERE status='open'`),
        pendingVerifications: one(`SELECT COUNT(*) n FROM verifications WHERE status='pending'`),
        flaggedMessages: one('SELECT COUNT(*) n FROM messages WHERE flagged IS NOT NULL'),
        suspended: one(`SELECT COUNT(*) n FROM users WHERE status='suspended'`),
        mrrEur: Math.round((one(`SELECT COUNT(*) n FROM users WHERE plan='premium' AND plan_expires_at > ?`, now()) * 9.99 +
          one(`SELECT COUNT(*) n FROM users WHERE plan='plus' AND plan_expires_at > ?`, now()) * 19.99) * 100) / 100,
      },
    };
  }, { admin: true });

  route('GET', '/api/admin/reports', () => ({
    json: db.prepare(`SELECT r.*, pr.name reported_name, pp.name reporter_name, u.status reported_status,
        (SELECT COUNT(*) FROM reports r2 WHERE r2.reported_id=r.reported_id) total_reports
      FROM reports r JOIN profiles pr ON pr.user_id=r.reported_id JOIN profiles pp ON pp.user_id=r.reporter_id JOIN users u ON u.id=r.reported_id
      ORDER BY (r.status='open') DESC, r.id DESC LIMIT 200`).all(),
  }), { admin: true });

  route('POST', '/api/admin/reports/:id', ({ user, params, body }) => {
    const r = db.prepare('SELECT * FROM reports WHERE id=?').get(params.id);
    if (!r) throw new HttpError(404, 'Segnalazione non trovata');
    if (!['dismiss', 'suspend', 'ban', 'reinstate'].includes(body.action)) throw bad('Azione non valida');
    const resolution = String(body.resolution || '').trim();
    if (!resolution) throw bad('Serve una motivazione (verrà comunicata all\'utente interessato)');
    tx(db, () => {
      const status = { suspend: 'suspended', ban: 'banned', reinstate: 'active' }[body.action];
      if (status) db.prepare('UPDATE users SET status=? WHERE id=?').run(status, r.reported_id);
      db.prepare(`UPDATE reports SET status=?, resolved_by=?, resolution=?, resolved_at=? WHERE reported_id=? AND status='open'`)
        .run(body.action === 'dismiss' || body.action === 'reinstate' ? 'dismissed' : 'actioned', user.id, resolution, now(), r.reported_id);
      audit(user.id, `report_${body.action}`, r.reported_id, { report: r.id, resolution });
    });
    if (body.action !== 'dismiss') notify(r.reported_id, 'moderation', { action: body.action, resolution });
    return { json: { ok: true } };
  }, { admin: true });

  route('GET', '/api/admin/verifications', () => ({
    json: db.prepare(`SELECT v.id, v.user_id, v.gesture, v.status, v.created_at, p.name, '/uploads/' || v.selfie_path selfie_url
      FROM verifications v JOIN profiles p ON p.user_id=v.user_id WHERE v.status='pending' ORDER BY v.id`).all()
      .map((v) => ({ ...v, photos: photosOf(v.user_id).map((p) => p.url) })),
  }), { admin: true });

  route('POST', '/api/admin/verifications/:id', ({ user, params, body }) => {
    const v = db.prepare('SELECT * FROM verifications WHERE id=?').get(params.id);
    if (!v) throw new HttpError(404, 'Richiesta non trovata');
    const approve = Boolean(body.approve);
    tx(db, () => {
      db.prepare('UPDATE verifications SET status=?, reviewed_by=?, reviewed_at=? WHERE id=?').run(approve ? 'approved' : 'rejected', user.id, now(), v.id);
      if (approve) db.prepare('UPDATE profiles SET verified=1 WHERE user_id=?').run(v.user_id);
      audit(user.id, approve ? 'verification_approve' : 'verification_reject', v.user_id, {});
    });
    notify(v.user_id, 'verification', { approved: approve });
    return { json: { ok: true } };
  }, { admin: true });

  route('GET', '/api/admin/flagged', () => ({
    json: db.prepare(`SELECT m.id, m.body, m.flagged, m.created_at, m.sender_id, p.name sender_name, u.status sender_status
      FROM messages m JOIN profiles p ON p.user_id=m.sender_id JOIN users u ON u.id=m.sender_id
      WHERE m.flagged IS NOT NULL ORDER BY m.id DESC LIMIT 100`).all(),
  }), { admin: true });

  route('GET', '/api/admin/users', ({ query }) => {
    const q = `%${(query.get('q') || '').toLowerCase()}%`;
    return {
      json: db.prepare(`SELECT u.id, u.email, u.status, u.plan, u.plan_expires_at, u.created_at, p.name, p.city, p.verified,
          (SELECT COUNT(*) FROM reports r WHERE r.reported_id=u.id) reports
        FROM users u JOIN profiles p ON p.user_id=u.id WHERE u.role='user' AND (lower(u.email) LIKE ? OR lower(p.name) LIKE ?)
        ORDER BY u.id DESC LIMIT 100`).all(q, q),
    };
  }, { admin: true });

  route('POST', '/api/admin/users/:id/status', ({ user, params, body }) => {
    if (!['active', 'suspended', 'banned'].includes(body.status)) throw bad('Stato non valido');
    db.prepare(`UPDATE users SET status=? WHERE id=? AND role='user'`).run(body.status, params.id);
    audit(user.id, 'set_status', Number(params.id), { status: body.status });
    return { json: { ok: true } };
  }, { admin: true });

  route('GET', '/api/admin/photos', () => ({
    json: db.prepare(`SELECT ph.id, ph.user_id, '/uploads/' || ph.path url, ph.created_at, p.name FROM photos ph JOIN profiles p ON p.user_id=ph.user_id
      WHERE ph.moderation='pending' ORDER BY ph.id LIMIT 100`).all(),
  }), { admin: true });

  route('POST', '/api/admin/photos/:id', ({ user, params, body }) => {
    db.prepare('UPDATE photos SET moderation=? WHERE id=?').run(body.approve ? 'approved' : 'rejected', params.id);
    audit(user.id, body.approve ? 'photo_approve' : 'photo_reject', Number(params.id), {});
    return { json: { ok: true } };
  }, { admin: true });

  // ---------- server HTTP ----------
  const SECURITY_HEADERS = {
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'X-Frame-Options': 'DENY',
    'Content-Security-Policy': "default-src 'self'; img-src 'self' data: blob:; connect-src 'self' ws: wss:; style-src 'self'; script-src 'self'; frame-ancestors 'none'",
  };

  function send(res, status, json) {
    const body = JSON.stringify(json);
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...SECURITY_HEADERS });
    res.end(body);
  }

  function serveStatic(res, baseDir, relPath) {
    const safe = normalize(relPath).replace(/^(\.\.[/\\])+/, '');
    const file = join(baseDir, safe);
    if (!file.startsWith(baseDir) || !existsSync(file)) return false;
    try {
      const data = readFileSync(file);
      res.writeHead(200, { 'Content-Type': MIME[extname(file)] ?? 'application/octet-stream', ...SECURITY_HEADERS });
      res.end(data);
      return true;
    } catch { return false; }
  }

  function readBody(req, limit = 6 * 1024 * 1024) {
    return new Promise((resolve, reject) => {
      let size = 0; const chunks = [];
      req.on('data', (c) => { size += c.length; if (size > limit) { reject(new HttpError(413, 'Richiesta troppo grande')); req.destroy(); } else chunks.push(c); });
      req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      req.on('error', reject);
    });
  }

  function authUser(header) {
    const token = String(header || '').replace(/^Bearer /, '');
    const payload = verifyToken(token, secret);
    if (!payload) return null;
    const user = getUser(payload.uid);
    if (!user || user.status === 'banned' || user.status === 'deleted') return null;
    return user;
  }

  const server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    try {
      if (!url.pathname.startsWith('/api/')) {
        if (req.method !== 'GET') return send(res, 405, { error: 'Metodo non consentito' });
        if (url.pathname.startsWith('/uploads/') && serveStatic(res, uploadsDir, url.pathname.slice('/uploads/'.length))) return;
        const rel = url.pathname === '/' ? 'index.html' : url.pathname === '/admin' ? 'admin.html' : url.pathname.slice(1);
        if (serveStatic(res, PUBLIC_DIR, rel)) return;
        return send(res, 404, { error: 'Non trovato' });
      }

      const r = routes.find((x) => x.method === req.method && x.re.test(url.pathname));
      if (!r) return send(res, 404, { error: 'Endpoint inesistente' });
      const m = r.re.exec(url.pathname);
      const params = Object.fromEntries(r.keys.map((k, i) => [k, Number(m[i + 1])]));

      let user = null;
      if (r.auth) {
        user = authUser(req.headers.authorization);
        if (!user) return send(res, 401, { error: 'Accesso richiesto' });
        if (user.status === 'suspended' && !['/api/me', '/api/me/export'].includes(url.pathname))
          return send(res, 403, { error: 'Account sospeso in attesa di verifica da parte del team sicurezza' });
        if (r.admin && user.role !== 'admin') return send(res, 403, { error: 'Solo amministratori' });
        db.prepare('UPDATE profiles SET last_active_at=? WHERE user_id=?').run(now(), user.id);
      }

      const rawBody = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) ? await readBody(req) : '';
      let body = {};
      if (!r.raw && rawBody) {
        try { body = JSON.parse(rawBody); } catch { throw bad('JSON non valido'); }
      }
      const out = await r.handler({
        user, body, rawBody, params, query: url.searchParams, headers: req.headers,
        ip: req.socket.remoteAddress, origin: `http://${req.headers.host}`,
      });
      return send(res, out.status ?? 200, out.json);
    } catch (err) {
      if (err instanceof HttpError) return send(res, err.status, { error: err.message });
      console.error(err);
      return send(res, 500, { error: 'Errore interno' });
    }
  });

  // ---------- WebSocket: eventi in tempo reale (messaggi, match, letture, notifiche, "sta scrivendo") ----------
  const wss = new WebSocketServer({ noServer: true });
  server.on('upgrade', (req, socket, head) => {
    const url = new URL(req.url, 'http://localhost');
    const user = url.pathname === '/ws' ? authUser('Bearer ' + (url.searchParams.get('token') || '')) : null;
    if (!user || user.status !== 'active') { socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n'); socket.destroy(); return; }
    wss.handleUpgrade(req, socket, head, (ws) => {
      if (!sockets.has(user.id)) sockets.set(user.id, new Set());
      sockets.get(user.id).add(ws);
      ws.on('message', (raw) => {
        let ev; try { ev = JSON.parse(String(raw)); } catch { return; }
        if (ev.type === 'typing' && Number.isInteger(ev.matchId)) {
          try { const m = matchFor(ev.matchId, user.id); if (!isBlockedEitherWay(user.id, m.otherId)) push(m.otherId, { type: 'typing', matchId: m.id }); } catch { /* ignora */ }
        }
      });
      ws.on('close', () => { sockets.get(user.id)?.delete(ws); });
      ws.send(JSON.stringify({ type: 'hello', userId: user.id }));
    });
  });

  return {
    server, db,
    listen: (port = 3000, host = '127.0.0.1') => new Promise((resolve) => server.listen(port, host, () => resolve(server.address().port))),
    close: () => new Promise((resolve) => { for (const set of sockets.values()) for (const ws of set) ws.terminate(); wss.close(); server.close(() => { db.close(); resolve(); }); }),
  };
}
