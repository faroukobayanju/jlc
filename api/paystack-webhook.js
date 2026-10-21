// POST /api/paystack-webhook: Paystack calls this on payment events. Signature-verified, idempotent.
import { verifySignature } from './_lib/order.js';
import { fulfill, json, log } from './_lib/server.js';

export async function POST(request) {
  const raw = await request.text();
  if (raw.length > 256 * 1024) return json(413, { error: 'Too large.' });
  if (!verifySignature(raw, request.headers.get('x-paystack-signature'), process.env.PAYSTACK_SECRET_KEY)) {
    log('error', 'webhook.bad_signature');
    return json(401, { error: 'Invalid signature.' });
  }

  let event;
  try { event = JSON.parse(raw); } catch { return json(400, { error: 'Invalid JSON.' }); }

  if (event.event === 'charge.success') {
    try {
      const status = await fulfill(event.data);
      log('info', 'webhook.charge_success', { reference: event.data?.reference, status });
    } catch (err) {
      // Non-2xx makes Paystack retry later; fulfil is idempotent so retries are safe.
      log('error', 'webhook.fulfill_failed', { reference: event.data?.reference, err: err.message });
      return json(500, { error: 'Retry later.' });
    }
  }
  return json(200, { received: true });
}
