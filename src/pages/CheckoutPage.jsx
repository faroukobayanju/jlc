import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import { STORE_NAME, WHATSAPP_NUMBER, CURRENCY } from '../config';

function fmt(n) {
  return CURRENCY + Number(n).toLocaleString('en-NG', { minimumFractionDigits: 0 });
}

function Header() {
  return (
    <header>
      <div className="header-inner">
        <Link to="/" className="logo">JLC</Link>
        <div />
        <div className="header-actions">
          <Link to="/" className="btn btn-ghost btn-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to shop
          </Link>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-logo">JLC</div>
        <div className="footer-links"><Link to="/">Shop</Link></div>
        <p className="footer-copy">© 2026 JLC. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default function CheckoutPage() {
  const { cart, getSubtotal, clearCart } = useCart();
  const { products } = useProducts();
  const subtotal = getSubtotal(products);

  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', email: '',
    address: '', city: '', notes: '',
  });
  const [error, setError] = useState('');
  const [ordered, setOrdered] = useState(false);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function validate() {
    const checks = [
      [form.firstName, 'First name'],
      [form.lastName, 'Last name'],
      [form.phone, 'Phone number'],
      [form.address, 'Delivery address'],
      [form.city, 'City'],
    ];
    for (const [val, label] of checks) {
      if (!val.trim()) return `${label} is required.`;
    }
    if (form.phone.trim().replace(/[\s\-\+\(\)]/g, '').length < 7) {
      return 'Please enter a valid phone number.';
    }
    return null;
  }

  function placeOrder() {
    setError('');
    if (cart.length === 0) { setError('Your cart is empty.'); return; }
    const err = validate();
    if (err) { setError(err); return; }

    const ref = 'ORD-' + Date.now().toString().slice(-6);
    const date = new Date().toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' });

    let itemLines = '', sub = 0;
    cart.forEach(item => {
      const p = products.find(pr => pr.id === item.id);
      if (!p) return;
      const line = p.price * item.qty;
      sub += line;
      itemLines += `  • ${p.name} x${item.qty} — ${fmt(line)}\n`;
    });

    const addr = [form.address, form.city].filter(Boolean).join(', ');
    const msg = [
      `🛍️ *NEW ORDER — ${STORE_NAME}*`,
      `📋 Order Ref: ${ref}`,
      `📅 Date: ${date}`,
      ``,
      `👤 *Customer*`,
      `  Name: ${form.firstName} ${form.lastName}`,
      `  Phone: ${form.phone}`,
      form.email ? `  Email: ${form.email}` : null,
      ``,
      `📦 *Delivery Address*`,
      `  ${addr}`,
      ``,
      `🧾 *Order Items*`,
      itemLines.trimEnd(),
      ``,
      `💰 *Items Total: ${fmt(sub)}*`,
      `📌 Shipping fee will be communicated separately.`,
      ``,
      `💳 *Payment Method: Bank Transfer*`,
      form.notes ? `\n📝 *Notes*\n  ${form.notes}` : null,
      ``,
      `—`,
      `Please confirm this order and send payment details. Thank you! 🙏`,
    ].filter(l => l !== null).join('\n');

    clearCart();
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
    setOrdered(true);
  }

  if (ordered) {
    return (
      <>
        <Header />
        <div className="checkout-page">
          <div className="container" style={{ textAlign: 'center', padding: '80px 24px' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎉</div>
            <h2 style={{ marginBottom: '12px' }}>Order Sent!</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 8px', lineHeight: 1.7 }}>
              Your order has been sent via WhatsApp. We'll confirm and send bank details within 24 hours.
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '32px' }}>
              Keep an eye on your WhatsApp for our reply!
            </p>
            <Link to="/" className="btn btn-primary btn-lg">Continue Shopping</Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (cart.length === 0) {
    return (
      <>
        <Header />
        <div className="checkout-page">
          <div className="container" style={{ textAlign: 'center', padding: '80px 24px' }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 20px', opacity: 0.25 }}>
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 001.98 1.61h9.72a2 2 0 001.98-1.61L23 6H6" />
            </svg>
            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Your cart is empty.</p>
            <Link to="/" className="btn btn-primary">Back to Shop</Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div style={{ background: 'var(--white)', padding: '32px 0', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <h1 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>Checkout</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Fill in your details and we'll confirm your order via WhatsApp.</p>
        </div>
      </div>

      <div className="checkout-page">
        <div className="container">
          <div className="checkout-grid">

            {/* LEFT: Form */}
            <div className="checkout-form-section">
              <div className="section-heading"><span>1</span> Contact Information</div>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input type="text" name="firstName" value={form.firstName} onChange={handleChange} placeholder="Jane" />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input type="text" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Doe" />
                </div>
              </div>
              <div className="form-group">
                <label>Phone / WhatsApp Number *</label>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+234 800 000 0000" />
              </div>
              <div className="form-group">
                <label>Email Address (optional)</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="jane@email.com" />
              </div>

              <div className="section-heading" style={{ marginTop: '28px' }}><span>2</span> Delivery Details</div>
              <div className="form-group">
                <label>Delivery Address *</label>
                <input type="text" name="address" value={form.address} onChange={handleChange} placeholder="Street address, unit number" />
              </div>
              <div className="form-group">
                <label>City *</label>
                <input type="text" name="city" value={form.city} onChange={handleChange} placeholder="City" />
              </div>
              <div className="form-group">
                <label>Order Notes (optional)</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Any special instructions, preferred delivery time, etc." />
              </div>

              <div className="section-heading" style={{ marginTop: '28px' }}><span>3</span> Payment Method</div>
              <div className="payment-options">
                <label className="payment-option selected">
                  <input type="radio" name="payment" defaultChecked readOnly />
                  <span className="payment-option-icon">🏦</span>
                  <div>
                    <div className="payment-option-label">Bank Transfer</div>
                    <div className="payment-option-desc">Account details will be sent after your order is confirmed</div>
                  </div>
                  <div className="radio-dot" />
                </label>
              </div>

              {error && <div className="auth-error visible" style={{ marginTop: '16px' }}>{error}</div>}
            </div>

            {/* RIGHT: Summary */}
            <div className="checkout-summary-section">
              <div className="section-heading" style={{ border: 'none', paddingBottom: 0, marginBottom: '20px' }}>
                <span>✓</span> Order Summary
              </div>
              <div className="summary-items">
                {cart.map(item => {
                  const p = products.find(pr => pr.id === item.id);
                  if (!p) return null;
                  return (
                    <div className="summary-item" key={item.id}>
                      <img className="summary-item-img" src={p.image} alt={p.name}
                        onError={e => { e.target.src = 'https://placehold.co/52x52/E8DDD3/B8926A?text=?'; }} />
                      <div className="summary-item-info">
                        <div className="summary-item-name">{p.name}</div>
                        <div className="summary-item-qty">Qty: {item.qty}</div>
                      </div>
                      <div className="summary-item-price">{fmt(p.price * item.qty)}</div>
                    </div>
                  );
                })}
              </div>
              <div className="summary-totals">
                <div className="summary-row">
                  <span>Subtotal</span><span>{fmt(subtotal)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping</span>
                  <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Notified after order</span>
                </div>
                <div className="summary-row total">
                  <span>Items Total</span><span>{fmt(subtotal)}</span>
                </div>
              </div>

              <button className="place-order-btn" onClick={placeOrder}>
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Place Order via WhatsApp
              </button>
              <p className="order-note">
                You'll be redirected to WhatsApp with your order details pre-filled.<br />
                We'll confirm your order and send bank details within 24 hours.
              </p>
            </div>

          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
