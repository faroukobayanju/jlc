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
          <ProductGrid filter={filter} />
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
