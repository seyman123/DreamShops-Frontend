import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import NavbarComponent from './components/Navbar';
import AdminDashboard from './components/admin/AdminDashboard';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import AdminPanel from './pages/AdminPanel';
import AdminSales from './pages/AdminSales';
import About from './pages/About';
import Blog from './pages/Blog';
import Sale from './pages/Sale';
import Contact from './pages/Contact';
import Favorites from './pages/Favorites';
import 'react-toastify/dist/ReactToastify.css';
import ErrorBoundary from './components/ErrorBoundary';

// Loading component (artık kullanılmayacak ama bırakıyoruz)
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-white text-lg">Yükleniyor...</p>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ErrorBoundary>
          <Router basename="/">
            <div className="min-h-screen flex flex-col dark:bg-gradient-dark light:bg-gradient-light bg-gradient-light transition-colors duration-300">
              <NavbarComponent />
              <main className="flex-1 pt-0 animate-fade-in">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/admin" element={<AdminPanel />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/sales" element={<AdminSales />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/sale" element={<Sale />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/favorites" element={<Favorites />} />
                </Routes>
              </main>
              <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
                className="z-50"
              />
            </div>
          </Router>
        </ErrorBoundary>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
