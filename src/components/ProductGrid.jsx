import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';

const PAGE_SIZE = 8;

export default function ProductGrid({ filter = 'all', limit = true, search = '' }) {
  const { products, loading } = useProducts();
  const { addToCart } = useCart();
  const [flashedId, setFlashedId] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [filter, search]);

  function handleAdd(productId) {
    addToCart(productId, products);
    setFlashedId(productId);
    setTimeout(() => setFlashedId(null), 1000);
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontSize: '15px' }}>
        Loading products…
      </div>
    );
  }

  const filtered = (filter === 'all' ? products : products.filter(p => p.category === filter))
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()));

  if (filtered.length === 0) {
    return (
      <div className="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <p>{search ? `No products found for "${search}".` : 'No products in this category yet.'}</p>
      </div>
    );
  }

  if (limit) {
    const capped = filtered.length > PAGE_SIZE;
    const visible = capped ? filtered.slice(0, PAGE_SIZE) : filtered;
    return (
      <>
        <div className="products-grid">
          {visible.map(p => (
            <ProductCard key={p.id} product={p} flashed={flashedId === p.id} onAddToCart={() => handleAdd(p.id)} />
          ))}
        </div>
        {capped && (
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <Link to="/products" className="btn btn-outline btn-lg" style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
              See All {filtered.length} Products
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </>
    );
  }

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <div className="products-grid">
        {visible.map(p => (
          <ProductCard key={p.id} product={p} flashed={flashedId === p.id} onAddToCart={() => handleAdd(p.id)} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            onClick={() => { setPage(p => p - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            disabled={page === 1}
          >
            ← Prev
          </button>
          <span className="page-info">Page {page} of {totalPages}</span>
          <button
            className="page-btn"
            onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            disabled={page === totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </>
  );
}
