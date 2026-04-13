import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { ADMIN_PASSWORD, CURRENCY } from '../config';
import { DEFAULT_PRODUCTS } from '../data/products';

const fmt = n => CURRENCY + Number(n).toLocaleString('en-NG', { minimumFractionDigits: 0 });
const catLabel = c => ({ 'lip-care': 'Lip Care', 'fragrance': 'Fragrance' }[c] || c);

function StockBadge({ stock }) {
  if (stock === 0) return <span className="stock-status stock-out">Sold Out</span>;
  if (stock <= 5) return <span className="stock-status stock-low">Low — {stock} left</span>;
  return <span className="stock-status stock-ok">In Stock</span>;
}

function StatsPanel({ products }) {
  const total = products.length;
  const inStock = products.filter(p => p.stock > 0).length;
  const low = products.filter(p => p.stock > 0 && p.stock <= 5).length;
  const out = products.filter(p => p.stock === 0).length;
  return (
    <div className="admin-stats">
      {[
        { label: 'Total Products', value: total, sub: 'Across all categories', color: '' },
        { label: 'In Stock', value: inStock, sub: 'Available to purchase', color: '#2E7D32' },
        { label: 'Low Stock', value: low, sub: '5 or fewer remaining', color: '#E65100' },
        { label: 'Out of Stock', value: out, sub: 'Marked as sold out', color: '#C62828' },
      ].map(s => (
        <div className="stat-card" key={s.label}>
          <div className="stat-label">{s.label}</div>
          <div className="stat-value" style={s.color ? { color: s.color } : {}}>{s.value}</div>
          <div className="stat-sub">{s.sub}</div>
        </div>
      ))}
    </div>
  );
}

