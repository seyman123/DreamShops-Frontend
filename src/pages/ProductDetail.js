import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaHeart, FaRegHeart, FaMinus, FaPlus, FaShare, FaStar, FaTruck, FaShieldAlt, FaUndo, FaArrowLeft } from 'react-icons/fa';
import { productsAPI, favoritesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { toast } from 'react-toastify';
import api from '../services/api';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { addToCart, refreshCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  const fetchProduct = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await productsAPI.getProductById(id);
      console.log('Product API response:', response);
      
      if (response.data && response.data.data) {
        setProduct(response.data.data);
      } else if (response.data) {
        setProduct(response.data);
      } else {
        setError('Ürün bulunamadı');
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Ürün detayları yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const checkIfFavorite = useCallback(async () => {
    if (isAuthenticated() && user?.id) {
      try {
        const response = await favoritesAPI.getUserFavorites(user.id);
        const favorites = response.data?.data || [];
        setIsFavorite(favorites.some(product => product?.id === parseInt(id)));
      } catch (error) {
        console.error('Error checking favorites:', error);
      }
    }
  }, [id, isAuthenticated, user]);

  useEffect(() => {
    if (id) {
      fetchProduct();
      checkIfFavorite();
    }
  }, [id, fetchProduct, checkIfFavorite]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    if (!user) {
      toast.warning('Sepete ürün eklemek için giriş yapmalısınız!');
      navigate('/login');
      return;
    }

    try {
      setAddingToCart(true);
      
      // Önce kullanıcının sepetini al
      const cartResponse = await api.get('/carts/user/my-cart');
      const cart = cartResponse.data.data;
      
      if (cart && cart.cartId) {
        // Sepete ürün ekle (quantity ile)
        await api.post(`/cartItems/cart/${cart.cartId}/item/${product.id}/add?quantity=${quantity}`);
        await refreshCart();
        toast.success(`${product.name} sepete eklendi!`);
      } else {
        throw new Error('Sepet bulunamadı');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Ürün sepete eklenirken bir hata oluştu.');
      }
    } finally {
      setAddingToCart(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!isAuthenticated()) {
      toast.info('Favorilere eklemek için giriş yapmalısınız');
      navigate('/login');
      return;
    }

    if (!user?.id) {
      toast.error('Kullanıcı bilgisi bulunamadı');
      return;
    }

    try {
      if (isFavorite) {
        await favoritesAPI.removeFromFavorites(user.id, product.id);
        setIsFavorite(false);
        toast.success('Favorilerden kaldırıldı');
      } else {
        await favoritesAPI.addToFavorites(user.id, product.id);
        setIsFavorite(true);
        toast.success('Favorilere eklendi');
      }
    } catch (error) {
      console.error('Favorite toggle error:', error);
      toast.error('Bir hata oluştu');
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.inventory || 10)) {
      setQuantity(newQuantity);
    }
  };

  const mockImages = [
    '/images/iphone-1.jpg',
    '/images/iphone-2.jpg',
    '/images/iphone-3.jpg',
    '/images/iphone-4.jpg'
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="glass p-8 rounded-2xl border border-white border-opacity-20 text-center">
          <div className="w-12 h-12 border-t-4 border-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Ürün yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="glass p-8 rounded-2xl border border-white border-opacity-20 text-center max-w-md">
          <h2 className="text-2xl font-bold text-white mb-4">Ürün Bulunamadı</h2>
          <p className="text-gray-300 mb-6">{error || 'Aradığınız ürün mevcut değil.'}</p>
          <button 
            onClick={() => navigate('/products')}
            className="btn-gradient px-6 py-3 rounded-xl font-semibold"
          >
            Ürünlere Dön
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
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-gray-400">
            <button onClick={() => navigate('/')} className="hover:text-white transition-colors duration-200">
              Ana Sayfa
            </button>
            <span>/</span>
            <button onClick={() => navigate('/products')} className="hover:text-white transition-colors duration-200">
              Ürünler
            </button>
            <span>/</span>
            <span className="text-white">{product.name}</span>
          </div>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-6">
            {/* Main Image */}
            <div className="glass rounded-2xl border border-white border-opacity-20 p-6 hover:shadow-xl hover:shadow-primary-500/20 transition-all duration-300">
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-300 rounded-xl flex items-center justify-center overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <img 
                    src={`http://localhost:9193/api/v1/images/image/${product.images[selectedImage]?.id || product.images[0].id}`}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/images/placeholder.svg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-gray-500 text-lg">Resim Yok</span>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                      selectedImage === index 
                        ? 'border-primary-500 scale-105' 
                        : 'border-white border-opacity-20 hover:border-primary-300'
                    }`}
                  >
                    <img 
                      src={`http://localhost:9193/api/v1/images/image/${image.id}`}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/images/placeholder.svg';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            {/* Title and Price */}
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-4">
                {product.name}
              </h1>
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-sm text-gray-400 bg-white bg-opacity-10 px-3 py-1 rounded-full">
                  {product.brand}
                </span>
                <span className="text-sm text-gray-400 bg-white bg-opacity-10 px-3 py-1 rounded-full">
                  {product.category?.name || 'Kategorisiz'}
                </span>
                {product.currentlyOnSale && (
                  <span className="text-sm font-bold bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1 rounded-full animate-pulse">
                    {product.isFlashSale ? '⚡ FLASH SALE' : '🔥 İNDİRİM'}
                  </span>
                )}
              </div>
              
              {/* Fiyat Bilgileri */}
              {product.currentlyOnSale ? (
                <div className="space-y-2">
                  {/* İndirimli Fiyat */}
                  <div className="flex items-center space-x-4">
                    <div className="text-4xl font-bold text-green-400">
                      ₺{product.effectivePrice?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </div>
                    {product.discountPercentage && (
                      <span className="px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full">
                        -%{product.discountPercentage}
                      </span>
                    )}
                  </div>
                  {/* Orijinal Fiyat */}
                  <div className="flex items-center space-x-4">
                    <div className="text-xl text-gray-400 line-through">
                      ₺{product.price?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </div>
                    {product.savings > 0 && (
                      <span className="text-orange-400 font-medium">
                        ₺{product.savings?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} tasarruf!
                      </span>
                    )}
                  </div>
                  {/* İndirim Süresi */}
                  {product.saleEndDate && (
                    <div className="text-sm text-yellow-400 bg-yellow-400 bg-opacity-10 px-3 py-1 rounded-lg inline-block">
                      ⏰ İndirim süresi: {new Date(product.saleEndDate).toLocaleDateString('tr-TR')} tarihine kadar
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-4xl font-bold gradient-text">
                  ₺{product.price?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="glass p-6 rounded-2xl border border-white border-opacity-20">
              <h3 className="text-xl font-semibold text-white mb-3">Ürün Açıklaması</h3>
              <p className="text-gray-300 leading-relaxed">
                {product.description || 'Bu ürün için açıklama mevcut değil.'}
              </p>
            </div>

            {/* Stock Status */}
            <div className="glass p-6 rounded-2xl border border-white border-opacity-20">
              <div className="flex items-center justify-between">
                <span className="text-white font-semibold">Stok Durumu:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  product.inventory > 0 
                    ? 'bg-green-500 text-white' 
                    : 'bg-red-500 text-white'
                }`}>
                  {product.inventory > 0 ? `${product.inventory} adet mevcut` : 'Stokta yok'}
                </span>
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            {product.inventory > 0 && (
              <div className="glass p-6 rounded-2xl border border-white border-opacity-20">
                <div className="flex items-center space-x-6">
                  {/* Quantity Selector */}
                  <div className="flex items-center space-x-3">
                    <span className="text-white font-semibold">Adet:</span>
                    <div className="flex items-center border border-white border-opacity-20 rounded-lg">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        className="px-3 py-2 text-white hover:bg-white hover:bg-opacity-10 transition-colors duration-200"
                        disabled={quantity <= 1}
                      >
                        -
                      </button>
                      <span className="px-4 py-2 text-white font-medium min-w-[3rem] text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        className="px-3 py-2 text-white hover:bg-white hover:bg-opacity-10 transition-colors duration-200"
                        disabled={quantity >= product.inventory}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="flex-1 btn-gradient py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {addingToCart ? (
                      <>
                        <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin inline mr-3"></div>
                        Ekleniyor...
                      </>
                    ) : (
                      <>
                        <FaShoppingCart className="inline mr-3" />
                        Sepete Ekle
                      </>
                    )}
                  </button>

                  {/* Favorite Button */}
                  <button
                    onClick={handleFavoriteToggle}
                    className={`p-4 rounded-xl border border-white border-opacity-20 transition-all duration-300 hover:scale-105 ${
                      isFavorite 
                        ? 'bg-red-500 text-white' 
                        : 'glass text-gray-400 hover:text-red-400'
                    }`}
                  >
                    {isFavorite ? <FaHeart size={20} /> : <FaRegHeart size={20} />}
                  </button>
                </div>
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass p-4 rounded-xl border border-white border-opacity-20 text-center">
                <FaTruck className="text-2xl text-primary-500 mx-auto mb-2" />
                <p className="text-white font-medium">Ücretsiz Kargo</p>
                <p className="text-gray-400 text-sm">500₺ üzeri</p>
              </div>
              <div className="glass p-4 rounded-xl border border-white border-opacity-20 text-center">
                <FaShieldAlt className="text-2xl text-green-500 mx-auto mb-2" />
                <p className="text-white font-medium">Güvenli Ödeme</p>
                <p className="text-gray-400 text-sm">SSL sertifikalı</p>
              </div>
              <div className="glass p-4 rounded-xl border border-white border-opacity-20 text-center">
                <FaUndo className="text-2xl text-blue-500 mx-auto mb-2" />
                <p className="text-white font-medium">Kolay İade</p>
                <p className="text-gray-400 text-sm">14 gün içinde</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 