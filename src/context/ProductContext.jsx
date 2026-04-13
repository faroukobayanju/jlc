import { createContext, useContext, useState } from 'react';
import { DEFAULT_PRODUCTS } from '../data/products';

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const [products, setProductsState] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('jlc_products')) || DEFAULT_PRODUCTS;
    } catch {
      return DEFAULT_PRODUCTS;
    }
  });

  function setProducts(updated) {
    setProductsState(updated);
    localStorage.setItem('jlc_products', JSON.stringify(updated));
  }

  return (
    <ProductContext.Provider value={{ products, setProducts }}>
      {children}
    </ProductContext.Provider>
  );
}

export const useProducts = () => useContext(ProductContext);
