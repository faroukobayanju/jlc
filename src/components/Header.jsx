import { Link, NavLink, useSearchParams } from 'react-router-dom';
import { ShoppingBag, Package } from '@phosphor-icons/react';
import { useCart } from '../context/CartContext';
import { CATEGORIES } from '../lib/format';

export default function Header({ minimal = false }) {
  const { cartCount, setIsOpen } = useCart();
  const [params] = useSearchParams();
  const active = params.get('c') || 'all';

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link to="/" className="topbar-mark" aria-label="JLC home">
          <img src="/brand/jlc-mark-ink.png" alt="" width="315" height="180" />
        </Link>

        {!minimal && (
          <nav className="topbar-nav" aria-label="Categories">
            {CATEGORIES.map(({ key, label }) => (
              <NavLink
                key={key}
                to={key === 'all' ? '/products' : `/products?c=${key}`}
                className={({ isActive }) => `topbar-link${isActive && active === key ? ' is-active' : ''}`}
              >
                {label}
              </NavLink>
            ))}
          </nav>
        )}

        {!minimal && (
          <div className="topbar-actions">
            <Link to="/track" className="track-link" aria-label="Track order">
              <Package size={20} aria-hidden="true" />
              <span className="track-label">Track order</span>
            </Link>
          <button className="bag-btn" onClick={() => setIsOpen(true)} aria-label={`Open bag, ${cartCount} items`}>
            <ShoppingBag size={20} weight="regular" aria-hidden="true" />
            <span className="bag-label">Bag</span>
            {cartCount > 0 && <span className="bag-count">{cartCount}</span>}
          </button>
          </div>
        )}
      </div>
    </header>
  );
}
