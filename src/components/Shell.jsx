import { Link } from 'react-router-dom';
import { WhatsappLogo } from '@phosphor-icons/react';
import Header from './Header';
import CartSidebar from './CartSidebar';
import Announcement from './Announcement';
import { WHATSAPP_NUMBER } from '../config';

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
          <img className="footer-mark" src="/brand/jlc-mark-ink.png" alt="JLC, Jay's Lip Care and more" width="168" height="96" loading="lazy" />
          <nav className="footer-links" aria-label="Footer">
            <Link to="/">Shop</Link>
            <Link to="/products">All products</Link>
            <Link to="/track">Track order</Link>
            <Link to="/faq">FAQ</Link>
            <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">
              <WhatsappLogo size={16} aria-hidden="true" /> WhatsApp
            </a>
          </nav>
          <p className="footer-copy">© {new Date().getFullYear()} JLC.</p>
        </div>
      </footer>
    </>
  );
}
