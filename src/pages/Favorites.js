import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHeart, FaTrash, FaShoppingCart, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { favoritesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useProductActions } from '../hooks/useProductActions';
import { config, getProductImageUrl } from '../utils/config';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useProductActions();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      
      if (!user || !user.id) {
        setError('Kullanıcı bilgisi bulunamadı');
        setLoading(false);
        return;
      }
      
      const response = await favoritesAPI.getUserFavorites(user.id);
      
      // Backend response yapısına göre veriyi parse et
      let favoritesData = [];
      if (response.data?.data && Array.isArray(response.data.data)) {
        favoritesData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        favoritesData = response.data;
      }
      
      setFavorites(favoritesData);
      setError('');
    } catch (error) {
      setError('Favoriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (productId) => {
    try {
      if (!user || !user.id) {
        toast.error('Kullanıcı bilgisi bulunamadı');
        return;
      }
      
      await favoritesAPI.removeFromFavorites(user.id, productId);
      setFavorites(prev => prev.filter(item => item.id !== productId));
      toast.success('Favorilerden kaldırıldı');
    } catch (error) {
      toast.error('Favori kaldırılırken bir hata oluştu');
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product.id);
      // Toast message is already handled in useProductActions
    } catch (error) {
      toast.error('Sepete eklenirken bir hata oluştu');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  const getImageUrl = (product) => {
    return getProductImageUrl(product);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="glass p-8 rounded-2xl border border-white border-opacity-20 text-center">
          <div className="w-12 h-12 border-t-4 border-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Favoriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="glass p-8 rounded-2xl border border-white border-opacity-20 text-center max-w-md">
          <h2 className="text-2xl font-bold text-white mb-4">Hata</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button 
            onClick={() => {
              setError('');
              fetchFavorites();
            }}
            className="btn-gradient px-6 py-3 rounded-xl font-semibold"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dark:bg-gradient-dark light:bg-gradient-light bg-gradient-light">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/5 left-1/5 w-96 h-96 bg-primary-500 rounded-full opacity-15 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/5 right-1/5 w-96 h-96 bg-secondary-500 rounded-full opacity-15 blur-3xl animate-pulse animation-delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-20 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-black gradient-text mb-4">
            Favorilerim
          </h1>
          <p className="text-gray-300 text-lg">
            Favori ürünleriniz tek yerde
          </p>
        </div>

        {favorites.length === 0 ? (
          /* Empty Favorites */
          <div className="glass p-12 rounded-2xl border border-white border-opacity-20 text-center max-w-2xl mx-auto">
            <div className="text-6xl mb-6">❤️</div>
            <h2 className="text-3xl font-bold text-white mb-4">Henüz favori ürün yok</h2>
            <p className="text-gray-300 mb-8">
              Beğendiğiniz ürünleri favorilere ekleyerek burada görün
            </p>
            <button
              onClick={() => navigate('/products')}
              className="btn-gradient px-8 py-4 rounded-xl font-semibold text-lg"
            >
              Ürünlere Göz At
            </button>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="flex items-center justify-between mb-8">
              <p className="text-gray-300">
                {favorites.length} favori ürün bulundu
              </p>
            </div>

            {/* Favorites Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {favorites.map((product, index) => (
                <div
                  key={product.id}
                  className="glass rounded-2xl border border-white border-opacity-20 overflow-hidden hover:shadow-xl hover:shadow-primary-500/20 hover:-translate-y-2 transition-all duration-300 group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Product Image */}
                  <div className="relative aspect-square bg-gradient-to-br from-gray-100 to-gray-300 overflow-hidden">
                    <img
                      src={getImageUrl(product)}
                      alt={product.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = config.DEFAULT_PLACEHOLDER;
                      }}
                    />
                    
                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center space-x-3 opacity-0 group-hover:opacity-100">
                      <Link
                        to={`/products/${product?.id}`}
                        className="w-12 h-12 flex items-center justify-center rounded-full glass border border-white border-opacity-20 text-white hover:bg-primary-500 hover:bg-opacity-30 hover:scale-110 transition-all duration-300"
                      >
                        <FaEye />
                      </Link>
                      <button
                        onClick={() => removeFavorite(product?.id)}
                        className="w-12 h-12 flex items-center justify-center rounded-full glass border border-white border-opacity-20 text-red-400 hover:bg-red-500 hover:bg-opacity-30 hover:scale-110 transition-all duration-300"
                      >
                        <FaTrash />
                      </button>
                    </div>

                    {/* Favorite Badge */}
                    <div className="absolute top-4 right-4">
                      <button
                        onClick={() => removeFavorite(product?.id)}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 hover:scale-110 transition-all duration-300"
                      >
                        <FaHeart />
                      </button>
                    </div>

                    {/* Category Badge */}
                    {product?.category && (
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-gradient-secondary text-white text-xs font-semibold rounded-full">
                          {product.category.name}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Product Info */}
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors duration-200">
                      {product?.name || 'Ürün Adı'}
                    </h3>
                    
                    {product?.brand && (
                      <p className="text-gray-400 text-sm mb-3">{product.brand}</p>
                    )}
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-2xl font-bold gradient-text">
                        {product?.price ? formatPrice(product.price) : 'Fiyat bilgisi yok'}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="flex-1 btn-gradient py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
                      >
                        <FaShoppingCart className="inline mr-2" />
                        Sepete Ekle
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Favorites; 