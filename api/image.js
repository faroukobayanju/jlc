// GET /api/image?id=<productId>&v=<hash>: one product photo as a real image file, cached for a year.
import { getDb, PRODUCTS } from './_lib/server.js';

const DATA_URL_RE = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/;

export async function GET(request) {
  const id = new URL(request.url).searchParams.get('id') || '';
  if (!/^\d{1,9}$/.test(id)) return new Response('Bad id', { status: 400 });

  const snap = await getDb().collection(PRODUCTS).doc(id).get();
  const match = DATA_URL_RE.exec(snap.exists ? snap.get('image') || '' : '');
  if (!match) return new Response('Not found', { status: 404, headers: { 'cache-control': 'public, s-maxage=60' } });

  return new Response(Buffer.from(match[2], 'base64'), {
    headers: {
      'content-type': match[1],
      'cache-control': 'public, max-age=31536000, immutable',
      'x-content-type-options': 'nosniff',
    },
  });
}
