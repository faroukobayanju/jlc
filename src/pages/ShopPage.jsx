import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Hero from '../components/Hero';
import ProductGrid from '../components/ProductGrid';
import CartSidebar from '../components/CartSidebar';

const FILTERS = [
  { key: 'all', label: 'All Items' },
  { key: 'lip-care', label: 'Lip Care' },
  { key: 'fragrance', label: 'Fragrance' },
  { key: 'self-care', label: 'Self Care' },
];

export default function ShopPage() {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const productsRef = useRef(null);

  function scrollToProducts() {
    productsRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  function handleCategoryChange(cat) {
    setFilter(cat);
    scrollToProducts();
  }

  return (
    <>
      <Header activeCategory={filter} onCategoryChange={handleCategoryChange} />
      <Hero onShopNow={scrollToProducts} />

      <section className="section" id="products" ref={productsRef}>
        <div className="container">
          <div className="products-header">
            <div>
              <h2 className="section-title">Our Collection</h2>
              <p className="section-subtitle">Handpicked with care, delivered with love.</p>
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
          <div className="search-bar-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              className="search-bar-input"
              placeholder="Search products…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')}>×</button>
            )}
          </div>
          <ProductGrid filter={filter} search={search} />
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
