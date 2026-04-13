import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const CATS = [
  { key: 'all', label: 'All' },
  { key: 'lip-care', label: 'Lip Care' },
  { key: 'fragrance', label: 'Fragrance' },
];

export default function Header({ activeCategory, onCategoryChange }) {
  const { cartCount, setIsOpen } = useCart();

  return (
    <header>
      <div className="header-inner">
        <Link to="/" className="logo">JLC</Link>

        <nav className="header-nav" aria-label="Category navigation">
          {CATS.map(({ key, label }) => (
            <button
              key={key}
              className={`nav-pill ${activeCategory === key ? 'active' : ''}`}
              onClick={() => onCategoryChange?.(key)}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="header-actions">
          <button className="cart-btn" onClick={() => setIsOpen(true)} aria-label="Open cart">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 001.98 1.61h9.72a2 2 0 001.98-1.61L23 6H6" />
            </svg>
            Cart
            {cartCount > 0 && (
              <span className="cart-count-badge">{cartCount}</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
