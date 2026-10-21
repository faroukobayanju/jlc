import { useEffect, useRef, useState } from 'react';
import { Plus, Check } from '@phosphor-icons/react';
import { useSwatch } from '../lib/swatch';
import { fmt, hideBroken, effectivePrice, discountActive } from '../lib/format';

// Current price, with the original struck through while a discount runs.
export function Price({ product: p, className = 'price' }) {
  if (!discountActive(p)) return <span className={className}>{fmt(p.price)}</span>;
  return (
    <span className={`${className} is-sale`}>
      <span className="sr-only">Now </span>{fmt(effectivePrice(p))}
      <s className="was"><span className="sr-only">, was </span>{fmt(p.price)}</s>
      <span className="sale-tag">-{p.discountPercent}%</span>
    </span>
  );
}

// Briefly marks a product as added; clears its timer on unmount.
export function useAddFlash() {
  const [id, setId] = useState(null);
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);
  function flash(productId) {
    setId(productId);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setId(null), 1200);
  }
  return [id, flash];
}

export default function ProductCard({ product: p, onAddToCart, flashed }) {
  const [swatch, onLoad] = useSwatch(p.id);
  const outOfStock = p.stock === 0;
  const lowStock = p.stock > 0 && p.stock <= 5;

  return (
    <article className={`pcard${outOfStock ? ' is-out' : ''}`} style={swatch ? { '--swatch': swatch } : undefined}>
      <div className="pcard-case">
        <img src={p.image} alt={p.name} loading="lazy" decoding="async" onLoad={onLoad} onError={hideBroken} />
      </div>
      <div className="pcard-body">
        <h3 className="pcard-name">{p.name}</h3>
        {p.description && <p className="pcard-desc">{p.description}</p>}
        <div className="pcard-foot">
          <Price product={p} />
          {outOfStock ? (
            <span className="pcard-out">Sold out</span>
          ) : (
            <button className={`add-btn${flashed ? ' is-added' : ''}`} onClick={onAddToCart} aria-label={`Add ${p.name} to bag`}>
              {flashed ? <Check size={16} weight="bold" aria-hidden="true" /> : <Plus size={16} weight="bold" aria-hidden="true" />}
              <span>{flashed ? 'Added' : 'Add'}</span>
            </button>
          )}
        </div>
        {lowStock && <p className="pcard-stock">Only {p.stock} left</p>}
      </div>
    </article>
  );
}
