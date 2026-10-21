import { useState } from 'react';
import { WhatsappLogo } from '@phosphor-icons/react';
import Shell from '../components/Shell';
import Hero from '../components/Hero';
import Catalog from '../components/Catalog';
import { WHATSAPP_NUMBER } from '../config';

export default function ShopPage() {
  const [filter, setFilter] = useState('all');

  return (
    <Shell>
      <Hero />
      <Catalog title="The collection" filter={filter} onFilter={setFilter} limit />
      <section className="talk" aria-labelledby="talk-title">
        <div className="talk-inner">
          <h2 id="talk-title" className="display talk-title">Not sure which one?</h2>
          <p className="talk-text">
            Ask Jay on WhatsApp for a shade, a scent or a gift idea. You can also place your whole order there and pay by bank transfer.
          </p>
          <a className="btn btn-solid" href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer">
            <WhatsappLogo size={18} aria-hidden="true" /> Message Jay
          </a>
        </div>
      </section>
    </Shell>
  );
}
