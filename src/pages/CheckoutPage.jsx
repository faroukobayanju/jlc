import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, WhatsappLogo, LockSimple } from '@phosphor-icons/react';
import Shell from '../components/Shell';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import { STORE_NAME, WHATSAPP_NUMBER } from '../config';
import { fmt, hideBroken, effectivePrice } from '../lib/format';
import DeliveryNote from '../components/DeliveryNote';

const EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/;

const FIELDS = {
  firstName: { label: 'First name', autoComplete: 'given-name', max: 60 },
  lastName: { label: 'Last name', autoComplete: 'family-name', max: 60 },
  phone: { label: 'Phone number for delivery', autoComplete: 'tel', type: 'tel', max: 25, hint: 'The rider calls this number with the delivery fee. Use a line that is always reachable.' },
  email: { label: 'Email', autoComplete: 'email', type: 'email', max: 120 },
  address: { label: 'Delivery address', autoComplete: 'street-address', max: 200 },
  city: { label: 'City', autoComplete: 'address-level2', max: 60 },
};

function validate(form, method) {
  const errors = {};
  for (const key of ['firstName', 'lastName', 'phone', 'address', 'city']) {
    if (!form[key].trim()) errors[key] = `${FIELDS[key].label} is required.`;
  }
  const digits = form.phone.replace(/\D/g, '');
  if (form.phone.trim() && (digits.length < 7 || digits.length > 15)) errors.phone = 'Enter a phone number with 7 to 15 digits.';
  if (method === 'paystack' && !form.email.trim()) errors.email = 'Paystack needs an email to send your receipt.';
  else if (form.email.trim() && !EMAIL_RE.test(form.email.trim())) errors.email = 'This email address looks incomplete.';
  return errors;
}

function Field({ name, form, errors, onChange, optional }) {
  const f = FIELDS[name];
  const id = `f-${name}`;
  const err = errors[name];
  return (
    <div className={`field${err ? ' has-error' : ''}`}>
      <label htmlFor={id}>{f.label}{optional && <span className="field-opt"> (optional)</span>}</label>
      <input
        id={id} name={name} type={f.type || 'text'} value={form[name]} onChange={onChange}
        autoComplete={f.autoComplete} maxLength={f.max}
        aria-invalid={Boolean(err)} aria-describedby={err ? `${id}-err` : f.hint ? `${id}-hint` : undefined}
      />
      {err ? <p className="field-err" id={`${id}-err`}>{err}</p> : f.hint && <p className="field-hint" id={`${id}-hint`}>{f.hint}</p>}
    </div>
  );
}

