// Pure order logic: input validation, server-side pricing, webhook signature.
// No I/O here so it can be unit tested with `npm test`.
import { createHmac, timingSafeEqual } from 'node:crypto';
import { effectivePrice } from '../../shared/pricing.js';

export const MAX_LINES = 30;
export const MAX_QTY = 20;
export const MAX_BODY_BYTES = 16 * 1024;

const EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/;
const REFERENCE_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

// Trim, strip control characters, cap length. Anything that is not a string becomes ''.
function clean(value, max) {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
}

export function isReference(value) {
  return typeof value === 'string' && REFERENCE_RE.test(value);
}

// Short code printed for customers: first 8 hex chars of the reference.
export const shortCode = reference => reference.slice(0, 8).toUpperCase();

// Tracking lookup needs the short code and the phone used at checkout.
export function parseTrack(body) {
  const code = typeof body?.code === 'string' ? body.code.trim().toUpperCase().replace(/^JLC-?/, '') : '';
  const phone = typeof body?.phone === 'string' ? body.phone.replace(/\D/g, '') : '';
  if (!/^[0-9A-F]{8}$/.test(code)) return { error: 'Enter the 8-character order code, for example JLC-3F2B8C1E.' };
  if (phone.length < 7 || phone.length > 15) return { error: 'Enter the phone number you used at checkout.' };
  return { code, phone };
}

// Compare the last 7 digits so +234 803... and 0803... both match.
export function phoneMatches(stored, given) {
  const a = String(stored || '').replace(/\D/g, '').slice(-7);
  const b = String(given || '').replace(/\D/g, '').slice(-7);
  return a.length === 7 && a === b;
}

// Returns { items, customer } or { error }. Only whitelisted fields survive (no mass assignment).
export function parseCheckout(body) {
  if (!body || typeof body !== 'object') return { error: 'Invalid request.' };
  const { items, customer } = body;

  if (!Array.isArray(items) || items.length === 0) return { error: 'Your cart is empty.' };
  if (items.length > MAX_LINES) return { error: 'Too many items in one order.' };

  const merged = new Map();
  for (const item of items) {
    const id = Number(item?.id);
    const qty = Number(item?.qty);
    if (!Number.isSafeInteger(id) || id <= 0) return { error: 'Invalid product in cart.' };
    if (!Number.isSafeInteger(qty) || qty < 1 || qty > MAX_QTY) return { error: 'Invalid quantity in cart.' };
    merged.set(id, (merged.get(id) || 0) + qty);
  }
  for (const qty of merged.values()) if (qty > MAX_QTY) return { error: 'Invalid quantity in cart.' };

  const c = customer && typeof customer === 'object' ? customer : {};
  const out = {
    firstName: clean(c.firstName, 60),
    lastName: clean(c.lastName, 60),
    email: clean(c.email, 120).toLowerCase(),
    phone: clean(c.phone, 25),
    address: clean(c.address, 200),
    city: clean(c.city, 60),
    notes: clean(c.notes, 500),
  };
  if (!out.firstName || !out.lastName) return { error: 'Name is required.' };
  if (!EMAIL_RE.test(out.email)) return { error: 'A valid email is required for card payment.' };
  const digits = out.phone.replace(/\D/g, '');
  if (digits.length < 7 || digits.length > 15) return { error: 'A valid phone number is required.' };
  if (!out.address || !out.city) return { error: 'Delivery address and city are required.' };

  return { items: [...merged].map(([id, qty]) => ({ id, qty })), customer: out };
}

// Naira (number) to kobo (integer). Money never travels as a float past this point.
export function toKobo(naira) {
  const n = Number(naira);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

// products: Map<id, { name, price, stock, discountPercent?, discountEndsAt? }> loaded from Firestore on the server.
export function priceOrder(items, products, now = Date.now()) {
  const lines = [];
  let totalKobo = 0;
  for (const { id, qty } of items) {
    const p = products.get(id);
    if (!p) return { error: 'A product in your cart is no longer available.' };
    const unitKobo = toKobo(effectivePrice(p, now));
    if (unitKobo === null || unitKobo === 0) return { error: `${p.name} cannot be bought online right now.` };
    if (!Number.isInteger(p.stock) || p.stock < qty) {
      return { error: p.stock > 0 ? `Only ${p.stock} of ${p.name} left.` : `${p.name} is sold out.` };
    }
    const lineKobo = unitKobo * qty;
    totalKobo += lineKobo;
    lines.push({ id, name: String(p.name).slice(0, 100), qty, unitKobo, lineKobo });
  }
  if (!Number.isSafeInteger(totalKobo) || totalKobo < 100) return { error: 'Order total is invalid.' };
  return { lines, totalKobo };
}

// Paystack signs the raw body with HMAC-SHA512 using the secret key.
export function verifySignature(rawBody, signature, secret) {
  if (!signature || !secret) return false;
  const expected = createHmac('sha512', secret).update(rawBody).digest();
  let given;
  try { given = Buffer.from(signature, 'hex'); } catch { return false; }
  return given.length === expected.length && timingSafeEqual(given, expected);
}
