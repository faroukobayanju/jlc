import { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { DEFAULT_PRODUCTS } from '../data/products';

const ProductContext = createContext();
const COL = 'products';

export function ProductProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, COL), snapshot => {
      const data = snapshot.docs.map(d => d.data());
      data.sort((a, b) => a.id - b.id);
      setProducts(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  async function updateProduct(id, price, stock) {
    await setDoc(doc(db, COL, String(id)), { price, stock }, { merge: true });
  }

  async function addProduct(product) {
    await setDoc(doc(db, COL, String(product.id)), product);
  }

  async function deleteProduct(id) {
    await deleteDoc(doc(db, COL, String(id)));
  }

  async function resetProducts(currentProducts) {
    const batch = writeBatch(db);
    currentProducts.forEach(p => {
      batch.delete(doc(db, COL, String(p.id)));
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
