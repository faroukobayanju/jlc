import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, collection, query, orderBy, limit, getDocs, addDoc, deleteDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { Eye, EyeSlash, X, Check, ArrowLeft, Plus } from '@phosphor-icons/react';
import { app, db } from '../firebase';
import { useProducts } from '../context/ProductContext';
import { ADMIN_EMAIL } from '../config';
import { fmt, fmtKobo, catLabel, CATEGORIES, hideBroken, effectivePrice, discountActive } from '../lib/format';
import { MAX_DISCOUNT } from '../../shared/pricing';

const DURATIONS = [[1, '1 day'], [3, '3 days'], [7, '1 week'], [14, '2 weeks'], [30, '30 days']];
const DAY_MS = 24 * 60 * 60 * 1000;
const localDateTime = ms => {
  const d = new Date(ms - new Date(ms).getTimezoneOffset() * 60000);
  return d.toISOString().slice(0, 16);
};
const fmtWhen = ts => ts.toDate().toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' });

// Auth lives only in the admin chunk; shoppers never download it.
const auth = getAuth(app);
const ORDER_PAGE = 50;
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// One message for wrong email and wrong password, so the form does not reveal which accounts exist.
const authErrorText = code => ({
  'auth/invalid-credential': 'Email or password is incorrect.',
  'auth/user-not-found': 'Email or password is incorrect.',
  'auth/wrong-password': 'Email or password is incorrect.',
  'auth/invalid-email': 'Email or password is incorrect.',
  'auth/too-many-requests': 'Too many attempts. Wait a few minutes, then try again.',
  'auth/network-request-failed': 'Could not reach Firebase. Check your connection.',
}[code] || 'Could not sign in. Try again.');

const ORDER_STATUS = {
  paid: ['Paid', 'ok'],
  paid_stock_issue: ['Paid, stock issue', 'warn'],
  pending: ['Awaiting payment', 'muted'],
  init_failed: ['Payment did not start', 'muted'],
  amount_mismatch: ['Amount mismatch', 'danger'],
};

function StockBadge({ stock }) {
  if (stock === 0) return <span className="badge badge-danger">Sold out</span>;
  if (stock <= 5) return <span className="badge badge-warn">Low, {stock} left</span>;
  return <span className="badge badge-ok">In stock</span>;
}

function StatsPanel({ products }) {
  const stats = [
    ['Products', products.length],
    ['In stock', products.filter(p => p.stock > 0).length],
    ['Low stock', products.filter(p => p.stock > 0 && p.stock <= 5).length],
    ['Sold out', products.filter(p => p.stock === 0).length],
  ];
  return (
    <dl className="admin-stats">
      {stats.map(([label, value]) => (
        <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
      ))}
    </dl>
  );
}

