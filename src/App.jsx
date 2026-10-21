import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProductProvider } from './context/ProductContext';
import { CartProvider } from './context/CartContext';
import ShopPage from './pages/ShopPage';
import AllProductsPage from './pages/AllProductsPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderPage from './pages/OrderPage';
import TrackPage from './pages/TrackPage';
import FaqPage from './pages/FaqPage';

const AdminPage = lazy(() => import('./pages/AdminPage'));

export default function App() {
  return (
    <ProductProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ShopPage />} />
            <Route path="/products" element={<AllProductsPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order/:reference" element={<OrderPage />} />
            <Route path="/track" element={<TrackPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/admin" element={<Suspense fallback={null}><AdminPage /></Suspense>} />
            <Route path="*" element={<ShopPage />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </ProductProvider>
  );
}
