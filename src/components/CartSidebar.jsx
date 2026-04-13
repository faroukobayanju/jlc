import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import { CURRENCY } from '../config';

function fmt(n) {
  return CURRENCY + Number(n).toLocaleString('en-NG', { minimumFractionDigits: 0 });
}

export default function CartSidebar() {
  const { cart, isOpen, setIsOpen, setCartQty, getSubtotal } = useCart();
  const { products } = useProducts();
  const subtotal = getSubtotal(products);

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') setIsOpen(false); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [setIsOpen]);

  return (
    <>
      <div
        className={`cart-overlay ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(false)}
      />
      <aside className={`cart-sidebar ${isOpen ? 'open' : ''}`} aria-label="Shopping cart">
        <div className="cart-sidebar-header">
          <h2>Your Cart</h2>
          <button className="cart-close-btn" onClick={() => setIsOpen(false)} aria-label="Close cart">×</button>
        </div>

        <div className="cart-items-list">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 001.98 1.61h9.72a2 2 0 001.98-1.61L23 6H6" />
              </svg>
              <p>Your cart is empty.<br />Add something lovely!</p>
            </div>
          ) : cart.map(item => {
            const p = products.find(pr => pr.id === item.id);
            if (!p) return null;
            return (
              <div className="cart-item" key={item.id}>
                <img
                  className="cart-item-img" src={p.image} alt={p.name}
                  onError={e => { e.target.src = 'https://placehold.co/64x64/E8DDD3/B8926A?text=?'; }}
                />
                <div className="cart-item-info">
                  <div className="cart-item-name">{p.name}</div>
                  <div className="cart-item-price">{fmt(p.price)} each</div>
                </div>
                <div className="cart-item-controls">
                  <div className="cart-item-total">{fmt(p.price * item.qty)}</div>
                  <div className="qty-control">
                    <button className="qty-btn" onClick={() => setCartQty(item.id, item.qty - 1, products)}>−</button>
                    <span className="qty-value">{item.qty}</span>
                    <button className="qty-btn" onClick={() => setCartQty(item.id, item.qty + 1, products)} disabled={item.qty >= p.stock}>+</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="cart-sidebar-footer">
          <div className="cart-total">
            <span>Subtotal</span>
            <span className="cart-total-amount">{fmt(subtotal)}</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.6 }}>
            Shipping fee not included — you will be notified of the delivery charge after placing your order.
          </p>
          {cart.length > 0 && (
            <Link
              to="/checkout"
              className="btn btn-primary btn-full"
              onClick={() => setIsOpen(false)}
            >
              Proceed to Checkout →
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
