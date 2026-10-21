import { Link } from 'react-router-dom';
import { ArrowRight } from '@phosphor-icons/react';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useSwatch } from '../lib/swatch';
import { hideBroken, CATEGORIES } from '../lib/format';
import { useAddFlash, Price } from './ProductCard';

const ON_COUNTER = 6;

function CounterItem({ product: p, onAdd, added }) {
  const [swatch, onLoad] = useSwatch(p.id);
  return (
    <li className="ctr-item glass" style={swatch ? { '--swatch': swatch } : undefined}>
      <div className="ctr-stand">
        <img className="ctr-img" src={p.image} alt={p.name} onLoad={onLoad} onError={hideBroken} decoding="async" />
      </div>
      <div className="ctr-meta">
        <span className="ctr-name">{p.name}</span>
        <Price product={p} className="ctr-price" />
      </div>
      <button className={`add-btn add-btn-block${added ? ' is-added' : ''}`} onClick={onAdd} aria-label={`Add ${p.name} to bag`}>
        {added ? 'Added' : 'Add to bag'}
      </button>
    </li>
  );
}

export default function Hero() {
  const { products, loading } = useProducts();
  const { addToCart } = useCart();
  const [flashed, flash] = useAddFlash();
  const onCounter = products.filter(p => p.stock > 0).slice(0, ON_COUNTER);

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-top">
        <div className="hero-copy">
          <h1 id="hero-title" className="display hero-title">Lip care and fragrance, picked by Jay.</h1>
          <p className="hero-sub">Glosses, balms, tints, perfumes and little self-care treats, hand-picked by Jay for soft lips and a good scent.</p>
          <div className="hero-actions">
            <Link to="/products" className="btn btn-primary btn-lg">
              Shop all <ArrowRight size={18} weight="bold" aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className="hero-mark glass glass-strong">
          <img src="/brand/jlc-wordmark-ink-lg.png" alt="jlc, Jay's Lip Care and more" width="1260" height="720" fetchpriority="high" />
          <ul className="hero-facts" aria-label="Shop by category">
            {CATEGORIES.filter(c => c.key !== 'all').map(c => (
              <li key={c.key}>
                <Link to={`/products?c=${c.key}`}>
                  <span>{c.label}</span>
                  <span className="hero-fact-count">
                    {loading ? '' : `${products.filter(p => p.category === c.key && p.stock > 0).length} in stock`}
                    <ArrowRight size={14} weight="bold" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="counter">
        {loading ? (
          <ul className="ctr-row" aria-busy="true" aria-label="Loading products">
            {Array.from({ length: 4 }, (_, i) => <li key={i} className="ctr-item glass ctr-skeleton" />)}
          </ul>
        ) : onCounter.length === 0 ? (
          <p className="ctr-empty glass">New stock is on the way. Message Jay on WhatsApp to ask what is coming.</p>
        ) : (
          <ul className="ctr-row" aria-label="In stock now">
            {onCounter.map(p => (
              <CounterItem
                key={p.id}
                product={p}
                added={flashed === p.id}
                onAdd={() => { addToCart(p.id, products); flash(p.id); }}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