function ProductRow({ product, onSave, onDelete }) {
  const [price, setPrice] = useState(String(Math.round(product.price)));
  const [stock, setStock] = useState(String(product.stock));
  const [changed, setChanged] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setPrice(String(Math.round(product.price)));
    setStock(String(product.stock));
    setChanged(false); setSaved(false);
  }, [product]);

  function handleSave() {
    const p = parseFloat(price), s = parseInt(stock);
    if (isNaN(p) || p < 0 || isNaN(s) || s < 0) return;
    onSave(product.id, p, s);
    setChanged(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <tr>
      <td>
        <div className="td-product">
          <img className="td-img" src={product.image} alt={product.name}
            onError={e => { e.target.src = 'https://placehold.co/44x44/E8DDD3/B8926A?text=?'; }} />
          <div className="td-name">{product.name}</div>
        </div>
      </td>
      <td>
        <span className={`product-badge badge-${product.category}`} style={{ position: 'static' }}>
          {catLabel(product.category)}
        </span>
      </td>
      <td>
        <input className={`editable-input${changed ? ' changed' : ''}`}
          type="number" min="0" step="1" value={price} style={{ width: '90px' }}
          onChange={e => { setPrice(e.target.value); setChanged(true); setSaved(false); }} />
      </td>
      <td>
        <input className={`editable-input${changed ? ' changed' : ''}`}
          type="number" min="0" step="1" value={stock}
          onChange={e => { setStock(e.target.value); setChanged(true); setSaved(false); }} />
      </td>
      <td><StockBadge stock={parseInt(stock) || 0} /></td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button className="save-row-btn" onClick={handleSave} disabled={!changed}>Save</button>
          {saved && (
            <span className="saved-indicator show">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Saved
            </span>
          )}
          <button onClick={() => onDelete(product.id)}
            style={{ padding: '6px 12px', borderRadius: '6px', border: '1.5px solid #FFCDD2', color: '#C62828', fontSize: '13px', background: 'white', cursor: 'pointer', fontFamily: 'inherit' }}>
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

function AddProductModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ name: '', category: 'lip-care', description: '', price: '', stock: '' });
  const [imgTab, setImgTab] = useState('file');
  const [imageData, setImageData] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');

  function switchTab(tab) {
    setImgTab(tab); setImageData(''); setImageUrl(''); setPreview('');
  }

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const MAX = 400;
        let w = img.width, h = img.height;
        if (w > h) { if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; } }
        else { if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; } }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        setImageData(dataUrl); setPreview(dataUrl);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  function submit() {
    setError('');
    if (!form.name.trim()) { setError('Product name is required.'); return; }
    const price = parseFloat(form.price), stock = parseInt(form.stock);
    if (isNaN(price) || price < 0) { setError('Please enter a valid price.'); return; }
    if (isNaN(stock) || stock < 0) { setError('Please enter a valid stock quantity.'); return; }
    const placeholder = form.category === 'lip-care'
      ? 'https://placehold.co/400x400/F0E6DC/9A7355?text=Lip+Care'
      : 'https://placehold.co/400x400/EDD0C8/7B4860?text=Fragrance';
    onAdd({
      name: form.name.trim(), category: form.category,
      description: form.description.trim() || `${form.name.trim()} — available now.`,
      price, stock,
      image: (imgTab === 'file' ? imageData : imageUrl.trim()) || placeholder,
    });
  }

  const tabBtn = (tab, label) => ({
    flex: 1, padding: '9px 12px', fontSize: '13px', fontWeight: 500, border: 'none',
    cursor: 'pointer', fontFamily: 'inherit',
    background: imgTab === tab ? 'var(--primary)' : 'white',
    color: imgTab === tab ? 'white' : 'var(--text-light)',
  });

  return (
    <div style={{ display: 'flex', position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: 'white', borderRadius: '14px', padding: '32px', maxWidth: '500px', width: '100%', boxShadow: '0 8px 40px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ margin: 0 }}>Add New Product</h3>
          <button onClick={onClose} style={{ fontSize: '20px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
        </div>

        <div className="form-group">
          <label>Product Name *</label>
          <input type="text" value={form.name} placeholder="e.g. Vanilla Lip Gloss"
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
        </div>
        <div className="form-group">
          <label>Category *</label>
          <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
            style={{ width: '100%', padding: '11px 14px', borderRadius: '6px', border: '1.5px solid var(--border)', fontSize: '14px', background: 'white' }}>
            <option value="lip-care">Lip Care</option>
            <option value="fragrance">Fragrance</option>
          </select>
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea value={form.description} placeholder="Brief product description" style={{ minHeight: '70px' }}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Price (₦) *</label>
            <input type="number" min="0" step="1" placeholder="0" value={form.price}
              onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Stock Quantity *</label>
            <input type="number" min="0" step="1" placeholder="0" value={form.stock}
              onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} />
          </div>
        </div>

        <div className="form-group">
          <label>Product Image</label>
          <div style={{ display: 'flex', border: '1.5px solid var(--border)', borderRadius: '6px', overflow: 'hidden', marginBottom: '10px' }}>
            <button type="button" style={tabBtn('file')} onClick={() => switchTab('file')}>📁 Upload from Gallery</button>
            <button type="button" style={tabBtn('url')} onClick={() => switchTab('url')}>🔗 Paste URL</button>
          </div>
          {imgTab === 'file' ? (
            <input type="file" accept="image/*" onChange={handleFile}
              style={{ width: '100%', padding: '8px', border: '1.5px solid var(--border)', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', background: 'white' }} />
          ) : (
            <input type="text" value={imageUrl} placeholder="https://... (paste a direct image link)"
              onChange={e => { setImageUrl(e.target.value); setPreview(e.target.value); }} />
          )}
          {preview && (
            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src={preview} alt="Preview"
                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }}
                onError={e => { e.target.style.display = 'none'; }} />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Preview</span>
            </div>
          )}
        </div>

        {error && <div className="auth-error visible" style={{ marginBottom: '12px' }}>{error}</div>}

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '8px' }}>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={submit}>Add Product</button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <div style={{ display: 'flex', position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', borderRadius: '14px', padding: '32px', maxWidth: '380px', width: '90%', boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}>
        <h3 style={{ marginBottom: '12px' }}>{title}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>{message}</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" onClick={onConfirm}>Confirm</button>
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

export default function AdminPage() {
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('jlc_admin') === '1');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [authErr, setAuthErr] = useState(false);

  const { products, setProducts } = useProducts();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const { toast, showToast } = useToast();

  function login(e) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem('jlc_admin', '1');
      setAuthed(true); setAuthErr(false);
    } else {
      setAuthErr(true); setPassword('');
    }
  }

  function logout() {
    sessionStorage.removeItem('jlc_admin');
    setAuthed(false);
  }

  function saveRow(id, newPrice, newStock) {
    const updated = products.map(p => p.id === id ? { ...p, price: newPrice, stock: newStock } : p);
    setProducts(updated);
    showToast(`"${products.find(p => p.id === id)?.name}" updated.`, 'success');
  }

  function deleteProduct(id) {
    const name = products.find(p => p.id === id)?.name;
    setConfirm({
      title: 'Delete Product?',
      message: `"${name}" will be permanently removed. This cannot be undone.`,
      onConfirm: () => {
        setProducts(products.filter(p => p.id !== id));
        setConfirm(null);
        showToast(`"${name}" deleted.`, 'success');
      },
    });
  }

  function addProduct(data) {
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    setProducts([...products, { id: newId, ...data }]);
    setShowAdd(false);
    showToast(`"${data.name}" added successfully.`, 'success');
  }

  function resetDefaults() {
    setConfirm({
      title: 'Reset to Defaults?',
      message: "This will restore all default products and remove any you've added. Custom changes will be lost.",
      onConfirm: () => {
        setProducts(DEFAULT_PRODUCTS);
        setConfirm(null);
        showToast('Products reset to defaults.', 'success');
      },
    });
  }

  const filtered = search
    ? products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        catLabel(p.category).toLowerCase().includes(search.toLowerCase())
      )
    : products;

  if (!authed) {
    return (
      <div className="admin-auth">
        <div className="auth-card">
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>🔒</div>
          <h2>Admin Login</h2>
          <p>Enter your password to manage the store.</p>
          {authErr && <div className="auth-error visible">Incorrect password. Please try again.</div>}
          <form className="auth-form" onSubmit={login}>
            <div className="form-group">
              <label>Password</label>
              <div className="password-input-wrap">
                <input type={showPass ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter admin password" autoComplete="current-password" />
                <button type="button" className="toggle-password" onClick={() => setShowPass(s => !s)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '8px' }}>Sign In</button>
          </form>
          <p style={{ marginTop: '20px', fontSize: '12px', color: 'var(--text-muted)' }}>
            <Link to="/" style={{ color: 'var(--primary)' }}>← Back to store</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard visible">
      <div className="admin-header">
        <div className="admin-logo">
          JLC <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '8px' }}>Admin Panel</span>
        </div>
        <div className="admin-actions">
          <Link to="/" className="btn btn-ghost btn-sm">← View Store</Link>
          <button className="btn btn-ghost btn-sm" onClick={logout} style={{ color: 'var(--text-muted)' }}>Sign Out</button>
        </div>
      </div>

      <div className="admin-content">
        <StatsPanel products={products} />

        <div className="admin-table-wrap">
          <div className="table-header">
            <h2>Product Inventory</h2>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input type="text" className="search-input" placeholder="Search products…"
                value={search} onChange={e => setSearch(e.target.value)} />
              <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>+ Add Product</button>
              <button className="btn btn-outline btn-sm" onClick={resetDefaults}>Reset to Defaults</button>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th style={{ width: '260px' }}>Product</th>
                  <th>Category</th>
                  <th>Price (₦)</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      No products found.
                    </td>
                  </tr>
                ) : filtered.map(p => (
                  <ProductRow key={p.id} product={p} onSave={saveRow} onDelete={deleteProduct} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAdd && <AddProductModal onClose={() => setShowAdd(false)} onAdd={addProduct} />}
      {confirm && (
        <ConfirmModal
          title={confirm.title} message={confirm.message}
          onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)}
        />
      )}
      <div className={`toast ${toast.type} ${toast.visible ? 'show' : ''}`}>{toast.message}</div>
    </div>
  );
}
