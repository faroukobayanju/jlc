import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle, WarningCircle, WhatsappLogo, HourglassMedium, ArrowClockwise } from '@phosphor-icons/react';
import Shell from '../components/Shell';
import DeliveryNote from '../components/DeliveryNote';
import { useCart } from '../context/CartContext';
import { STORE_NAME, WHATSAPP_NUMBER } from '../config';
import { fmtKobo } from '../lib/format';

const RETRY_DELAYS = [2000, 4000, 8000, 15000];
const FAILED = ['failed', 'abandoned', 'reversed'];

const when = iso => iso && new Date(iso).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' });

function whatsappLink(order) {
  const msg = [
    `*Order JLC-${order.code} (${STORE_NAME})*`,
    ...order.lines.map(l => `- ${l.name} x${l.qty}`),
    `Paid: ${fmtKobo(order.totalKobo)}`,
    '',
    'I have a question about my order.',
  ].join('\n');
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

// Paid, then the rider is on the way (sent), then it arrives (received). Updated by the admin.
function Timeline({ order }) {
  const steps = [
    { key: 'paid', label: 'Payment received', at: order.paidAt, done: true },
    { key: 'sent', label: 'On the way', hint: 'A rider has your order and will call you.', at: order.sentAt, done: ['sent', 'received'].includes(order.deliveryStatus) },
    { key: 'received', label: 'Delivered', at: order.receivedAt, done: order.deliveryStatus === 'received' },
  ];
  const current = steps.findLastIndex(s => s.done);
  return (
    <ol className="timeline" aria-label="Order progress">
      {steps.map((s, i) => (
        <li key={s.key} className={`timeline-step${s.done ? ' is-done' : ''}${i === current ? ' is-current' : ''}`}
          aria-current={i === current ? 'step' : undefined}>
          <span className="timeline-dot" aria-hidden="true" />
          <span className="timeline-text">
            <span className="timeline-label">{s.label}</span>
            {s.done && s.at && <span className="timeline-at">{when(s.at)}</span>}
            {!s.done && i === current + 1 && <span className="timeline-at">{s.hint || 'Next'}</span>}
          </span>
        </li>
      ))}
    </ol>
  );
}

export default function OrderPage() {
  const { reference } = useParams();
  const { clearCart } = useCart();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer;
    fetch(`/api/order?reference=${encodeURIComponent(reference)}`)
      .then(r => r.json().then(body => ({ ok: r.ok, body })))
      .then(({ ok, body }) => {
        if (cancelled) return;
        setRefreshing(false);
        if (!ok) { setError(body.error || 'We could not find this order.'); return; }
        setOrder(body);
        // Webhook may land a few seconds after the redirect; back off while Paystack is still processing.
        const processing = body.status === 'pending' && !FAILED.includes(body.paystackStatus);
        if (processing && attempt < RETRY_DELAYS.length) {
          timer = setTimeout(() => setAttempt(a => a + 1), RETRY_DELAYS[attempt]);
        }
      })
      .catch(() => { if (!cancelled) { setRefreshing(false); setError('Network problem. Check your connection and refresh this page.'); } });
    return () => { cancelled = true; clearTimeout(timer); };
  }, [reference, attempt]);

  const paid = order && (order.status === 'paid' || order.status === 'paid_stock_issue');
  useEffect(() => { if (paid) clearCart(); }, [paid]); // eslint-disable-line react-hooks/exhaustive-deps

  let body;
  if (error) {
    body = (
      <>
        <WarningCircle size={40} weight="thin" aria-hidden="true" />
        <h1 className="display notice-title">Order not found</h1>
        <p>{error}</p>
        <Link to="/track" className="btn btn-solid">Track with your order code</Link>
      </>
    );
  } else if (!order) {
    body = (
      <>
        <HourglassMedium size={40} weight="thin" aria-hidden="true" />
        <h1 className="display notice-title">Checking your order</h1>
        <p>This takes a few seconds.</p>
      </>
    );
  } else if (paid) {
    const delivered = order.deliveryStatus === 'received';
    body = (
      <>
        <CheckCircle size={40} weight="thin" aria-hidden="true" />
        <h1 className="display notice-title">
          {delivered ? 'Delivered' : `Thank you${order.firstName ? `, ${order.firstName}` : ''}`}
        </h1>
        <p className="order-code">Order code <strong>JLC-{order.code}</strong></p>
        {order.status === 'paid_stock_issue' && (
          <p className="form-err">One item sold out while you were paying. Jay will contact you to swap it or refund you.</p>
        )}
        <Timeline order={order} />
        {!delivered && <DeliveryNote />}
        <ul className="receipt">
          {order.lines.map((l, i) => (
            <li key={i}><span>{l.name} <span className="muted">x{l.qty}</span></span><span className="price">{fmtKobo(l.lineKobo)}</span></li>
          ))}
          <li className="receipt-total"><span>Paid</span><span className="price">{fmtKobo(order.totalKobo)}</span></li>
        </ul>
        <p className="fine">Save this page or your order code. You can track it any time from Track order.</p>
        <div className="notice-actions">
          <button className="btn btn-ghost" onClick={() => { setRefreshing(true); setAttempt(a => a + 1); }} disabled={refreshing}>
            <ArrowClockwise size={16} aria-hidden="true" /> {refreshing ? 'Refreshing…' : 'Refresh status'}
          </button>
          <a className="btn btn-solid" href={whatsappLink(order)} target="_blank" rel="noopener noreferrer">
            <WhatsappLogo size={18} aria-hidden="true" /> Message Jay
          </a>
        </div>
      </>
    );
  } else if (order.status === 'pending' && attempt < RETRY_DELAYS.length && !FAILED.includes(order.paystackStatus)) {
    body = (
      <>
        <HourglassMedium size={40} weight="thin" aria-hidden="true" />
        <h1 className="display notice-title">Waiting for Paystack</h1>
        <p>Your payment is still being confirmed. Keep this page open.</p>
      </>
    );
  } else {
    body = (
      <>
        <WarningCircle size={40} weight="thin" aria-hidden="true" />
        <h1 className="display notice-title">Payment not completed</h1>
        <p>Nothing was charged, or Paystack has not confirmed it yet. Your bag is saved, so you can try again.</p>
        <p className="fine">If money left your account, message Jay with order code JLC-{order.code}.</p>
        <Link to="/checkout" className="btn btn-solid">Try again</Link>
      </>
    );
  }

  return (
    <Shell minimal>
      <div className="notice" aria-live="polite">{body}</div>
    </Shell>
  );
}
