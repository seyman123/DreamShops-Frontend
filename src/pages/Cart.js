import React, { useState, useEffect } from 'react';
import { FaShoppingBag, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ordersAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';
import { useCartManager } from '../hooks/useCartManager';
import { useCouponManager } from '../hooks/useCouponManager';

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Custom hooks
  const {
    cartItems,
    loading,
    updating,
    error,
    fetchCartItems,
    updateQuantity,
    removeItem,
    clearCart,
    calculateSubtotal,
    calculateTotal,
    formatPrice,
    getImageUrl
  } = useCartManager();

  const {
    couponCode,
    setCouponCode,
    appliedCoupon,
    couponDiscount,
    applyingCoupon,
    applyCoupon,
    removeCoupon
  } = useCouponManager();

  // Local state
  const [checkingOut, setCheckingOut] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);

  // Calculated values
  const subtotal = calculateSubtotal();
  const total = calculateTotal(couponDiscount);

  // Effects
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCartItems(user);
  }, [user, navigate, fetchCartItems]);

  // Event handlers
  const handleRemoveClick = (item) => {
    setItemToRemove(item);
    setShowRemoveModal(true);
  };

  const handleRemoveConfirm = async () => {
    if (itemToRemove) {
      await removeItem(itemToRemove);
      setShowRemoveModal(false);
      setItemToRemove(null);
    }
  };

  const handleClearCartClick = () => {
    setShowClearModal(true);
  };

  const handleClearConfirm = async () => {
    await clearCart();
    setShowClearModal(false);
  };

  const handleApplyCoupon = () => {
    applyCoupon(subtotal, formatPrice);
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast.warn('Sepetiniz boş');
      return;
    }

    try {
      setCheckingOut(true);

      // Backend'de placeOrder metodu kullanılıyor, kupon kodu ile birlikte

      const response = await ordersAPI.placeOrder(user.id, appliedCoupon?.code);
      
      if (response.data && response.data.success !== false) {
        await clearCart();
        toast.success('Sipariş başarıyla oluşturuldu! 🎉');
        navigate(`/orders`);
      } else {
        throw new Error(response.data?.message || 'Sipariş oluşturulamadı');
      }
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error(error.response.data?.message || 'Sipariş bilgilerinde hata var');
      } else if (error.response?.status === 404) {
        toast.error('Bazı ürünler stokta mevcut değil');
      } else {
        toast.error('Sipariş oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setCheckingOut(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen dark:bg-gradient-dark light:bg-gradient-light bg-gradient-light py-8">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-300">Sepet yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen dark:bg-gradient-dark light:bg-gradient-light bg-gradient-light py-8">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center">
            <div className="glass p-8 rounded-2xl border border-red-500 border-opacity-50">
              <p className="text-red-400 text-lg">{error}</p>
              <button
                onClick={() => fetchCartItems(user)}
                className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Tekrar Dene
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen dark:bg-gradient-dark light:bg-gradient-light bg-gradient-light py-8">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center">
            <div className="glass p-12 rounded-2xl border border-white border-opacity-20 max-w-md mx-auto">
              <FaShoppingBag className="text-6xl text-gray-400 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-white mb-4">Sepetiniz Boş</h1>
              <p className="text-gray-300 mb-8">
                Henüz sepetinize ürün eklenmemiş. Alışverişe başlamak için ürünlerimizi inceleyin.
              </p>
              <button
                onClick={() => navigate('/products')}
                className="bg-gradient-primary text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
              >
                Alışverişe Başla
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dark:bg-gradient-dark light:bg-gradient-light bg-gradient-light py-8">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-4">Sepetim</h1>
          <p className="text-gray-300">
            {cartItems.length} ürün • Toplam: {formatPrice(total)}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Clear Cart Button */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-white">
                Ürünleriniz ({cartItems.length})
              </h2>
              <button
                onClick={handleClearCartClick}
                disabled={updating}
                className="px-4 py-2 bg-red-500 bg-opacity-20 border border-red-500 border-opacity-50 text-red-400 rounded-lg hover:bg-opacity-30 disabled:opacity-50 transition-all duration-300"
              >
                Sepeti Temizle
              </button>
            </div>

            {/* Cart Items List */}
            {cartItems.map((item) => (
              <CartItem
                key={item.itemId}
                item={item}
                updating={updating}
                formatPrice={formatPrice}
                getImageUrl={getImageUrl}
                onUpdateQuantity={updateQuantity}
                onRemove={handleRemoveClick}
              />
            ))}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <CartSummary
              subtotal={subtotal}
              couponDiscount={couponDiscount}
              total={total}
              formatPrice={formatPrice}
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              appliedCoupon={appliedCoupon}
              applyingCoupon={applyingCoupon}
              checkingOut={checkingOut}
              onApplyCoupon={handleApplyCoupon}
              onRemoveCoupon={removeCoupon}
              onCheckout={handleCheckout}
            />
          </div>
        </div>
      </div>

      {/* Remove Item Modal */}
      {showRemoveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="glass p-6 rounded-2xl border border-white border-opacity-20 max-w-md w-full">
            <h3 className="text-xl font-semibold text-white mb-4">Ürünü Kaldır</h3>
            <p className="text-gray-300 mb-6">
              "{itemToRemove?.product?.name}" ürününü sepetten kaldırmak istediğinizden emin misiniz?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRemoveModal(false)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleRemoveConfirm}
                disabled={updating}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {updating ? 'Kaldırılıyor...' : 'Kaldır'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Cart Modal */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="glass p-6 rounded-2xl border border-white border-opacity-20 max-w-md w-full">
            <h3 className="text-xl font-semibold text-white mb-4">Sepeti Temizle</h3>
            <p className="text-gray-300 mb-6">
              Sepetinizdeki tüm ürünleri kaldırmak istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearModal(false)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleClearConfirm}
                disabled={updating}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {updating ? 'Temizleniyor...' : 'Temizle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart; 