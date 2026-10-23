import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';

const ProductContext = createContext();
const COL = 'store_products';

function normalizeProduct(snapshotDoc) {
  const data = snapshotDoc.data();
  const parsedId = Number(data.id ?? snapshotDoc.id);
  const id = Number.isFinite(parsedId) ? parsedId : snapshotDoc.id;
  return { ...data, id };
}

function productDocId(id) {
  if (id === undefined || id === null || id === '') {
    throw new Error('Product is missing an id.');
  }
  return String(id);
}

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(false);

  // Shoppers get the small CDN-cached catalog; photos load separately as cached files.
  useEffect(() => {
    if (live) return;
    let cancelled = false;
    fetch('/api/products')
      .then(r => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(({ products: list }) => { if (!cancelled) { setProducts(list); setLoading(false); } })
      // Fallback (e.g. `vite dev` without the API): read Firestore directly.
      .catch(() => { if (!cancelled) setLive(true); });
    return () => { cancelled = true; };
  }, [live]);

  // Admin (and the fallback) use a live Firestore subscription so edits show immediately.
  useEffect(() => {
    if (!live) return;
    return onSnapshot(collection(db, COL), snapshot => {
      const data = snapshot.docs.map(normalizeProduct);
      data.sort((a, b) => Number(a.id) - Number(b.id));
      setProducts(data);
      setLoading(false);
    }, error => {
      console.error('Could not load products from Firestore:', error);
      setLoading(false);
    });
  }, [live]);

  const goLive = useCallback(() => setLive(true), []);

  // fields: any of price, stock, discountPercent, discountEndsAt (ms or null).
  async function updateProduct(id, fields) {
    await setDoc(doc(db, COL, productDocId(id)), { ...fields, id: Number(id) }, { merge: true });
  }

  async function addProduct(product) {
    const docId = productDocId(product.id);
    await setDoc(doc(db, COL, docId), { ...product, id: Number(product.id) });
  }

  async function deleteProduct(id) {
    await deleteDoc(doc(db, COL, productDocId(id)));
  }

  async function resetProducts(currentProducts) {
    const batch = writeBatch(db);
    currentProducts.forEach(p => {
      batch.delete(doc(db, COL, productDocId(p.id)));
    });
    await batch.commit();
  }

  return (
    <ProductContext.Provider value={{ products, loading, goLive, updateProduct, addProduct, deleteProduct, resetProducts }}>
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => useContext(ProductContext);