// Discount end dates are whole days in the shop's local time: the sale runs to 23:59 on that date.
const toDateInput = ms => {
  if (!ms) return '';
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const endOfDay = value => (value ? new Date(`${value}T23:59:59`).getTime() : null);

function ProductRow({ product, onSave, onDelete }) {
  const initial = () => ({
    price: String(Math.round(product.price)),
    stock: String(product.stock),
    discount: String(product.discountPercent || 0),
    ends: toDateInput(product.discountEndsAt),
  });
  const [vals, setVals] = useState(initial);
  const [changed, setChanged] = useState(false);
  const [saved, setSaved] = useState(false);
  const [rowError, setRowError] = useState('');

  useEffect(() => {
    setVals(initial());
    setChanged(false); setSaved(false); setRowError('');
  }, [product]); // eslint-disable-line react-hooks/exhaustive-deps

  function set(key, value) {
    setVals(v => ({ ...v, [key]: value }));
    setChanged(true); setSaved(false); setRowError('');
  }

  async function handleSave() {
    const price = Number(vals.price), stock = Number(vals.stock), discountPercent = Number(vals.discount || 0);
    if (!Number.isFinite(price) || price < 0) { setRowError('Price must be 0 or more.'); return; }
    if (!Number.isInteger(stock) || stock < 0) { setRowError('Stock must be a whole number.'); return; }
    if (!Number.isInteger(discountPercent) || discountPercent < 0 || discountPercent > MAX_DISCOUNT) {
      setRowError(`Discount must be 0 to ${MAX_DISCOUNT}%.`); return;
    }
    const discountEndsAt = discountPercent ? endOfDay(vals.ends) : null;
    if (discountEndsAt && discountEndsAt < Date.now()) { setRowError('Discount end date is in the past.'); return; }
    if (await onSave(product.id, { price, stock, discountPercent, discountEndsAt })) {
      setChanged(false); setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  }

  const live = discountActive({ ...product, discountPercent: Number(vals.discount), discountEndsAt: endOfDay(vals.ends) });

  return (
    <tr>
      <td>
        <div className="td-product">
          <img className="td-img" src={product.image} alt="" onError={hideBroken} />
          <span>{product.name}</span>
        </div>
      </td>
      <td>{catLabel(product.category)}</td>
      <td>
        <input className={`cell-input${changed ? ' is-changed' : ''}`} type="number" min="0" step="1" value={vals.price}
          aria-label={`Price of ${product.name}`} onChange={e => set('price', e.target.value)} />
      </td>
      <td>
        <input className={`cell-input cell-input-sm${changed ? ' is-changed' : ''}`} type="number" min="0" step="1" value={vals.stock}
          aria-label={`Stock of ${product.name}`} onChange={e => set('stock', e.target.value)} />
      </td>
      <td>
        <div className="discount-cell">
          <label className="pct-input">
            <input className={`cell-input cell-input-xs${changed ? ' is-changed' : ''}`} type="number" min="0" max={MAX_DISCOUNT} step="1"
              value={vals.discount} aria-label={`Discount percent for ${product.name}`} onChange={e => set('discount', e.target.value)} />
            <span aria-hidden="true">%</span>
          </label>
          <input className={`cell-input cell-input-date${changed ? ' is-changed' : ''}`} type="date" value={vals.ends}
            disabled={!Number(vals.discount)} min={toDateInput(Date.now())}
            aria-label={`Discount ends on, for ${product.name}. Leave empty for no end date.`}
            onChange={e => set('ends', e.target.value)} />
        </div>
        {live && <span className="muted small">Sells at {fmt(effectivePrice({ price: Number(vals.price), discountPercent: Number(vals.discount) }))}</span>}
      </td>
      <td><StockBadge stock={parseInt(vals.stock, 10) || 0} /></td>
      <td>
        <div className="row-actions">
          <button className="btn btn-ghost btn-sm" onClick={handleSave} disabled={!changed}>Save</button>
          {saved && <span className="saved"><Check size={14} weight="bold" aria-hidden="true" /> Saved</span>}
          <button className="btn btn-danger btn-sm" onClick={() => onDelete(product.id)}>Delete</button>
        </div>
        {rowError && <p className="field-err">{rowError}</p>}
      </td>
    </tr>
  );
}

function AddProductModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ name: '', category: 'lip-care', description: '', price: '', stock: '' });
  const [imgTab, setImgTab] = useState('file');
  const [imageData, setImageData] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function switchTab(tab) { setImgTab(tab); setImageData(''); setImageUrl(''); setError(''); }

  // Re-encoding through a canvas strips EXIF and anything else hiding in the file.
  function handleFile(e) {
    const file = e.target.files[0];
    setError('');
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) { setError('Use a JPG, PNG or WebP image.'); return; }
    if (file.size > MAX_UPLOAD_BYTES) { setError('That image is over 10 MB. Pick a smaller one.'); return; }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const MAX = 600;
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.72);
      if (dataUrl.length > 400000) { setError('Image is still too large after compression. Try a smaller photo or paste a link.'); return; }
      setImageData(dataUrl);
    };
    img.onerror = () => { URL.revokeObjectURL(url); setError('That file could not be read as an image.'); };
    img.src = url;
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    const name = form.name.trim();
    const price = Number(form.price), stock = Number(form.stock);
    if (!name) { setError('Product name is required.'); return; }
    if (form.price === '' || !Number.isFinite(price) || price < 0) { setError('Enter a valid price.'); return; }
    if (form.stock === '' || !Number.isInteger(stock) || stock < 0) { setError('Enter a whole number for stock.'); return; }
    const url = imageUrl.trim();
    if (imgTab === 'url' && url && !/^https:\/\/\S+$/.test(url)) { setError('Image links must start with https://'); return; }
    const image = imgTab === 'file' ? imageData : url;
    if (!image) { setError('Add a product image.'); return; }
    setBusy(true);
    const ok = await onAdd({
      name, category: form.category,
      description: form.description.trim() || `${name}, available now.`,
      price, stock, image,
    });
    if (!ok) setBusy(false);
  }

  const preview = imgTab === 'file' ? imageData : imageUrl.trim();

  return (
    <div className="modal-scrim" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <form className="modal" role="dialog" aria-modal="true" aria-labelledby="add-title" onSubmit={submit} noValidate>
        <div className="modal-head">
          <h2 id="add-title" className="modal-title">Add product</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} aria-hidden="true" /></button>
        </div>

        <div className="field">
          <label htmlFor="p-name">Name</label>
          <input id="p-name" type="text" value={form.name} maxLength={100} autoFocus
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
        </div>
        <div className="field">
          <label htmlFor="p-cat">Category</label>
          <select id="p-cat" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
            {CATEGORIES.filter(c => c.key !== 'all').map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="p-desc">Description<span className="field-opt"> (optional)</span></label>
          <textarea id="p-desc" value={form.description} maxLength={500}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="p-price">Price (₦)</label>
            <input id="p-price" type="number" min="0" step="1" inputMode="numeric" value={form.price}
              onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
          </div>
          <div className="field">
            <label htmlFor="p-stock">Stock</label>
            <input id="p-stock" type="number" min="0" step="1" inputMode="numeric" value={form.stock}
              onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} />
          </div>
        </div>

        <div className="field">
          <span className="field-label">Image</span>
          <div className="seg" role="group" aria-label="Image source">
            <button type="button" className={`seg-btn${imgTab === 'file' ? ' is-active' : ''}`} aria-pressed={imgTab === 'file'} onClick={() => switchTab('file')}>Upload photo</button>
            <button type="button" className={`seg-btn${imgTab === 'url' ? ' is-active' : ''}`} aria-pressed={imgTab === 'url'} onClick={() => switchTab('url')}>Paste link</button>
          </div>
          {imgTab === 'file' ? (
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} aria-label="Product photo" />
          ) : (
            <input type="url" value={imageUrl} placeholder="https://" aria-label="Image link"
              onChange={e => setImageUrl(e.target.value)} />
          )}
          {preview && <img className="upload-preview" src={preview} alt="Preview" onError={hideBroken} />}
        </div>

        {error && <p className="form-err" role="alert">{error}</p>}

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-solid" disabled={busy}>{busy ? 'Adding…' : 'Add product'}</button>
        </div>
      </form>
    </div>
  );
}

