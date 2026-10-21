import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { parseCheckout, priceOrder, toKobo, verifySignature, isReference, parseTrack, phoneMatches, shortCode } from './order.js';

test('tracking lookup validates code and matches phone formats', () => {
  assert.deepEqual(parseTrack({ code: 'jlc-3f2b8c1e', phone: '+234 803 123 4567' }), { code: '3F2B8C1E', phone: '2348031234567' });
  assert.ok(parseTrack({ code: '3F2B', phone: '08031234567' }).error);
  assert.ok(parseTrack({ code: '3F2B8C1E', phone: '12' }).error);
  assert.equal(phoneMatches('+234 803 123 4567', '08031234567'), true);
  assert.equal(phoneMatches('+234 803 123 4567', '08031234568'), false);
  assert.equal(phoneMatches('', ''), false);
  assert.equal(shortCode('3f2b8c1e-9a4d-4c2b-8e1f-0a1b2c3d4e5f'), '3F2B8C1E');
});

const customer = {
  firstName: 'Amaka', lastName: 'Obi', email: 'Amaka@Example.com', phone: '+234 803 123 4567',
  address: '12 Allen Ave', city: 'Ikeja', notes: '', role: 'admin',
};

test('parseCheckout keeps only whitelisted fields and merges duplicate lines', () => {
  const r = parseCheckout({ items: [{ id: 2, qty: 1 }, { id: 2, qty: 2 }], customer, price: 1 });
  assert.deepEqual(r.items, [{ id: 2, qty: 3 }]);
  assert.equal(r.customer.email, 'amaka@example.com');
  assert.equal(r.customer.role, undefined);
});

test('parseCheckout rejects bad input', () => {
  assert.ok(parseCheckout({ items: [], customer }).error);
  assert.ok(parseCheckout({ items: [{ id: 1, qty: 0 }], customer }).error);
  assert.ok(parseCheckout({ items: [{ id: 1, qty: 1.5 }], customer }).error);
  assert.ok(parseCheckout({ items: [{ id: '1; drop', qty: 1 }], customer }).error);
  assert.ok(parseCheckout({ items: [{ id: 1, qty: 15 }, { id: 1, qty: 15 }], customer }).error);
  assert.ok(parseCheckout({ items: [{ id: 1, qty: 1 }], customer: { ...customer, email: 'nope' } }).error);
  assert.ok(parseCheckout(null).error);
});

test('priceOrder uses server prices in integer kobo and checks stock', () => {
  const products = new Map([[1, { name: 'Gloss', price: 4500.5, stock: 3 }], [2, { name: 'Balm', price: 2000, stock: 0 }]]);
  const ok = priceOrder([{ id: 1, qty: 3 }], products);
  assert.equal(ok.totalKobo, 1350150);
  assert.equal(ok.lines[0].unitKobo, 450050);
  assert.match(priceOrder([{ id: 1, qty: 4 }], products).error, /Only 3/);
  assert.match(priceOrder([{ id: 2, qty: 1 }], products).error, /sold out/);
  assert.ok(priceOrder([{ id: 9, qty: 1 }], products).error);
  assert.equal(toKobo(0.1 + 0.2), 30);
});

test('priceOrder applies only active discounts', () => {
  const now = 1_000_000;
  const products = new Map([
    [1, { name: 'Gloss', price: 5000, stock: 9, discountPercent: 20 }],
    [2, { name: 'Balm', price: 3000, stock: 9, discountPercent: 50, discountEndsAt: now - 1 }],
    [3, { name: 'Mist', price: 9999, stock: 9, discountPercent: 95 }],
  ]);
  assert.equal(priceOrder([{ id: 1, qty: 1 }], products, now).totalKobo, 400000);
  assert.equal(priceOrder([{ id: 2, qty: 1 }], products, now).totalKobo, 300000);
  assert.equal(priceOrder([{ id: 3, qty: 1 }], products, now).totalKobo, 999900);
});

test('verifySignature accepts only the exact HMAC-SHA512', () => {
  const body = '{"event":"charge.success"}';
  const sig = createHmac('sha512', 'sk_test_x').update(body).digest('hex');
  assert.equal(verifySignature(body, sig, 'sk_test_x'), true);
  assert.equal(verifySignature(body + ' ', sig, 'sk_test_x'), false);
  assert.equal(verifySignature(body, sig, 'sk_test_y'), false);
  assert.equal(verifySignature(body, 'abc', 'sk_test_x'), false);
  assert.equal(verifySignature(body, null, 'sk_test_x'), false);
});

test('isReference only accepts v4 UUIDs', () => {
  assert.equal(isReference('3f2b8c1e-9a4d-4c2b-8e1f-0a1b2c3d4e5f'), true);
  assert.equal(isReference('../../etc/passwd'), false);
  assert.equal(isReference('ORD-123456'), false);
});
