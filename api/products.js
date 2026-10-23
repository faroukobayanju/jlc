// GET /api/products: the storefront catalog without image bytes, cached at Vercel's CDN.
// Admin-uploaded photos are stored as data URLs inside each product doc; sending them here made the
// catalog ~2 MB before anything could render. They are served one by one from /api/image instead.
import { createHash } from 'node:crypto';
import { getDb, json, PRODUCTS } from './_lib/server.js';

const FIELDS = ['name', 'category', 'description', 'price', 'stock', 'discountPercent', 'discountEndsAt'];

export const imageVersion = image => createHash('sha1').update(image).digest('hex').slice(0, 12);

export async function GET() {
  const snap = await getDb().collection(PRODUCTS).get();
  const products = snap.docs.map(d => {
    const data = d.data();
    const p = { id: Number(data.id ?? d.id) };
    for (const f of FIELDS) if (data[f] !== undefined) p[f] = data[f];
    const image = typeof data.image === 'string' ? data.image : '';
    // Versioned URL: a new photo gets a new URL, so the image itself can be cached forever.
    p.image = image.startsWith('data:') ? `/api/image?id=${encodeURIComponent(d.id)}&v=${imageVersion(image)}` : image;
    return p;
  }).sort((a, b) => a.id - b.id);

  const res = json(200, { products });
  // ponytail: stock and price shown can lag admin edits by up to a minute; checkout re-checks both on the server.
  res.headers.set('cache-control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=86400');
  return res;
}
