import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, ArrowUpRight } from '@phosphor-icons/react';
import ProductCard, { useAddFlash } from './ProductCard';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';

const PAGE_SIZE = 8;

export default function ProductGrid({ filter = 'all', limit = true, search = '' }) {
  const { products, loading } = useProducts();
  const { addToCart } = useCart();
  const [flashedId, flash] = useAddFlash();
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [filter, search]);

  function handleAdd(productId) {
    addToCart(productId, products);
    flash(productId);
  }

  if (loading) {
    return (
      <div className="grid" aria-busy="true" aria-label="Loading products">
        {Array.from({ length: 4 }, (_, i) => <div key={i} className="pcard pcard-skeleton" />)}
      </div>
    );
  }

  const q = search.trim().toLowerCase();
  const filtered = products
    .filter(p => filter === 'all' || p.category === filter)
    .filter(p => !q || p.name.toLowerCase().includes(q));

  if (filtered.length === 0) {
    return (
      <div className="empty">
        <p>{q ? `Nothing matches "${search.trim()}".` : 'Nothing in this category yet.'}</p>
        <Link to="/products" className="text-link">See everything</Link>
      </div>
    );
  }

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const current = limit ? 1 : Math.min(page, totalPages);
  const visible = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  function go(next) {
    setPage(next);
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <>
      <div className="grid">
        {visible.map(p => (
          <ProductCard key={p.id} product={p} flashed={flashedId === p.id} onAddToCart={() => handleAdd(p.id)} />
        ))}
      </div>

      {limit && filtered.length > PAGE_SIZE && (
        <div className="grid-more">
          <Link to="/products" className="btn btn-ghost">
            See all {filtered.length} products <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
      )}

      {!limit && totalPages > 1 && (
        <nav className="pager" aria-label="Pagination">
          <button className="btn btn-ghost" onClick={() => go(current - 1)} disabled={current === 1}>
            <ArrowLeft size={16} aria-hidden="true" /> Previous
          </button>
          <span className="pager-info">Page {current} of {totalPages}</span>
          <button className="btn btn-ghost" onClick={() => go(current + 1)} disabled={current === totalPages}>
            Next <ArrowRight size={16} aria-hidden="true" />
          </button>
        </nav>
      )}
    </>
  );
}
