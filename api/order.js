// GET /api/order?reference=<uuid>: order status and delivery progress for the customer's order page.
// Verifies with Paystack while the order is pending, so a delayed webhook does not block the customer.
import { isReference, shortCode } from './_lib/order.js';
import { fulfill, getDb, json, log, paystack, ORDERS } from './_lib/server.js';

const iso = ts => (ts?.toDate ? ts.toDate().toISOString() : null);

export async function GET(request) {
  const reference = new URL(request.url).searchParams.get('reference');
  // Random v4 UUID (122 bits) is the access key; only non-sensitive fields are returned.
  if (!isReference(reference)) return json(400, { error: 'Invalid reference.' });

  const ref = getDb().collection(ORDERS).doc(reference);
  let snap = await ref.get();
  if (!snap.exists) return json(404, { error: 'Order not found.' });

  let paystackStatus = null;
  if (snap.get('status') === 'pending') {
    try {
      const tx = await paystack(`/transaction/verify/${encodeURIComponent(reference)}`);
      paystackStatus = tx.status;
      if (tx.status === 'success') {
        await fulfill(tx);
        snap = await ref.get();
      }
    } catch (err) {
      log('error', 'order.verify_failed', { reference, err: err.message });
    }
  }

  const o = snap.data();
  return json(200, {
    reference,
    code: o.shortCode || shortCode(reference),
    status: o.status,
    paystackStatus,
    deliveryStatus: o.deliveryStatus || null,
    paidAt: iso(o.paidAt),
    sentAt: iso(o.sentAt),
    receivedAt: iso(o.receivedAt),
    firstName: o.customer?.firstName || '',
    city: o.customer?.city || '',
    lines: o.lines.map(l => ({ name: l.name, qty: l.qty, lineKobo: l.lineKobo })),
    totalKobo: o.totalKobo,
  });
}
