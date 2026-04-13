import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('jlc_cart')) || [];
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('jlc_cart', JSON.stringify(cart));
  }, [cart]);

  function addToCart(productId, products, qty = 1) {
    const product = products.find(p => p.id === productId);
    if (!product || product.stock === 0) return;
    setCart(prev => {
      const existing = prev.find(i => i.id === productId);
      if (existing) {
        return prev.map(i =>
          i.id === productId
            ? { ...i, qty: Math.min(i.qty + qty, product.stock) }
            : i
        );
      }
      return [...prev, { id: productId, qty: Math.min(qty, product.stock) }];
    });
  }

  function removeFromCart(productId) {
    setCart(prev => prev.filter(i => i.id !== productId));
  }

  function setCartQty(productId, qty, products) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    if (qty <= 0) { removeFromCart(productId); return; }
    setCart(prev =>
      prev.map(i => i.id === productId ? { ...i, qty: Math.min(qty, product.stock) } : i)
    );
  }

  function clearCart() {
    setCart([]);
  }

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  function getSubtotal(products) {
    return cart.reduce((sum, item) => {
      const p = products.find(pr => pr.id === item.id);
      return sum + (p ? p.price * item.qty : 0);
    }, 0);
  }

  return (
    <CartContext.Provider value={{
      cart, isOpen, setIsOpen,
      addToCart, removeFromCart, setCartQty, clearCart,
      cartCount, getSubtotal,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
