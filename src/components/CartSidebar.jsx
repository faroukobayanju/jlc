import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { X, Plus, Minus, ShoppingBag } from '@phosphor-icons/react';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import { fmt, hideBroken, effectivePrice } from '../lib/format';
import DeliveryNote from './DeliveryNote';

export default function CartSidebar() {
  const { cart, isOpen, setIsOpen, setCartQty, getSubtotal } = useCart();
  const { products } = useProducts();
  const subtotal = getSubtotal(products);
  const closeRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    closeRef.current?.focus();
    function onKey(e) { if (e.key === 'Escape') setIsOpen(false); }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, setIsOpen]);

  const lines = cart
    .map(item => ({ item, p: products.find(pr => pr.id === item.id) }))
    .filter(l => l.p);

  return (
    <>
      <div className={`scrim${isOpen ? ' is-open' : ''}`} onClick={() => setIsOpen(false)} aria-hidden="true" />
      <aside
        className={`bag${isOpen ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bag-title"
        inert={isOpen ? undefined : ''}
      >
        <div className="bag-head">
          <h2 id="bag-title" className="display bag-title">Your bag</h2>
          <button ref={closeRef} className="icon-btn" onClick={() => setIsOpen(false)} aria-label="Close bag">
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <div className="bag-lines">
          {lines.length === 0 ? (
            <div className="bag-empty">
              <ShoppingBag size={36} weight="thin" aria-hidden="true" />
              <p>Your bag is empty.</p>
              <Link to="/products" className="text-link" onClick={() => setIsOpen(false)}>Browse products</Link>
            </div>
          ) : lines.map(({ item, p }) => (
            <div className="bag-line" key={item.id}>
              <img className="bag-img" src={p.image} alt="" onError={hideBroken} />
              <div className="bag-info">
                <span className="bag-name">{p.name}</span>
                <span className="bag-each">{fmt(effectivePrice(p))} each</span>
                <div className="qty" role="group" aria-label={`Quantity of ${p.name}`}>
                  <button className="qty-btn" onClick={() => setCartQty(item.id, item.qty - 1, products)}
                    aria-label={item.qty === 1 ? `Remove ${p.name}` : `One less ${p.name}`}>
                    <Minus size={14} aria-hidden="true" />
                  </button>
                  <span className="qty-val" aria-live="polite">{item.qty}</span>
                  <button className="qty-btn" onClick={() => setCartQty(item.id, item.qty + 1, products)}
                    disabled={item.qty >= p.stock} aria-label={`One more ${p.name}`}>
                    <Plus size={14} aria-hidden="true" />
                  </button>
                </div>
              </div>
              <span className="bag-total">{fmt(effectivePrice(p) * item.qty)}</span>
            </div>
          ))}
        </div>

        {lines.length > 0 && (
          <div className="bag-foot">
            <div className="bag-sum">
              <span>Subtotal</span>
              <span className="price">{fmt(subtotal)}</span>
            </div>
            <DeliveryNote compact />
            <Link to="/checkout" className="btn btn-solid btn-block" onClick={() => setIsOpen(false)}>
              Checkout
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
