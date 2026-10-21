import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package } from '@phosphor-icons/react';
import Shell from '../components/Shell';

export default function TrackPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await fetch('/api/track', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ code, phone }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not look up that order. Try again.');
      navigate(`/order/${data.reference}`);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <Shell>
      <div className="notice">
        <Package size={40} weight="thin" aria-hidden="true" />
        <h1 className="display notice-title">Track your order</h1>
        <p>Enter the order code from your order page and the phone number you used at checkout.</p>
        <form className="track-form" onSubmit={submit} noValidate>
          <div className="field">
            <label htmlFor="t-code">Order code</label>
            <input id="t-code" value={code} onChange={e => setCode(e.target.value)} placeholder="JLC-3F2B8C1E"
              autoComplete="off" autoCapitalize="characters" spellCheck="false" maxLength={14} />
          </div>
          <div className="field">
            <label htmlFor="t-phone">Phone number</label>
            <input id="t-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} autoComplete="tel" maxLength={25} />
          </div>
          {error && <p className="form-err" role="alert">{error}</p>}
          <button type="submit" className="btn btn-solid btn-block" disabled={busy}>{busy ? 'Looking up…' : 'Track order'}</button>
        </form>
        <p className="fine">Ordered on WhatsApp? Those orders are tracked in your chat with Jay. See the <Link className="text-link" to="/faq">FAQ</Link>.</p>
      </div>
    </Shell>
  );
}