function ConfirmModal({ title, message, confirmLabel, onConfirm, onCancel }) {
  return (
    <div className="modal-scrim">
      <div className="modal modal-sm" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-msg">
        <h2 id="confirm-title" className="modal-title">{title}</h2>
        <p id="confirm-msg" className="muted">{message}</p>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel} autoFocus>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

function useToast() {
  const [toast, setToast] = useState({ message: '', type: '', visible: false });
  function showToast(message, type = '') {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  }
  return { toast, showToast };
}

const DELIVERY = {
  undefined: ['Not sent yet', 'warn'],
  sent: ['On the way', 'muted'],
  received: ['Delivered', 'ok'],
};

function OrdersPanel({ showToast }) {
  const [orders, setOrders] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(ORDER_PAGE)))
      .then(snap => setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
      .catch(e => { console.error('orders', e); setError('Could not load orders. Check that your account is an admin.'); });
  }, []);

  // Paid, then sent (rider is on the way), then received. The customer's order page shows each step.
  async function setDelivery(order, next) {
    setBusyId(order.id);
    const stamp = next === 'sent' ? { sentAt: serverTimestamp() } : { receivedAt: serverTimestamp() };
    try {
      await updateDoc(doc(db, 'orders', order.id), { deliveryStatus: next, ...stamp, updatedAt: serverTimestamp() });
      setOrders(list => list.map(o => (o.id === order.id ? { ...o, deliveryStatus: next, ...(next === 'sent' ? { sentAt: Timestamp.now() } : { receivedAt: Timestamp.now() }) } : o)));
      showToast(next === 'sent' ? 'Marked as on the way.' : 'Marked as delivered.', 'success');
    } catch {
      showToast('Could not update this order. Try again.', 'error');
    } finally {
      setBusyId(null);
    }
  }

  if (error) return <p className="form-err">{error}</p>;
  if (!orders) return <p className="muted pad">Loading orders…</p>;

  const shown = showAll ? orders : orders.filter(o => o.status === 'paid' || o.status === 'paid_stock_issue');
  const toSend = shown.filter(o => !o.deliveryStatus && (o.status === 'paid' || o.status === 'paid_stock_issue')).length;

  return (
    <div className="admin-panel">
      <div className="panel-head">
        <h2 className="panel-title">Online orders{toSend > 0 && <span className="badge badge-warn panel-count">{toSend} to send</span>}</h2>
        <label className="check">
          <input type="checkbox" checked={showAll} onChange={e => setShowAll(e.target.checked)} />
          Show unpaid attempts
        </label>
      </div>
      {shown.length === 0 ? (
        <p className="muted pad">No paid orders yet. WhatsApp orders arrive in your chats, not here.</p>
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr><th>Date</th><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Delivery</th></tr>
            </thead>
            <tbody>
              {shown.map(o => {
                const [label, tone] = ORDER_STATUS[o.status] || [o.status, 'muted'];
                const isPaid = o.status === 'paid' || o.status === 'paid_stock_issue';
                const [dLabel, dTone] = DELIVERY[o.deliveryStatus] || DELIVERY.undefined;
                return (
                  <tr key={o.id}>
                    <td className="nowrap">{o.createdAt?.toDate().toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                    <td className="nowrap">JLC-{o.shortCode || o.id.slice(0, 8).toUpperCase()}</td>
                    <td>
                      <div>{o.customer?.firstName} {o.customer?.lastName}</div>
                      <div className="muted">{o.customer?.phone} · {o.customer?.city}</div>
                      <div className="muted small">{o.customer?.address}</div>
                    </td>
                    <td>{o.lines?.map(l => <div key={l.id}>{l.name} <span className="muted">x{l.qty}</span></div>)}</td>
                    <td className="price nowrap">{fmtKobo(o.totalKobo)}</td>
                    <td><span className={`badge badge-${tone}`}>{label}</span></td>
                    <td>
                      {isPaid ? (
                        <div className="delivery-cell">
                          <span className={`badge badge-${dTone}`}>{dLabel}</span>
                          {!o.deliveryStatus && (
                            <button className="btn btn-ghost btn-sm" disabled={busyId === o.id} onClick={() => setDelivery(o, 'sent')}>Mark sent</button>
                          )}
                          {o.deliveryStatus === 'sent' && (
                            <button className="btn btn-solid btn-sm" disabled={busyId === o.id} onClick={() => setDelivery(o, 'received')}>Mark received</button>
                          )}
                        </div>
                      ) : <span className="muted small">n/a</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {orders.length === ORDER_PAGE && <p className="muted small pad">Showing the latest {ORDER_PAGE}. Older orders are in Firebase and Paystack.</p>}
    </div>
  );
}

function AnnouncementsPanel({ showToast }) {
  const [items, setItems] = useState(null);
  const [form, setForm] = useState(() => ({ message: '', link: '', startsAt: localDateTime(Date.now()), days: 7 }));
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function load() {
    getDocs(query(collection(db, 'announcements'), orderBy('createdAt', 'desc'), limit(20)))
      .then(snap => setItems(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
      .catch(() => setError('Could not load announcements.'));
  }
  useEffect(load, []);

  async function submit(e) {
    e.preventDefault();
    setError('');
    const message = form.message.trim();
    const link = form.link.trim();
    const start = new Date(form.startsAt).getTime();
    if (!message) { setError('Write the announcement first.'); return; }
    if (link && !/^(https:\/\/|\/)\S*$/.test(link)) { setError('Links must start with https:// or / for a page on this site.'); return; }
    if (!Number.isFinite(start)) { setError('Pick a start date and time.'); return; }
    if (start + form.days * DAY_MS < Date.now()) { setError('That would already have ended. Pick a later start.'); return; }
    setBusy(true);
    try {
      await addDoc(collection(db, 'announcements'), {
        message, link,
        startsAt: Timestamp.fromMillis(start),
        endsAt: Timestamp.fromMillis(start + form.days * DAY_MS),
        createdAt: serverTimestamp(),
      });
      setForm({ message: '', link: '', startsAt: localDateTime(Date.now()), days: 7 });
      showToast('Announcement scheduled.', 'success');
      load();
    } catch {
      setError('Could not save. Check that your account is an admin.');
    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    try { await deleteDoc(doc(db, 'announcements', id)); setItems(list => list.filter(a => a.id !== id)); showToast('Announcement removed.', 'success'); }
    catch { showToast('Could not remove it. Try again.', 'error'); }
  }

  const now = Date.now();
  const state = a => (a.startsAt.toMillis() > now ? ['Scheduled', 'muted'] : a.endsAt.toMillis() > now ? ['Live', 'ok'] : ['Ended', 'muted']);

  return (
    <div className="admin-split">
      <form className="admin-panel announce-form" onSubmit={submit} noValidate>
        <div className="panel-head"><h2 className="panel-title">New announcement</h2></div>
        <div className="panel-body">
          <div className="field">
            <label htmlFor="an-msg">Message</label>
            <textarea id="an-msg" value={form.message} maxLength={200} placeholder="New vanilla gloss is in. 10% off this week."
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
            <p className="field-hint">{200 - form.message.length} characters left. Shows as a strip at the top of the store.</p>
          </div>
          <div className="field">
            <label htmlFor="an-link">Link<span className="field-opt"> (optional)</span></label>
            <input id="an-link" type="text" value={form.link} placeholder="/products?c=lip-care" maxLength={300}
              onChange={e => setForm(f => ({ ...f, link: e.target.value }))} />
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="an-start">Starts</label>
              <input id="an-start" type="datetime-local" value={form.startsAt}
                onChange={e => setForm(f => ({ ...f, startsAt: e.target.value }))} />
            </div>
            <div className="field">
              <label htmlFor="an-days">Runs for</label>
              <select id="an-days" value={form.days} onChange={e => setForm(f => ({ ...f, days: Number(e.target.value) }))}>
                {DURATIONS.map(([d, label]) => <option key={d} value={d}>{label}</option>)}
              </select>
            </div>
          </div>
          {error && <p className="form-err" role="alert">{error}</p>}
          <button type="submit" className="btn btn-solid" disabled={busy}>{busy ? 'Saving…' : 'Schedule announcement'}</button>
        </div>
      </form>

      <div className="admin-panel">
        <div className="panel-head"><h2 className="panel-title">Announcements</h2></div>
        {!items ? <p className="muted pad">Loading…</p> : items.length === 0 ? (
          <p className="muted pad">Nothing yet. The newest live announcement shows on the store.</p>
        ) : (
          <ul className="announce-list">
            {items.map(a => {
              const [label, tone] = state(a);
              return (
                <li key={a.id}>
                  <div className="announce-item">
                    <p>{a.message}</p>
                    <p className="muted small">{fmtWhen(a.startsAt)} to {fmtWhen(a.endsAt)}{a.link ? `, links to ${a.link}` : ''}</p>
                  </div>
                  <span className={`badge badge-${tone}`}>{label}</span>
                  <button className="btn btn-danger btn-sm" onClick={() => remove(a.id)}>Remove</button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [user, setUser] = useState(undefined);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [authErr, setAuthErr] = useState('');
  const [signingIn, setSigningIn] = useState(false);
  const [tab, setTab] = useState('products');

  const { products, updateProduct, addProduct: firestoreAdd, deleteProduct: firestoreDelete, resetProducts } = useProducts();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const { toast, showToast } = useToast();

  useEffect(() => onAuthStateChanged(auth, async u => {
    if (!u) { setUser(null); setIsAdmin(false); return; }
    // The UI check is a convenience; Firestore rules enforce the same admins/{uid} check on every write.
    const admin = await getDoc(doc(db, 'admins', u.uid)).then(s => s.exists()).catch(() => false);
    setIsAdmin(admin);
    setUser(u);
  }), []);

  async function login(e) {
    e.preventDefault();
    setAuthErr('');
    setSigningIn(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      setAuthErr(authErrorText(err.code));
    } finally {
      setPassword('');
      setSigningIn(false);
    }
  }

  async function saveRow(id, fields) {
    try {
      await updateProduct(id, fields);
      showToast(`${products.find(p => p.id === id)?.name} updated.`, 'success');
      return true;
    } catch {
      showToast('Save failed. Check your connection.', 'error');
      return false;
    }
  }

  function deleteProduct(id) {
    const name = products.find(p => p.id === id)?.name;
    setConfirm({
      title: 'Delete product?',
      message: `${name} will be removed from the store. This cannot be undone.`,
      confirmLabel: 'Delete',
      onConfirm: async () => {
        setConfirm(null);
        try { await firestoreDelete(id); showToast(`${name} deleted.`, 'success'); }
        catch { showToast('Delete failed. Check your connection.', 'error'); }
      },
    });
  }

  async function addProduct(data) {
    const numericIds = products.map(p => Number(p.id)).filter(Number.isFinite);
    const newId = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 1;
    try {
      await firestoreAdd({ id: newId, ...data });
      setShowAdd(false);
      showToast(`${data.name} added.`, 'success');
      return true;
    } catch (e) {
      console.error('addProduct error:', e?.code, e?.message);
      showToast(e?.code === 'permission-denied' ? 'Not allowed. This account is not an admin.' : 'Could not add product. Try again.', 'error');
      return false;
    }
  }

  function clearAll() {
    setConfirm({
      title: 'Clear all products?',
      message: 'Every product will be removed from the store. This cannot be undone.',
      confirmLabel: 'Clear all',
      onConfirm: async () => {
        setConfirm(null);
        try { await resetProducts(products); showToast('All products cleared.', 'success'); }
        catch { showToast('Clear failed. Check your connection.', 'error'); }
      },
    });
  }

  if (user === undefined) return <div className="admin-auth"><p className="muted">Loading…</p></div>;

  if (!user || !isAdmin) {
    return (
      <div className="admin-auth">
        <div className="auth-card">
          <img src="/brand/jlc-mark-ink.png" alt="JLC" width="105" height="60" />
          <h1 className="auth-title">Store admin</h1>
          {user && !isAdmin ? (
            <>
              <p className="form-err" role="alert">{user.email} is signed in but is not an admin.</p>
              <button className="btn btn-ghost btn-block" onClick={() => signOut(auth)}>Sign out</button>
            </>
          ) : (
            <form className="auth-form" onSubmit={login}>
              {authErr && <p className="form-err" role="alert">{authErr}</p>}
              <div className="field">
                <label htmlFor="a-email">Email</label>
                <input id="a-email" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="username" required />
              </div>
              <div className="field">
                <label htmlFor="a-pass">Password</label>
                <div className="pass-wrap">
                  <input id="a-pass" type={showPass ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)} autoComplete="current-password" required />
                  <button type="button" className="icon-btn" onClick={() => setShowPass(s => !s)}
                    aria-label={showPass ? 'Hide password' : 'Show password'} aria-pressed={showPass}>
                    {showPass ? <EyeSlash size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                  </button>
                </div>
              </div>
              <button type="submit" className="btn btn-solid btn-block" disabled={signingIn}>{signingIn ? 'Signing in…' : 'Sign in'}</button>
            </form>
          )}
          <Link to="/" className="back-link"><ArrowLeft size={14} aria-hidden="true" /> Back to store</Link>
        </div>
      </div>
    );
  }

  const q = search.toLowerCase();
  const filtered = q
    ? products.filter(p => p.name.toLowerCase().includes(q) || catLabel(p.category).toLowerCase().includes(q))
    : products;

  return (
    <div className="admin">
      <header className="admin-bar">
        <div className="admin-brand">
          <img src="/brand/jlc-mark-ink.png" alt="JLC" width="70" height="40" />
          <span className="muted">Admin</span>
        </div>
        <nav className="seg" aria-label="Admin sections">
          <button className={`seg-btn${tab === 'products' ? ' is-active' : ''}`} aria-pressed={tab === 'products'} onClick={() => setTab('products')}>Products</button>
          <button className={`seg-btn${tab === 'orders' ? ' is-active' : ''}`} aria-pressed={tab === 'orders'} onClick={() => setTab('orders')}>Orders</button>
          <button className={`seg-btn${tab === 'news' ? ' is-active' : ''}`} aria-pressed={tab === 'news'} onClick={() => setTab('news')}>Announcements</button>
        </nav>
        <div className="admin-actions">
          <Link to="/" className="btn btn-ghost btn-sm">View store</Link>
          <button className="btn btn-ghost btn-sm" onClick={() => signOut(auth)}>Sign out</button>
        </div>
      </header>

      <div className="admin-content">
        {tab === 'orders' ? <OrdersPanel showToast={showToast} /> : tab === 'news' ? <AnnouncementsPanel showToast={showToast} /> : (
          <>
            <StatsPanel products={products} />
            <div className="admin-panel">
              <div className="panel-head">
                <h2 className="panel-title">Inventory</h2>
                <div className="panel-tools">
                  <input type="search" className="cell-input search-input" placeholder="Search products" aria-label="Search products"
                    value={search} onChange={e => setSearch(e.target.value)} />
                  <button className="btn btn-solid btn-sm" onClick={() => setShowAdd(true)}><Plus size={14} weight="bold" aria-hidden="true" /> Add product</button>
                  <button className="btn btn-danger btn-sm" onClick={clearAll} disabled={products.length === 0}>Clear all</button>
                </div>
              </div>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr><th>Product</th><th>Category</th><th>Price (₦)</th><th>Stock</th><th>Discount, ends</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan="7" className="muted pad center">{products.length ? 'No products match.' : 'No products yet. Add your first one.'}</td></tr>
                    ) : filtered.map(p => (
                      <ProductRow key={p.id} product={p} onSave={saveRow} onDelete={deleteProduct} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {showAdd && <AddProductModal onClose={() => setShowAdd(false)} onAdd={addProduct} />}
      {confirm && <ConfirmModal {...confirm} onCancel={() => setConfirm(null)} />}
      <div className={`toast toast-${toast.type}${toast.visible ? ' is-visible' : ''}`} role="status" aria-live="polite">{toast.message}</div>
    </div>
  );
}
