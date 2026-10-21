import { CURRENCY } from '../config';
export { effectivePrice, discountActive } from '../../shared/pricing';

export const fmt = n => CURRENCY + Number(n).toLocaleString('en-NG', { maximumFractionDigits: 0 });
export const fmtKobo = kobo => fmt(kobo / 100);

export const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'lip-care', label: 'Lip Care' },
  { key: 'fragrance', label: 'Fragrance' },
  { key: 'self-care', label: 'Self Care' },
];

export const catLabel = key => CATEGORIES.find(c => c.key === key)?.label || key;

// Product images come from admins; hide broken ones and let the case show through.
export const hideBroken = e => { e.currentTarget.hidden = true; };
