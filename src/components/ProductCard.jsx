import { CURRENCY } from '../config';

function formatPrice(n) {
  return CURRENCY + Number(n).toLocaleString('en-NG', { minimumFractionDigits: 0 });
}

const CAT_LABEL = { 'lip-care': 'Lip Care', 'fragrance': 'Fragrance' };

export default function ProductCard({ product: p, onAddToCart, flashed }) {
  const outOfStock = p.stock === 0;
  const lowStock = p.stock > 0 && p.stock <= 5;

  return (
    <div className="product-card" data-product-id={p.id}>
      <div className="product-image-wrap">
        <img
          src={p.image} alt={p.name} loading="lazy"
          onError={e => { e.target.src = 'https://placehold.co/400x400/E8DDD3/B8926A?text=?'; }}
        />
        <span className={`product-badge badge-${p.category}`}>
          {CAT_LABEL[p.category] || p.category}
        </span>
        {outOfStock && <span className="out-of-stock-badge">Sold Out</span>}
      </div>

      <div className="product-info">
        <div className="product-name">{p.name}</div>
        <div className="product-desc">{p.description}</div>
        <div className="product-footer">
          <div className="product-price">{formatPrice(p.price)}</div>
          <button
            className="add-to-cart-btn"
            onClick={onAddToCart}
            disabled={outOfStock}
            style={flashed ? { background: '#4CAF50' } : undefined}
            aria-label={`Add ${p.name} to cart`}
          >
            {flashed ? 'Added!' : outOfStock ? 'Sold Out' : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 001.98 1.61h9.72a2 2 0 001.98-1.61L23 6H6" />
                </svg>
                Add
              </>
            )}
          </button>
        </div>
        {lowStock && <div className="product-stock stock-low">Only {p.stock} left</div>}
        {outOfStock && <div className="product-stock">Currently unavailable</div>}
      </div>
    </div>
  );
}
