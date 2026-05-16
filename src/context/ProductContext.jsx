import { createContext, useContext, useState, useEffect } from 'react';
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

  useEffect(() => {
    const unsub = onSnapshot(collection(db, COL), snapshot => {
      const data = snapshot.docs.map(normalizeProduct);
      data.sort((a, b) => Number(a.id) - Number(b.id));
      setProducts(data);
      setLoading(false);
    }, error => {
      console.error('Could not load products from Firestore:', error);
      setProducts([]);
      setLoading(false);
    });
    return unsub;
  }, []);

  async function updateProduct(id, price, stock) {
    await setDoc(doc(db, COL, productDocId(id)), { id: Number(id), price, stock }, { merge: true });
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
    <ProductContext.Provider value={{ products, loading, updateProduct, addProduct, deleteProduct, resetProducts }}>
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => useContext(ProductContext);