export default function CheckoutPage() {
  const { cart, getSubtotal, clearCart } = useCart();
  const { products } = useProducts();
  const subtotal = getSubtotal(products);

  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', email: '', address: '', city: '', notes: '' });
  const [method, setMethod] = useState('paystack');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const [sentOnWhatsApp, setSentOnWhatsApp] = useState(false);

  const lines = cart.map(item => ({ item, p: products.find(pr => pr.id === item.id) })).filter(l => l.p);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
  }

  async function payWithPaystack() {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ items: cart.map(({ id, qty }) => ({ id, qty })), customer: form }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Payment could not start. Please try again.');
    // Only ever leave the site for Paystack's own checkout.
    if (!/^https:\/\/checkout\.paystack\.com\//.test(data.authorizationUrl || '')) {
      throw new Error('Payment could not start. Please try again.');
    }
    window.location.assign(data.authorizationUrl);
  }

  function sendOnWhatsApp() {
    const itemLines = lines.map(({ item, p }) => `- ${p.name} x${item.qty}: ${fmt(effectivePrice(p) * item.qty)}`).join('\n');
    const msg = [
      `*New order for ${STORE_NAME}*`,
      '',
      `Name: ${form.firstName} ${form.lastName}`,
      `Phone: ${form.phone}`,
      form.email ? `Email: ${form.email}` : null,
      `Address: ${form.address}, ${form.city}`,
      '',
      '*Items*',
      itemLines,
      '',
      `*Items total: ${fmt(subtotal)}*`,
      'Payment: bank transfer. Please send account details. I understand the rider will tell me the delivery fee.',
      form.notes ? `\nNotes: ${form.notes}` : null,
    ].filter(l => l !== null).join('\n');

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
    clearCart();
    setSentOnWhatsApp(true);
  }

  async function submit(e) {
    e.preventDefault();
    setFormError('');
    const found = validate(form, method);
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(`f-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    if (method === 'whatsapp') { sendOnWhatsApp(); return; }
    setBusy(true);
    try {
      await payWithPaystack();
    } catch (err) {
      setFormError(err.message);
      setBusy(false);
    }
  }

  if (sentOnWhatsApp) {
    return (
      <Shell minimal>
        <div className="notice">
          <WhatsappLogo size={40} weight="thin" aria-hidden="true" />
          <h1 className="display notice-title">Order sent to Jay</h1>
          <p>WhatsApp opened with your order. Jay will reply with bank details. The rider will call you with the delivery fee.</p>
          <Link to="/" className="btn btn-solid">Keep shopping</Link>
        </div>
      </Shell>
    );
  }

  if (lines.length === 0) {
    return (
      <Shell minimal>
        <div className="notice">
          <h1 className="display notice-title">Your bag is empty</h1>
          <p>Add something from the counter first.</p>
          <Link to="/" className="btn btn-solid">Back to shop</Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell minimal>
      <div className="checkout">
        <Link to="/" className="back-link"><ArrowLeft size={16} aria-hidden="true" /> Back to shop</Link>
        <h1 className="display checkout-title">Checkout</h1>

        <form className="checkout-grid" onSubmit={submit} noValidate>
          <div className="checkout-form">
            <fieldset>
              <legend>Contact</legend>
              <div className="field-row">
                <Field name="firstName" form={form} errors={errors} onChange={handleChange} />
                <Field name="lastName" form={form} errors={errors} onChange={handleChange} />
              </div>
              <Field name="phone" form={form} errors={errors} onChange={handleChange} />
              <Field name="email" form={form} errors={errors} onChange={handleChange} optional={method === 'whatsapp'} />
            </fieldset>

            <fieldset>
              <legend>Delivery</legend>
              <Field name="address" form={form} errors={errors} onChange={handleChange} />
              <Field name="city" form={form} errors={errors} onChange={handleChange} />
              <div className="field">
                <label htmlFor="f-notes">Notes<span className="field-opt"> (optional)</span></label>
                <textarea id="f-notes" name="notes" value={form.notes} onChange={handleChange} maxLength={500}
                  placeholder="Landmark, best time to deliver, gift message" />
              </div>
            </fieldset>

            <fieldset>
              <legend>Payment</legend>
              <div className="pay-options">
                <label className={`pay-option${method === 'paystack' ? ' is-selected' : ''}`}>
                  <input type="radio" name="method" value="paystack" checked={method === 'paystack'} onChange={() => setMethod('paystack')} />
                  <CreditCard size={22} aria-hidden="true" />
                  <span className="pay-text">
                    <span className="pay-label">Pay now with Paystack</span>
                    <span className="pay-desc">Card, bank transfer or USSD. You return here when it is done.</span>
                  </span>
                </label>
                <label className={`pay-option${method === 'whatsapp' ? ' is-selected' : ''}`}>
                  <input type="radio" name="method" value="whatsapp" checked={method === 'whatsapp'} onChange={() => setMethod('whatsapp')} />
                  <WhatsappLogo size={22} aria-hidden="true" />
                  <span className="pay-text">
                    <span className="pay-label">Order on WhatsApp</span>
                    <span className="pay-desc">Send your order to Jay and pay by bank transfer after confirmation.</span>
                  </span>
                </label>
              </div>
            </fieldset>
          </div>

          <aside className="summary" aria-labelledby="summary-title">
            <h2 id="summary-title" className="summary-title">Order summary</h2>
            <ul className="summary-lines">
              {lines.map(({ item, p }) => (
                <li key={item.id} className="summary-line">
                  <img src={p.image} alt="" onError={hideBroken} />
                  <span className="summary-name">{p.name}<span className="summary-qty">Qty {item.qty}</span></span>
                  <span className="price">{fmt(effectivePrice(p) * item.qty)}</span>
                </li>
              ))}
            </ul>
            <dl className="summary-totals">
              <div><dt>Items</dt><dd className="price">{fmt(subtotal)}</dd></div>
              <div><dt>Delivery</dt><dd>Paid to the rider</dd></div>
              <div className="is-total"><dt>Pay now</dt><dd className="price">{fmt(subtotal)}</dd></div>
            </dl>

            <DeliveryNote compact />

            {formError && <p className="form-err" role="alert">{formError}</p>}

            <button type="submit" className="btn btn-solid btn-block btn-lg" disabled={busy}>
              {method === 'paystack'
                ? (busy ? 'Opening Paystack…' : <><LockSimple size={18} aria-hidden="true" /> Pay {fmt(subtotal)}</>)
                : <><WhatsappLogo size={18} aria-hidden="true" /> Send order on WhatsApp</>}
            </button>
            <p className="fine">
              {method === 'paystack'
                ? 'Prices are checked again before payment. Your card details go to Paystack, never to this site.'
                : 'WhatsApp opens with your order filled in. Nothing is charged here.'}
            </p>
          </aside>
        </form>
      </div>
    </Shell>
  );
}
