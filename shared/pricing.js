// Shared by the storefront and the server so the price shown is the price charged.
export const MAX_DISCOUNT = 90;

export function discountActive(p, now = Date.now()) {
  const pct = Number(p.discountPercent) || 0;
  return pct > 0 && pct <= MAX_DISCOUNT && (!p.discountEndsAt || now < p.discountEndsAt);
}

// Whole naira, rounded.
export function effectivePrice(p, now = Date.now()) {
  const price = Number(p.price);
  return discountActive(p, now) ? Math.round((price * (100 - p.discountPercent)) / 100) : price;
}
