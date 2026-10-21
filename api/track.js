// POST /api/track { code, phone }: find an order from its short code plus the checkout phone number.
// Returns only the reference, which the order page then loads.
import { MAX_BODY_BYTES, parseTrack, phoneMatches } from './_lib/order.js';
import { getDb, json, ORDERS } from './_lib/server.js';

const NOT_FOUND = 'No order matches that code and phone number.';

export async function POST(request) {
  const self = new URL(request.url).origin;
  const origin = request.headers.get('origin');
  if (origin && origin !== self) return json(403, { error: 'Forbidden.' });
  if (!request.headers.get('content-type')?.startsWith('application/json')) return json(415, { error: 'Expected JSON.' });

  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return json(413, { error: 'Request too large.' });
  let body;
  try { body = JSON.parse(raw); } catch { return json(400, { error: 'Invalid JSON.' }); }

  const parsed = parseTrack(body);
  if (parsed.error) return json(400, { error: parsed.error });

  const snap = await getDb().collection(ORDERS).where('shortCode', '==', parsed.code).limit(5).get();
  const match = snap.docs.find(d => phoneMatches(d.get('customer.phone'), parsed.phone));
  // Same answer for a wrong code and a wrong phone, so neither can be probed on its own.
  if (!match) return json(404, { error: NOT_FOUND });
  return json(200, { reference: match.id });
}
