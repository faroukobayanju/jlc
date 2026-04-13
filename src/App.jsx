import { HashRouter, Routes, Route } from 'react-router-dom';
import { ProductProvider } from './context/ProductContext';
import { CartProvider } from './context/CartContext';
import ShopPage from './pages/ShopPage';
import AllProductsPage from './pages/AllProductsPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <ProductProvider>
      <CartProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<ShopPage />} />
            <Route path="/products" element={<AllProductsPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </HashRouter>
      </CartProvider>
    </ProductProvider>
  );
}
