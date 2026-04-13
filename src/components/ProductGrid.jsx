import { useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from './ProductCard';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';

const PAGE_SIZE = 8;

export default function ProductGrid({ filter = 'all', limit = true }) {
  const { products } = useProducts();
  const { addToCart } = useCart();
  const [flashedId, setFlashedId] = useState(null);

  const filtered = filter === 'all' ? products : products.filter(p => p.category === filter);
  const capped = limit && filtered.length > PAGE_SIZE;
  const visible = capped ? filtered.slice(0, PAGE_SIZE) : filtered;

  function handleAdd(productId) {
    addToCart(productId, products);
    setFlashedId(productId);
    setTimeout(() => setFlashedId(null), 1000);
  }

  if (filtered.length === 0) {
    return (
      <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <p>No products in this category yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="products-grid">
        {visible.map(p => (
          <ProductCard
            key={p.id}
            product={p}
            flashed={flashedId === p.id}
            onAddToCart={() => handleAdd(p.id)}
          />
        ))}
      </div>

      {capped && (
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link
            to="/products"
            className="btn btn-outline btn-lg"
            style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}
          >
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
