import { createHmac, timingSafeEqual } from 'node:crypto';
import { tx } from './db.js';

/**
 * Pagamenti ricorrenti.
 * - Provider "mock" (default in sviluppo): attiva subito l'abbonamento, per provare il flusso end-to-end.
 * - Provider "stripe": crea una Checkout Session in modalità subscription e attiva il piano SOLO
 *   alla ricezione del webhook firmato (mai fidarsi del redirect del browser).
 *   La parte Stripe NON è stata provata contro i server Stripe in questo prototipo: serve un account
 *   e le chiavi di test (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PRICE_PREMIUM, STRIPE_PRICE_PLUS).
 * - App iOS/Android: gli abbonamenti digitali venduti dentro l'app passano di norma dagli acquisti in-app
 *   di Apple/Google (consigliato RevenueCat come strato unico). Verificare le regole vigenti degli store.
 */

const PERIOD_MS = 30 * 24 * 3600 * 1000;

export function activateSubscription(db, { userId, plan, provider, providerRef, periodEnd }) {
  return tx(db, () => {
    db.prepare(`UPDATE subscriptions SET status='canceled' WHERE user_id=? AND status='active'`).run(userId);
    db.prepare(`INSERT INTO subscriptions(user_id, plan, status, provider, provider_ref, current_period_end, created_at)
                VALUES (?,?,?,?,?,?,?)`).run(userId, plan, 'active', provider, providerRef ?? null, periodEnd, Date.now());
    db.prepare('UPDATE users SET plan=?, plan_expires_at=? WHERE id=?').run(plan, periodEnd, userId);
  });
}

/** Disdetta: il piano resta attivo fino a fine periodo già pagato (trasparenza). */
export function cancelAtPeriodEnd(db, userId) {
  return db.prepare(`UPDATE subscriptions SET cancel_at_period_end=1 WHERE user_id=? AND status='active'`).run(userId).changes > 0;
}

export function mockCheckout(db, userId, plan) {
  activateSubscription(db, { userId, plan, provider: 'mock', providerRef: `mock_${Date.now()}`, periodEnd: Date.now() + PERIOD_MS });
  return { mode: 'mock', activated: true };
}

export async function stripeCheckout(userId, plan, { successUrl, cancelUrl }) {
  const price = plan === 'plus' ? process.env.STRIPE_PRICE_PLUS : process.env.STRIPE_PRICE_PREMIUM;
  const body = new URLSearchParams({
    mode: 'subscription',
    'line_items[0][price]': price,
    'line_items[0][quantity]': '1',
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: String(userId),
    'metadata[plan]': plan,
    'subscription_data[metadata][user_id]': String(userId),
    'subscription_data[metadata][plan]': plan,
  });
  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) throw new Error(`Stripe ${res.status}`);
  const session = await res.json();
  return { mode: 'stripe', url: session.url };
}

/** Verifica della firma Stripe-Signature: t=timestamp,v1=HMAC_SHA256(secret, `${t}.${payload}`). */
export function verifyStripeSignature(rawBody, header, secret, toleranceSec = 300, nowSec = Math.floor(Date.now() / 1000)) {
  if (!header || !secret) return false;
  const parts = Object.fromEntries(header.split(',').map((kv) => kv.split('=')).filter((p) => p.length === 2).map(([k, v]) => [k.trim(), v]));
  const sigs = header.split(',').filter((kv) => kv.trim().startsWith('v1=')).map((kv) => kv.trim().slice(3));
  const t = Number(parts.t);
  if (!t || Math.abs(nowSec - t) > toleranceSec || sigs.length === 0) return false;
  const expected = createHmac('sha256', secret).update(`${t}.${rawBody}`).digest();
  return sigs.some((s) => {
    const given = Buffer.from(s, 'hex');
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
}

/** Applica un evento Stripe in modo idempotente. Ritorna 'applied' | 'duplicate' | 'ignored'. */
export function handleStripeEvent(db, event) {
  const seen = db.prepare('SELECT 1 FROM payment_events WHERE provider=? AND event_id=?').get('stripe', event.id);
  if (seen) return 'duplicate';
  db.prepare('INSERT INTO payment_events(provider, event_id, type, created_at) VALUES (?,?,?,?)').run('stripe', event.id, event.type, Date.now());

  const obj = event.data?.object ?? {};
  const meta = obj.metadata ?? {};
  const userId = Number(meta.user_id);
  if (!userId) return 'ignored';

  if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated') {
    const periodEnd = (obj.current_period_end ?? obj.items?.data?.[0]?.current_period_end ?? 0) * 1000;
    if (obj.status === 'active' || obj.status === 'trialing') {
      activateSubscription(db, { userId, plan: meta.plan === 'plus' ? 'plus' : 'premium', provider: 'stripe', providerRef: obj.id, periodEnd });
      return 'applied';
    }
  }
  if (event.type === 'customer.subscription.deleted') {
    db.prepare(`UPDATE subscriptions SET status='expired' WHERE provider_ref=?`).run(obj.id);
    db.prepare(`UPDATE users SET plan='free', plan_expires_at=NULL WHERE id=?`).run(userId);
    return 'applied';
  }
  return 'ignored';
}
