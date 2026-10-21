// Shared server plumbing: Firebase Admin, Paystack client, HTTP helpers, fulfilment.
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

let db;
export function getDb() {
  if (db) return db;
  const encoded = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!encoded) throw new Error('FIREBASE_SERVICE_ACCOUNT_BASE64 is not set');
  const app = getApps()[0] || initializeApp({
    credential: cert(JSON.parse(Buffer.from(encoded, 'base64').toString('utf8'))),
  });
  db = getFirestore(app);
  return db;
}

export const ORDERS = 'orders';
export const PRODUCTS = 'store_products';

export function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });
}

export function log(level, msg, fields = {}) {
  console[level === 'error' ? 'error' : 'log'](JSON.stringify({ level, msg, ...fields }));
}

export async function paystack(path, init = {}) {
  const res = await fetch(`https://api.paystack.co${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'content-type': 'application/json',
    },
    signal: AbortSignal.timeout(10_000),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.status) {
    throw new Error(`Paystack ${path} failed: ${res.status} ${body.message || ''}`.trim());
  }
  return body.data;
}

// Idempotent: safe to call from both the webhook and the verify endpoint, any number of times.
// Stock is decremented in the same transaction that marks the order paid.
export async function fulfill(tx) {
  if (tx?.status !== 'success') return null;
  const db = getDb();
  const orderRef = db.collection(ORDERS).doc(String(tx.reference));

  return db.runTransaction(async t => {
    const snap = await t.get(orderRef);
    if (!snap.exists) return null;
    const order = snap.data();
    if (order.status !== 'pending') return order.status;

    if (tx.amount !== order.totalKobo || tx.currency !== order.currency) {
      t.update(orderRef, { status: 'amount_mismatch', paystackAmount: tx.amount, updatedAt: FieldValue.serverTimestamp() });
      return 'amount_mismatch';
    }

    const refs = order.lines.map(l => db.collection(PRODUCTS).doc(String(l.id)));
    const products = await t.getAll(...refs);
    const short = order.lines.filter((l, i) => !products[i].exists || (products[i].get('stock') ?? 0) < l.qty);

    // ponytail: no stock hold during payment; two buyers racing for the last unit both pay
    // and the second is flagged paid_stock_issue for a manual refund. Add reservations if this happens often.
    if (short.length === 0) {
      order.lines.forEach((l, i) => t.update(refs[i], { stock: FieldValue.increment(-l.qty) }));
    }
    const status = short.length === 0 ? 'paid' : 'paid_stock_issue';
    t.update(orderRef, {
      status,
      paidAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      paystack: { id: tx.id ?? null, channel: tx.channel ?? null, paidAt: tx.paid_at ?? null },
    });
    return status;
  });
}
