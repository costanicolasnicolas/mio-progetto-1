import { test } from 'node:test';
import assert from 'node:assert/strict';
import { haversineKm, jaccard, ageFrom, scoreCandidate } from '../src/matching.js';
import { classifyMessage } from '../src/moderation.js';
import { effectivePlan } from '../src/plans.js';
import { signToken, verifyToken } from '../src/auth.js';
import { ruleBasedSuggestions } from '../src/ai.js';

test('haversine: Catania–Taormina ≈ 41 km in linea d\'aria', () => {
  const d = haversineKm(37.5079, 15.083, 37.8516, 15.2853);
  assert.ok(d > 38 && d < 44, String(d));
});

test('jaccard e età', () => {
  assert.equal(jaccard(['a', 'b'], ['b', 'c']), 1 / 3);
  assert.equal(jaccard([], []), 0);
  assert.equal(ageFrom('2000-06-15', new Date('2026-06-14T12:00:00Z')), 25);
  assert.equal(ageFrom('2000-06-15', new Date('2026-06-15T12:00:00Z')), 26);
});

test('punteggio: interessi comuni e vicinanza contano; la popolarità eccessiva viene smorzata', () => {
  const now = Date.now();
  const me = { lat: 37.85, lng: 15.28, max_distance_km: 50, interests: '["mare","cucina","vino"]' };
  const base = { lat: 37.86, lng: 15.29, interests: '["mare","cucina"]', last_active_at: now, photo_count: 3, bio: 'x'.repeat(60), verified: 1, liked_me: 0, recent_likes: 0 };
  const near = scoreCandidate(me, base, { now });
  const far = scoreCandidate(me, { ...base, lat: 38.2, lng: 15.5 }, { now });
  const noCommon = scoreCandidate(me, { ...base, interests: '["calcio"]' }, { now });
  const popular = scoreCandidate(me, { ...base, recent_likes: 60 }, { now });
  assert.ok(near.score > far.score);
  assert.ok(near.score > noCommon.score);
  assert.ok(popular.score < near.score && popular.dampening >= 0.4);
});

test('moderazione euristica', () => {
  assert.equal(classifyMessage('Ciao! Ti va un caffè sabato?'), null);
  assert.match(classifyMessage('investimento in bitcoin con rendimento garantito'), /investimenti_crypto/);
  assert.match(classifyMessage('chiamami al 333 123 4567'), /numero_telefono/);
});

test('piano scaduto torna Free automaticamente', () => {
  assert.equal(effectivePlan({ plan: 'plus', plan_expires_at: Date.now() - 1 }), 'free');
  assert.equal(effectivePlan({ plan: 'plus', plan_expires_at: Date.now() + 1e6 }), 'plus');
});

test('token: firma e scadenza', () => {
  const t = signToken({ uid: 7 }, 's');
  assert.equal(verifyToken(t, 's').uid, 7);
  assert.equal(verifyToken(t, 'altro-segreto'), null);
  assert.equal(verifyToken(signToken({ uid: 7 }, 's', -1), 's'), null);
});

test('suggerimenti locali usano gli interessi comuni', () => {
  const s = ruleBasedSuggestions({ me: { interests: ['mare'] }, other: { name: 'Sara', interests: ['mare', 'jazz'], city: 'Catania' }, history: [] });
  assert.ok(s.length === 3 && s[0].text.includes('mare'));
});
