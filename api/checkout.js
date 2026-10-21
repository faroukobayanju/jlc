// POST /api/checkout: price the cart on the server, store a pending order, start a Paystack transaction.
import { randomUUID } from 'node:crypto';
import { FieldValue } from 'firebase-admin/firestore';
import { MAX_BODY_BYTES, parseCheckout, priceOrder, shortCode } from './_lib/order.js';
import { getDb, json, log, paystack, ORDERS, PRODUCTS } from './_lib/server.js';

export async function POST(request) {
  const self = new URL(request.url).origin;
  // CSRF: only our own pages may call this. No CORS headers are sent, so other origins can't read responses either.
  const origin = request.headers.get('origin');
  if (origin && origin !== self) return json(403, { error: 'Forbidden.' });
  if (!request.headers.get('content-type')?.startsWith('application/json')) return json(415, { error: 'Expected JSON.' });
  if (Number(request.headers.get('content-length') || 0) > MAX_BODY_BYTES) return json(413, { error: 'Request too large.' });

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return json(413, { error: 'Request too large.' });
  let body;
  try { body = JSON.parse(raw); } catch { return json(400, { error: 'Invalid JSON.' }); }

  const parsed = parseCheckout(body);
  if (parsed.error) return json(400, { error: parsed.error });

  const db = getDb();
  // One round trip for every product in the cart (no N+1).
  const snaps = await db.getAll(...parsed.items.map(i => db.collection(PRODUCTS).doc(String(i.id))));
  const products = new Map(snaps.filter(s => s.exists).map(s => [Number(s.id), s.data()]));

  const priced = priceOrder(parsed.items, products);
  if (priced.error) return json(409, { error: priced.error });

  const reference = randomUUID();
  const orderRef = db.collection(ORDERS).doc(reference);
  await orderRef.set({
    reference,
    shortCode: shortCode(reference),
    status: 'pending',
    channel: 'paystack',
    currency: 'NGN',
    lines: priced.lines,
    totalKobo: priced.totalKobo,
    customer: parsed.customer,
    createdAt: FieldValue.serverTimestamp(),
  });

  // Callback URL comes from config, never from request headers.
  const appUrl = (process.env.APP_URL || self).replace(/\/$/, '');
  try {
    const tx = await paystack('/transaction/initialize', {
      method: 'POST',
      body: JSON.stringify({
        email: parsed.customer.email,
        amount: priced.totalKobo,
        currency: 'NGN',
        reference,
        callback_url: `${appUrl}/order/${reference}`,
        metadata: { orderId: reference },
      }),
    });
    log('info', 'checkout.initialized', { reference, totalKobo: priced.totalKobo });
    return json(200, { authorizationUrl: tx.authorization_url, reference });
  } catch (err) {
    log('error', 'checkout.paystack_failed', { reference, err: err.message });
    await orderRef.update({ status: 'init_failed', updatedAt: FieldValue.serverTimestamp() });
    return json(502, { error: 'Could not reach Paystack. Please try again in a moment.' });
  }
}
