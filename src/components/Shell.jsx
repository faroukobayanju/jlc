import { Link } from 'react-router-dom';
import { WhatsappLogo } from '@phosphor-icons/react';
import Header from './Header';
import CartSidebar from './CartSidebar';
import Announcement from './Announcement';
import { WHATSAPP_NUMBER } from '../config';
import { CATEGORIES } from '../lib/format';

// 2349160228944 -> +234 916 022 8944
const WHATSAPP_DISPLAY = `+${WHATSAPP_NUMBER.replace(/^(\d{3})(\d{3})(\d{3})(\d+)$/, '$1 $2 $3 $4')}`;

export default function Shell({ children, minimal = false }) {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      {!minimal && <Announcement />}
      <Header minimal={minimal} />
      <main id="main">{children}</main>
      {!minimal && <CartSidebar />}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <img className="footer-mark" src="/brand/jlc-wordmark-ink-lg.png" alt="JLC, Jay's Lip Care and more" width="1260" height="720" loading="lazy" />
            <p className="footer-about">Lip care, fragrance and little self-care treats, picked by Jay.</p>
            <a className="btn btn-solid footer-wa" href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">
              <WhatsappLogo size={18} aria-hidden="true" /> Chat with Jay
            </a>
            <p className="footer-phone">{WHATSAPP_DISPLAY}</p>
          </div>
          <nav className="footer-col" aria-label="Shop">
            <h2 className="footer-head">Shop</h2>
            <Link to="/products">All products</Link>
            {CATEGORIES.filter(c => c.key !== 'all').map(c => (
              <Link key={c.key} to={`/products?c=${c.key}`}>{c.label}</Link>
            ))}
          </nav>
          <nav className="footer-col" aria-label="Help">
            <h2 className="footer-head">Help</h2>
            <Link to="/track">Track order</Link>
            <Link to="/faq">How to order</Link>
            <Link to="/faq">Delivery fees</Link>
          </nav>
          <div className="footer-base">
            <span>© {new Date().getFullYear()} JLC, Jay's Lip Care and more.</span>
            <span>Delivery fees are paid to the rider.</span>
          </div>
        </div>
      </footer>
    </>
  );
}
