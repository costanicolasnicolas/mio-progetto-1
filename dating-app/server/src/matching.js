/**
 * Algoritmo di matching (v1, spiegabile).
 *
 * 1) FILTRI DURI (mai violati): non se stessi, non già valutati, nessun blocco in nessuna direzione,
 *    account attivo, preferenze di genere RECIPROCHE, età dentro entrambe le forchette,
 *    distanza entro il raggio di chi cerca, filtro "solo verificati" se attivo.
 * 2) PUNTEGGIO (0..1) come somma pesata di segnali normalizzati, restituito con le componenti
 *    per renderlo spiegabile all'utente ("perché vedo questo profilo") e verificabile nei test.
 * 3) EQUITÀ DI ESPOSIZIONE: chi ha ricevuto molti like nelle ultime 24h viene smorzato,
 *    così l'attenzione non si concentra sul 5% dei profili (problema noto delle dating app).
 */

export const WEIGHTS = {
  distance: 0.25,
  interests: 0.30,
  activity: 0.15,
  completeness: 0.10,
  verified: 0.10,
  reciprocity: 0.10,
};

export function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function ageFrom(birthdate, now = new Date()) {
  const b = new Date(birthdate + 'T00:00:00Z');
  let age = now.getUTCFullYear() - b.getUTCFullYear();
  const m = now.getUTCMonth() - b.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < b.getUTCDate())) age -= 1;
  return age;
}

export function jaccard(a, b) {
  const A = new Set(a), B = new Set(b);
  if (A.size === 0 && B.size === 0) return 0;
  let inter = 0;
  for (const x of A) if (B.has(x)) inter += 1;
  return inter / (A.size + B.size - inter);
}

const parseList = (csv) => String(csv || '').split(',').map((s) => s.trim()).filter(Boolean);

/** Punteggio puro (testabile senza DB). */
export function scoreCandidate(me, cand, ctx) {
  const distKm = haversineKm(me.lat, me.lng, cand.lat, cand.lng);
  const distance = Math.max(0, 1 - distKm / Math.max(1, me.max_distance_km));
  const interests = jaccard(JSON.parse(me.interests), JSON.parse(cand.interests));
  const hoursIdle = (ctx.now - cand.last_active_at) / 3.6e6;
  const activity = Math.exp(-hoursIdle / 72); // decadimento: ~0.37 dopo 3 giorni
  const completeness = Math.min(1, (cand.photo_count >= 1 ? 0.4 : 0) + (cand.photo_count >= 3 ? 0.2 : 0) + (cand.bio.length >= 40 ? 0.4 : cand.bio.length / 100));
  const verified = cand.verified ? 1 : 0;
  const reciprocity = cand.liked_me ? 1 : 0;

  const parts = { distance, interests, activity, completeness, verified, reciprocity };
  let score = 0;
  for (const [k, w] of Object.entries(WEIGHTS)) score += w * parts[k];

  // Smorzamento di popolarità: 0 like/24h → ×1.0, 30 like/24h → ×0.5, mai sotto ×0.4.
  const dampening = Math.max(0.4, 1 / (1 + cand.recent_likes / 30));
  return { score: score * dampening, distKm, parts, dampening };
}

export function findCandidates(db, userId, { limit = 20, now = Date.now() } = {}) {
  const me = db.prepare(`SELECT p.*, u.plan, u.plan_expires_at FROM profiles p JOIN users u ON u.id=p.user_id WHERE p.user_id=?`).get(userId);
  if (!me || me.lat == null) return [];
  const myAge = ageFrom(me.birthdate, new Date(now));
  const wanted = parseList(me.interested_in);

  // Prefiltro SQL con bounding box (economico), poi filtro esatto in JS con haversine.
  const dLat = me.max_distance_km / 111;
  const dLng = me.max_distance_km / (111 * Math.max(0.1, Math.cos((me.lat * Math.PI) / 180)));
  const rows = db.prepare(`
    SELECT p.*,
      (SELECT COUNT(*) FROM photos ph WHERE ph.user_id=p.user_id AND ph.moderation!='rejected') AS photo_count,
      EXISTS(SELECT 1 FROM swipes s WHERE s.swiper_id=p.user_id AND s.target_id=:me AND s.direction IN ('like','superlike')) AS liked_me,
      (SELECT COUNT(*) FROM swipes s WHERE s.target_id=p.user_id AND s.direction IN ('like','superlike') AND s.created_at > :since) AS recent_likes
    FROM profiles p JOIN users u ON u.id = p.user_id
    WHERE p.user_id != :me
      AND u.status = 'active'
      AND p.lat BETWEEN :latMin AND :latMax
      AND p.lng BETWEEN :lngMin AND :lngMax
      AND NOT EXISTS (SELECT 1 FROM swipes s WHERE s.swiper_id=:me AND s.target_id=p.user_id)
      AND NOT EXISTS (SELECT 1 FROM blocks b WHERE (b.blocker_id=:me AND b.blocked_id=p.user_id) OR (b.blocker_id=p.user_id AND b.blocked_id=:me))
      AND (:onlyVerified = 0 OR p.verified = 1)
  `).all({
    me: userId, since: now - 24 * 3600 * 1000,
    latMin: me.lat - dLat, latMax: me.lat + dLat, lngMin: me.lng - dLng, lngMax: me.lng + dLng,
    onlyVerified: me.only_verified ? 1 : 0,
  });

  const out = [];
  for (const c of rows) {
    if (!wanted.includes(c.gender)) continue;                         // io cerco il suo genere
    if (!parseList(c.interested_in).includes(me.gender)) continue;    // lui/lei cerca il mio
    const age = ageFrom(c.birthdate, new Date(now));
    if (age < me.age_min || age > me.age_max) continue;
    if (myAge < c.age_min || myAge > c.age_max) continue;
    const s = scoreCandidate(me, c, { now });
    if (s.distKm > me.max_distance_km) continue;
    out.push({ userId: c.user_id, age, ...s });
  }
  out.sort((a, b) => b.score - a.score);
  return out.slice(0, limit);
}
