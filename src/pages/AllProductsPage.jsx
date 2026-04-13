import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import ProductGrid from '../components/ProductGrid';
import CartSidebar from '../components/CartSidebar';

const FILTERS = [
  { key: 'all', label: 'All Items' },
  { key: 'lip-care', label: 'Lip Care' },
  { key: 'fragrance', label: 'Fragrance' },
];

export default function AllProductsPage() {
  const [filter, setFilter] = useState('all');

  return (
    <>
      <Header activeCategory={filter} onCategoryChange={setFilter} />

      <div style={{ background: 'var(--white)', padding: '32px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/" style={{ color: 'var(--text-light)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Home
          </Link>
          <span style={{ color: 'var(--border)' }}>›</span>
          <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>All Products</span>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="products-header">
            <div>
              <h2 className="section-title">All Products</h2>
              <p className="section-subtitle">Browse our full collection.</p>
            </div>
            <div className="filter-group" role="group" aria-label="Filter by category">
              {FILTERS.map(({ key, label }) => (
                <button
                  key={key}
                  className={`filter-btn ${filter === key ? 'active' : ''}`}
                  onClick={() => setFilter(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <ProductGrid filter={filter} limit={false} />
        </div>
      </section>

      <CartSidebar />

      <footer>
        <div className="footer-inner">
          <div className="footer-logo">JLC</div>
          <p className="footer-copy">© 2026 JLC. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
