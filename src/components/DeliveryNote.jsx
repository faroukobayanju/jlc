import { Moped } from '@phosphor-icons/react';

// Shown before payment (bag, checkout) and after (order page) so the delivery fee is never a surprise.
export default function DeliveryNote({ compact = false }) {
  return (
    <div className={`delivery-note${compact ? ' is-compact' : ''}`} role="note">
      <Moped size={compact ? 18 : 22} weight="duotone" aria-hidden="true" />
      <p>
        <strong>Delivery fee is not included.</strong>{' '}
        The rider will call the phone number you give and tell you the delivery fee before they bring your order.
      </p>
    </div>
  );
}
