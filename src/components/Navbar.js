import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaSearch, FaHeart, FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import DarkModeToggle from './DarkModeToggle';

const NavbarComponent = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
      setIsMenuOpen(false);
    }
  };

  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user?.firstName) {
      return user.firstName;
    } else if (user?.sub) {
      return user.sub.split('@')[0];
    }
    return 'Kullanıcı';
  };

  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 glass-dark border-b border-white border-opacity-10 shadow-glass backdrop-blur-lg">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-2xl lg:text-3xl font-extrabold tracking-widest uppercase transition-all duration-300 hover:scale-105 relative group"
            onClick={closeMenus}
          >
            <span 
              className="animate-pulse"
              style={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent'
              }}
            >
              iPHONE
            </span>{' '}
            <span 
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent'
              }}
            >
              X
            </span>
            <span 
              className="absolute bottom-0 left-0 w-0 h-1 rounded transition-all duration-300 group-hover:w-full"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              }}
            ></span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link 
              to="/" 
              className="relative px-4 py-2 rounded-lg text-white transition-all duration-300 hover:bg-white hover:bg-opacity-10 hover:-translate-y-0.5 group"
            >
              Ana Sayfa
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-primary rounded transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link 
              to="/products"
              className="relative px-4 py-2 rounded-lg text-white transition-all duration-300 hover:bg-white hover:bg-opacity-10 hover:-translate-y-0.5 group"
            >
              Ürünler
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-primary rounded transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link 
              to="/about"
              className="relative px-4 py-2 rounded-lg text-white transition-all duration-300 hover:bg-white hover:bg-opacity-10 hover:-translate-y-0.5 group"
            >
              Hakkımızda
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-primary rounded transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link 
              to="/blog"
              className="relative px-4 py-2 rounded-lg text-white transition-all duration-300 hover:bg-white hover:bg-opacity-10 hover:-translate-y-0.5 group"
            >
              Blog
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-primary rounded transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link 
              to="/sale"
              className="relative px-4 py-2 rounded-lg text-white transition-all duration-300 hover:bg-white hover:bg-opacity-10 hover:-translate-y-0.5 group"
            >
              İndirimler
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-primary rounded transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link 
              to="/contact"
              className="relative px-4 py-2 rounded-lg text-white transition-all duration-300 hover:bg-white hover:bg-opacity-10 hover:-translate-y-0.5 group"
            >
              İletişim
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-primary rounded transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </div>

          {/* Desktop Right Side */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ürün ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48 pl-4 pr-12 py-2 rounded-xl glass border border-white border-opacity-20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                />
                <button 
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-primary-400 transition-colors duration-200"
                >
                  <FaSearch />
                </button>
              </div>
            </form>
            
            {/* Cart */}
            <Link 
              to="/cart" 
              className="relative w-11 h-11 flex items-center justify-center rounded-xl glass border border-white border-opacity-20 text-white text-lg transition-all duration-300 hover:bg-primary-500 hover:bg-opacity-30 hover:-translate-y-0.5 hover:scale-105 hover:shadow-lg hover:shadow-primary-500/40"
            >
              <FaShoppingCart />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold bg-gradient-secondary border-2 border-white animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Favorites */}
            {isAuthenticated() && (
              <Link 
                to="/favorites" 
                className="w-11 h-11 flex items-center justify-center rounded-xl glass border border-white border-opacity-20 text-white text-lg transition-all duration-300 hover:bg-primary-500 hover:bg-opacity-30 hover:-translate-y-0.5 hover:scale-105 hover:shadow-lg hover:shadow-primary-500/40"
              >
                <FaHeart />
              </Link>
            )}

            {/* Dark Mode Toggle */}
            <DarkModeToggle />

            {/* User Menu */}
            {isAuthenticated() ? (
              <div className="relative">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center px-4 py-2 rounded-xl glass border border-white border-opacity-20 text-white font-semibold transition-all duration-300 hover:bg-primary-500 hover:bg-opacity-20 hover:border-primary-500 hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <FaUser className="mr-2" />
                  {getUserDisplayName()}
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 glass border border-white border-opacity-20 rounded-xl shadow-glass z-50">
                    <div className="py-2">
                      <Link 
                        to="/profile"
                        className="block px-4 py-2 text-white hover:bg-primary-500 hover:bg-opacity-20 transition-all duration-200"
                        onClick={closeMenus}
                      >
                        Profilim
                      </Link>
                      <Link 
                        to="/orders"
                        className="block px-4 py-2 text-white hover:bg-primary-500 hover:bg-opacity-20 transition-all duration-200"
                        onClick={closeMenus}
                      >
                        Siparişlerim
                      </Link>
                      <Link 
                        to="/favorites"
                        className="block px-4 py-2 text-white hover:bg-primary-500 hover:bg-opacity-20 transition-all duration-200"
                        onClick={closeMenus}
                      >
                        Favorilerim
                      </Link>
                  {user?.roles?.some(role => role.name === 'ROLE_ADMIN') && (
                    <>
                          <hr className="border-white border-opacity-20 my-1" />
                          <Link 
                            to="/admin/dashboard"
                            className="block px-4 py-2 text-white hover:bg-primary-500 hover:bg-opacity-20 transition-all duration-200"
                            onClick={closeMenus}
                          >
                            Admin Dashboard
                          </Link>
                    </>
                  )}
                      <hr className="border-white border-opacity-20 my-1" />
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-white hover:bg-red-500 hover:bg-opacity-20 transition-all duration-200"
                      >
                    Çıkış Yap
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/login"
                  className="px-4 py-2 rounded-xl border border-primary-500 text-primary-400 hover:bg-primary-500 hover:text-white transition-all duration-300"
                >
                  Giriş Yap
                </Link>
                <Link 
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-gradient-primary text-white font-semibold hover:scale-105 transition-all duration-300"
                >
                  Üye Ol
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg glass border border-white border-opacity-20 text-white"
          >
            {isMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 glass rounded-xl border border-white border-opacity-20">
            <div className="flex flex-col space-y-2 p-4">
              {/* Search */}
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ürün ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-4 pr-12 py-3 rounded-xl glass border border-white border-opacity-20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button 
                    type="submit"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-primary-400"
                  >
                    <FaSearch />
                  </button>
                </div>
              </form>

              {/* Navigation Links */}
              <Link 
                to="/" 
                className="px-4 py-3 rounded-lg text-white hover:bg-white hover:bg-opacity-10 transition-all duration-200"
                onClick={closeMenus}
              >
                Ana Sayfa
              </Link>
              <Link 
                to="/products"
                className="px-4 py-3 rounded-lg text-white hover:bg-white hover:bg-opacity-10 transition-all duration-200"
                onClick={closeMenus}
              >
                Ürünler
              </Link>
              <Link 
                to="/about"
                className="px-4 py-3 rounded-lg text-white hover:bg-white hover:bg-opacity-10 transition-all duration-200"
                onClick={closeMenus}
              >
                Hakkımızda
              </Link>
              <Link 
                to="/blog"
                className="px-4 py-3 rounded-lg text-white hover:bg-white hover:bg-opacity-10 transition-all duration-200"
                onClick={closeMenus}
              >
                Blog
              </Link>
              <Link 
                to="/sale"
                className="px-4 py-3 rounded-lg text-white hover:bg-white hover:bg-opacity-10 transition-all duration-200"
                onClick={closeMenus}
              >
                İndirimler
              </Link>
              <Link 
                to="/contact"
                className="px-4 py-3 rounded-lg text-white hover:bg-white hover:bg-opacity-10 transition-all duration-200"
                onClick={closeMenus}
              >
                İletişim
              </Link>

              {/* Mobile Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-white border-opacity-20">
                <div className="flex items-center space-x-4">
                  <Link 
                    to="/cart" 
                    className="relative w-12 h-12 flex items-center justify-center rounded-xl glass border border-white border-opacity-20 text-white"
                    onClick={closeMenus}
                  >
                    <FaShoppingCart />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full text-xs font-bold bg-gradient-secondary border border-white">
                        {cartCount}
                      </span>
                    )}
                  </Link>

                  {isAuthenticated() && (
                    <Link 
                      to="/favorites" 
                      className="w-12 h-12 flex items-center justify-center rounded-xl glass border border-white border-opacity-20 text-white"
                      onClick={closeMenus}
                    >
                      <FaHeart />
                    </Link>
                  )}

                  {/* Dark Mode Toggle for Mobile */}
                  <DarkModeToggle className="w-12 h-12" />
                </div>

                {isAuthenticated() ? (
                  <div className="flex flex-col space-y-2">
                    <Link 
                      to="/profile"
                      className="px-3 py-2 text-sm rounded-lg text-white hover:bg-white hover:bg-opacity-10"
                      onClick={closeMenus}
                    >
                      {getUserDisplayName()}
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="px-3 py-2 text-sm rounded-lg text-red-400 hover:bg-red-500 hover:bg-opacity-20"
                    >
                      Çıkış Yap
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Link 
                      to="/login"
                      className="px-4 py-2 text-sm rounded-lg border border-primary-500 text-primary-400 text-center"
                      onClick={closeMenus}
                    >
                      Giriş Yap
                    </Link>
                    <Link 
                      to="/register"
                      className="px-4 py-2 text-sm rounded-lg bg-gradient-primary text-white text-center"
                      onClick={closeMenus}
                    >
                      Üye Ol
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavbarComponent; 