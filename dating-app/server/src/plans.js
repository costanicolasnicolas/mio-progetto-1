/**
 * Piani e limiti. Principio di prodotto: i MESSAGGI non sono mai limitati, in nessun piano.
 * Si paga per strumenti in più (vedere chi ti ha messo like, filtri avanzati, AI), non per parlare.
 * Prezzi IVA inclusa (consumatore italiano).
 */
export const PLANS = {
  free:    { label: 'Free',    priceEurMonth: 0,     likesPerDay: 40,       aiPerDay: 3,        seeLikes: false, advancedFilters: false, boostsPerMonth: 0 },
  premium: { label: 'Premium', priceEurMonth: 9.99,  likesPerDay: Infinity, aiPerDay: 20,       seeLikes: true,  advancedFilters: true,  boostsPerMonth: 1 },
  plus:    { label: 'Plus',    priceEurMonth: 19.99, likesPerDay: Infinity, aiPerDay: Infinity, seeLikes: true,  advancedFilters: true,  boostsPerMonth: 4 },
};

export const MESSAGE_LIMIT = Infinity; // dichiarato esplicitamente: nessun limite artificiale.

/** Piano effettivo: un piano scaduto torna Free senza bisogno di job esterni. */
export function effectivePlan(user, now = Date.now()) {
  if (user.plan !== 'free' && user.plan_expires_at && user.plan_expires_at > now) return user.plan;
  return 'free';
}

export function today(now = Date.now()) {
  return new Date(now).toISOString().slice(0, 10);
}

export function getUsage(db, userId, kind, now = Date.now()) {
  const row = db.prepare('SELECT count FROM usage_counters WHERE user_id=? AND day=? AND kind=?').get(userId, today(now), kind);
  return row ? row.count : 0;
}

export function bumpUsage(db, userId, kind, now = Date.now()) {
  db.prepare(`INSERT INTO usage_counters(user_id, day, kind, count) VALUES (?,?,?,1)
              ON CONFLICT(user_id, day, kind) DO UPDATE SET count = count + 1`).run(userId, today(now), kind);
}
