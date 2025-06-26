import React, { useState, useEffect } from 'react';
import { FaClock, FaFire, FaPercent, FaGift, FaCopy, FaTag, FaShoppingCart, FaHeart, FaEye, FaSearch, FaFilter } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api, { productsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Sale = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshCart } = useCart();

  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 45,
    seconds: 30
  });
  const [copiedCoupon, setCopiedCoupon] = useState('');
  const [products, setProducts] = useState([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('discount');
  const [addingToCart, setAddingToCart] = useState(null);
  const [activeCoupons, setActiveCoupons] = useState([]);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Load products and coupons on component mount
  useEffect(() => {
    loadProducts();
    loadCoupons();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      // Backend'den indirimli ürünleri çek
      const [saleResponse, flashSaleResponse] = await Promise.all([
        api.get('/sales/products'),
        api.get('/sales/flash-sale')
      ]);
      
      const saleProducts = saleResponse.data.data || [];
      const flashProducts = flashSaleResponse.data.data || [];
      
      // Tüm indirimli ürünleri birleştir
      const allSaleProducts = [...saleProducts, ...flashProducts];
      
      // Duplicateları kaldır
      const uniqueProducts = allSaleProducts.filter((product, index, self) => 
        index === self.findIndex(p => p.id === product.id)
      );

      setProducts(uniqueProducts);
      setFlashSaleProducts(flashProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      setError('İndirimli ürünler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const loadCoupons = async () => {
    try {
      const response = await api.get('/coupons/active');
      setActiveCoupons(response.data.data || []);
    } catch (error) {
      console.error('Error loading coupons:', error);
      // Keep static coupons as fallback
      setActiveCoupons([
        {
          id: 1,
          code: 'FLASH50',
          type: 'FLASH_SALE',
          discountType: 'PERCENTAGE',
          discountValue: 50,
          description: 'Tüm ürünlerde %50 indirim',
          minOrderAmount: 100,
          endDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
        },
        {
          id: 2,
          code: 'WELCOME25',
          type: 'WELCOME',
          discountType: 'PERCENTAGE', 
          discountValue: 25,
          description: 'İlk alışverişte %25 indirim',
          minOrderAmount: 200,
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      ]);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      if (!user) {
        toast.warning('Sepete ürün eklemek için giriş yapmalısınız!');
        navigate('/login');
        return;
      }

      setAddingToCart(product.id);
      
      // Önce kullanıcının sepetini al
      const cartResponse = await api.get('/carts/user/my-cart');
      const cart = cartResponse.data.data;
      
      if (cart && cart.cartId) {
        // Sepete ürün ekle
        await api.post(`/cartItems/cart/${cart.cartId}/item/${product.id}/add?quantity=1`);
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
      setAddingToCart(null);
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    toast.success(`${code} kupon kodu kopyalandı!`);
    setTimeout(() => setCopiedCoupon(''), 2000);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getImageUrl = (product) => {
    if (product.images && product.images.length > 0) {
      // Backend image endpoint'ini kullan
      return `http://localhost:9193/api/v1/images/image/${product.images[0].id}`;
    }
    return '/images/placeholder.svg';
  };

  const getDiscountedPrice = (product) => {
    // Backend'den gelen effectivePrice kullan
    return product.effectivePrice || product.price;
  };

  const getOriginalPrice = (product) => {
    // Backend'den gelen original price kullan
    return product.price;
  };

  const getDiscountPercentage = (product) => {
    if (product.discountPercentage) {
      return product.discountPercentage;
    }
    // Eğer discountPercentage yoksa, price ve effectivePrice'dan hesapla
    if (product.effectivePrice && product.price && product.effectivePrice < product.price) {
      return Math.round(((product.price - product.effectivePrice) / product.price) * 100);
    }
    return 0;
  };

  const getSavingsAmount = (product) => {
    return product.price - (product.effectivePrice || product.price);
  };

  // Kategori İndirimleri (static data)
  const categoryDeals = [
    {
      category: "iPhone Serisi",
      discount: "20%'ye varan",
      description: "Tüm iPhone modellerinde özel indirimler",
      gradient: "from-blue-600 to-purple-600",
      icon: "📱"
    },
    {
      category: "MacBook Koleksiyonu", 
      discount: "25%'ye varan",
      description: "MacBook Air ve Pro modellerinde büyük fırsatlar",
      gradient: "from-pink-600 to-red-600",
      icon: "💻"
    },
    {
      category: "iPad Dünyası",
      discount: "30%'ye varan", 
      description: "iPad Air, Pro ve mini modellerinde süper indirimler",
      gradient: "from-cyan-600 to-blue-600",
      icon: "📱"
    },
    {
      category: "Aksesuar Cenneti",
      discount: "40%'ye varan",
      description: "AirPods, Apple Watch ve diğer aksesuarlarda mega indirimler", 
      gradient: "from-green-600 to-teal-600",
      icon: "🎧"
    }
  ];

  const filteredProducts = products
    .filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'discount':
          return getDiscountPercentage(b) - getDiscountPercentage(a);
        case 'price_low':
          return getDiscountedPrice(a) - getDiscountedPrice(b);
        case 'price_high':
          return getDiscountedPrice(b) - getDiscountedPrice(a);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
              <div className="min-h-screen dark:bg-gradient-dark light:bg-gradient-light bg-gradient-light flex items-center justify-center">
        <div className="glass p-8 rounded-2xl border border-white border-opacity-20 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Flash Sale yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dark:bg-gradient-dark light:bg-gradient-light bg-gradient-light pt-8 pb-16">
      <div className="container mx-auto px-6 max-w-7xl">
        {error && (
          <div className="glass p-4 rounded-lg border border-red-500 mb-8 text-center">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Flash Sale Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center mb-6">
            <FaFire className="text-6xl text-orange-500 animate-pulse mr-4" />
            <h1 className="text-6xl font-bold gradient-text">FLASH SALE</h1>
            <FaFire className="text-6xl text-orange-500 animate-pulse ml-4" />
          </div>
          <p className="text-xl text-gray-300 mb-8">
            Sınırlı süre! Büyük indirimler kaçmadan yakala!
          </p>
          
          {/* Countdown Timer */}
          <div className="flex justify-center space-x-4 mb-8">
            <div className="glass p-4 rounded-lg border border-white border-opacity-20 text-center">
              <div className="text-3xl font-bold text-white">{String(timeLeft.hours).padStart(2, '0')}</div>
              <div className="text-sm text-gray-300">Saat</div>
            </div>
            <div className="flex items-center text-3xl text-white">:</div>
            <div className="glass p-4 rounded-lg border border-white border-opacity-20 text-center">
              <div className="text-3xl font-bold text-white">{String(timeLeft.minutes).padStart(2, '0')}</div>
              <div className="text-sm text-gray-300">Dakika</div>
            </div>
            <div className="flex items-center text-3xl text-white">:</div>
            <div className="glass p-4 rounded-lg border border-white border-opacity-20 text-center">
              <div className="text-3xl font-bold text-white">{String(timeLeft.seconds).padStart(2, '0')}</div>
              <div className="text-sm text-gray-300">Saniye</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="glass p-6 rounded-2xl border border-white border-opacity-20 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Ürün ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500 appearance-none"
              >
                <option value="discount" className="bg-gray-800 text-white">İndirim Oranına Göre</option>
                <option value="price_low" className="bg-gray-800 text-white">Fiyat (Düşük → Yüksek)</option>
                <option value="price_high" className="bg-gray-800 text-white">Fiyat (Yüksek → Düşük)</option>
                <option value="name" className="bg-gray-800 text-white">İsme Göre</option>
              </select>
            </div>
          </div>
        </div>

        {/* Flash Sale Products */}
        {filteredProducts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">
              🔥 Flash Sale Ürünleri ({filteredProducts.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="glass rounded-2xl border border-white border-opacity-20 overflow-hidden hover:border-opacity-40 transition-all duration-300 group">
                  {/* Product Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={getImageUrl(product)}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = '/images/placeholder.svg';
                      }}
                    />
                    
                    {/* Discount Badge */}
                    <div className="absolute top-3 left-3">
                      <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        %{getDiscountPercentage(product)} İNDİRİM
                      </div>
                    </div>
                    
                    {/* Flash Sale Badge */}
                    {product.isFlashSale && (
                      <div className="absolute top-3 right-3">
                        <div className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                          ⚡ FLASH
                        </div>
                      </div>
                    )}

                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3">
                      <button
                        onClick={() => navigate(`/products/${product.id}`)}
                        className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all duration-300"
                      >
                        <FaEye size={20} />
                      </button>
                      <button className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-all duration-300">
                        <FaHeart size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
                    
                    {/* Price */}
                    <div className="mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400 line-through text-sm">
                          {formatPrice(getOriginalPrice(product))}
                        </span>
                        <span className="text-red-400 font-bold text-xl">
                          {formatPrice(getDiscountedPrice(product))}
                        </span>
                      </div>
                    </div>

                    {/* Flash Sale Stock */}
                    {product.isFlashSale && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-300 mb-1">
                          <span>Kalan Stok</span>
                          <span>{product.flashSaleStock} adet</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-orange-500 h-2 rounded-full"
                            style={{ width: `${(product.flashSaleStock / (product.flashSaleStock + 10)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={addingToCart === product.id}
                      className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 disabled:from-gray-600 disabled:to-gray-600 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:cursor-not-allowed"
                    >
                      {addingToCart === product.id ? (
                        <>
                          <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin inline mr-2"></div>
                          Ekleniyor...
                        </>
                      ) : (
                        <>
                          <FaShoppingCart className="inline mr-2" />
                          Sepete Ekle
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Deals */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            🏷️ Kategori İndirimleri
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoryDeals.map((deal, index) => (
              <div key={index} className="glass rounded-2xl border border-white border-opacity-20 overflow-hidden hover:border-opacity-40 transition-all duration-300 group">
                <div className={`bg-gradient-to-br ${deal.gradient} p-6 text-center`}>
                  <div className="text-4xl mb-3">{deal.icon}</div>
                  <h3 className="text-white font-bold text-lg mb-2">{deal.category}</h3>
                </div>
                <div className="p-4 text-center">
                  <div className="text-2xl font-bold text-white mb-2">
                    {deal.discount}
                  </div>
                  <div className="text-orange-400 font-semibold mb-3">İNDİRİM</div>
                  <p className="text-gray-300 text-sm mb-4">{deal.description}</p>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
                    <FaTag className="inline mr-2" />
                    İncele
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coupon Codes */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            🎫 Kupon Kodları
          </h2>
          <div className="glass p-6 rounded-2xl border border-white border-opacity-20 mb-6">
            <div className="flex items-center justify-center text-blue-400 mb-4">
              <FaGift className="mr-3" size={24} />
              <span className="text-lg">Kupon kodlarını kopyalayıp alışveriş sepetinizde kullanabilirsiniz!</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {activeCoupons.map((coupon) => (
              <div key={coupon.id} className="glass rounded-2xl border border-white border-opacity-20 p-6 text-center hover:border-opacity-40 transition-all duration-300">
                <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold mb-4 inline-block">
                  {coupon.type === 'FLASH_SALE' ? 'Flash Sale' : 
                   coupon.type === 'WELCOME' ? 'Hoş Geldin' :
                   coupon.type === 'MEGA_DISCOUNT' ? 'Mega İndirim' :
                   coupon.type === 'GENERAL' ? 'Genel' : coupon.type}
                </div>
                
                <div className="bg-white bg-opacity-10 rounded-lg p-3 mb-4">
                  <div className="text-2xl font-bold text-white mb-2">{coupon.code}</div>
                  <button 
                    onClick={() => copyToClipboard(coupon.code)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    <FaCopy className="inline mr-1" />
                    {copiedCoupon === coupon.code ? 'Kopyalandı!' : 'Kopyala'}
                  </button>
                </div>
                
                <div className="text-3xl font-bold text-orange-400 mb-2">
                  {coupon.discountType === 'PERCENTAGE' ? `%${coupon.discountValue}` : 
                   coupon.discountType === 'FIXED_AMOUNT' ? `₺${coupon.discountValue}` : 'Özel'}
                </div>
                
                <p className="text-gray-300 text-sm mb-3">{coupon.description}</p>
                
                <div className="text-xs text-gray-400">
                  <div>Min. {formatPrice(coupon.minOrderAmount || 0)} alışveriş</div>
                  <div className="flex items-center justify-center mt-1">
                    <FaClock className="mr-1" />
                    {coupon.endDate ? new Date(coupon.endDate).toLocaleDateString('tr-TR') : 'Süresiz'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Special Offers */}
        <div className="glass rounded-2xl border border-white border-opacity-20 p-8">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">🎉 Özel Teklifler</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <FaGift className="text-5xl text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Ücretsiz Kargo</h3>
              <p className="text-gray-300">500₺ üzeri tüm siparişlerde</p>
            </div>
            <div className="text-center">
              <FaPercent className="text-5xl text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Taksit İmkanı</h3>
              <p className="text-gray-300">12 aya varan taksit seçenekleri</p>
            </div>
            <div className="text-center">
              <FaClock className="text-5xl text-orange-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Hızlı Teslimat</h3>
              <p className="text-gray-300">Aynı gün kargo imkanı</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sale; 