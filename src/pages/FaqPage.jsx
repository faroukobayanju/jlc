import { Link } from 'react-router-dom';
import { WhatsappLogo, ArrowLeft } from '@phosphor-icons/react';
import Shell from '../components/Shell';
import { WHATSAPP_NUMBER } from '../config';

const FAQS = [
  {
    q: 'How do I place an order?',
    a: <>Tap <strong>Add to bag</strong> on any product, open your bag from the top of the page, then tap <strong>Checkout</strong>. Fill in your name, the phone number the rider can call, your email and delivery address, then choose how to pay.</>,
  },
  {
    q: 'How can I pay?',
    a: <>Choose <strong>Pay now with Paystack</strong> to pay by card, bank transfer or USSD on Paystack's secure page. Your card details go to Paystack, never to this site. Or choose <strong>Order on WhatsApp</strong> to send your order to Jay and pay by bank transfer after she confirms it.</>,
  },
  {
    q: 'How much is delivery?',
    a: <>Delivery is not included in the price you pay on the site. The rider calls the phone number you gave at checkout and tells you the delivery fee before bringing your order, so make sure that number can be reached.</>,
  },
  {
    q: 'How do I track my order?',
    a: <>After paying you land on your order page, which shows your order code (for example JLC-3F2B8C1E). Open <Link className="text-link" to="/track">Track order</Link> any time and enter that code with your phone number. You will see when the rider is on the way and when the order is delivered.</>,
  },
  {
    q: 'What do "On the way" and "Delivered" mean?',
    a: <><strong>On the way</strong> means a rider has your order and will call you. <strong>Delivered</strong> means it has been handed over. Jay updates these as your order moves.</>,
  },
  {
    q: 'I paid but my order page says payment not completed.',
    a: <>Paystack can take a moment to confirm. Refresh the page after a minute. If money left your account and the page still says not completed, message Jay on WhatsApp with your order code.</>,
  },
  {
    q: 'What if an item sells out while I am paying?',
    a: <>Your order page will say so. Jay will contact you to swap it for something else or refund you.</>,
  },
  {
    q: 'I ordered on WhatsApp. Can I track it here?',
    a: <>WhatsApp orders are confirmed and tracked in your chat with Jay, so they do not appear on Track order.</>,
  },
];

export default function FaqPage() {
  return (
    <Shell>
      <div className="faq">
        <Link to="/" className="back-link"><ArrowLeft size={16} aria-hidden="true" /> Back to shop</Link>
        <h1 className="display faq-title">How to shop JLC</h1>
        <div className="faq-list">
          {FAQS.map(({ q, a }) => (
            <details key={q} className="faq-item">
              <summary>{q}</summary>
              <div className="faq-answer">{a}</div>
            </details>
          ))}
        </div>
        <div className="faq-more">
          <p>Still stuck? Jay answers on WhatsApp.</p>
          <a className="btn btn-solid" href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">
            <WhatsappLogo size={18} aria-hidden="true" /> Message Jay
          </a>
        </div>
      </div>
    </Shell>
  );
}
