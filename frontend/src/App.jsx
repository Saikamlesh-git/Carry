import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

// Public User Pages
import OrderPage from './pages/user/OrderPage';
import OrderSuccessPage from './pages/user/OrderSuccessPage';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminSettings from './pages/admin/AdminSettings';

export default function App() {
  return (
    <HashRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <Routes>
              {/* ================= PUBLIC STORE ROUTES ================= */}
              {/* No Admin links, buttons, or texts visible anywhere here */}
              <Route path="/" element={<OrderPage />} />
              <Route path="/order-success" element={<OrderSuccessPage />} />

              {/* ================= ADMIN ROUTES ================= */}
              {/* Accessible ONLY by manually navigating to /admin */}
              <Route path="/admin" element={<AdminLogin />} />

              {/* Protected Admin Subroutes */}
              <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/products" element={<AdminProducts />} />
                <Route path="/admin/categories" element={<AdminCategories />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/settings" element={<AdminSettings />} />
              </Route>

              {/* Catch-all redirect to public store */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </HashRouter>
  );
}
