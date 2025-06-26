import React from 'react';
import { FaCreditCard, FaLock, FaTimes } from 'react-icons/fa';

const CartSummary = ({
  subtotal,
  couponDiscount,
  total,
  formatPrice,
  couponCode,
  setCouponCode,
  appliedCoupon,
  applyingCoupon,
  checkingOut,
  onApplyCoupon,
  onRemoveCoupon,
  onCheckout
}) => {
  return (
    <div className="glass p-6 rounded-2xl border border-white border-opacity-20 sticky top-8">
      <h2 className="text-2xl font-bold text-white mb-6">Sipariş Özeti</h2>
      
      {/* Price Breakdown */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between text-gray-300">
          <span>Ara Toplam:</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        
        {/* Coupon Section */}
        <div className="border-t border-gray-600 pt-4">
          {!appliedCoupon ? (
            <div className="space-y-3">
              <label className="text-sm text-gray-300">İndirim Kuponu:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Kupon kodunu girin"
                  className="flex-1 px-3 py-2 rounded-lg glass border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  disabled={applyingCoupon}
                />
                <button
                  onClick={onApplyCoupon}
                  disabled={!couponCode.trim() || applyingCoupon}
                  className="px-4 py-2 bg-green-500 bg-opacity-20 border border-green-500 border-opacity-50 text-green-400 rounded-lg hover:bg-opacity-30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {applyingCoupon ? (
                    <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Uygula'
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center text-green-400">
                <span className="text-sm">
                  Kupon: {appliedCoupon.code}
                </span>
                <button
                  onClick={onRemoveCoupon}
                  className="text-red-400 hover:text-red-300 transition-colors duration-200"
                >
                  <FaTimes />
                </button>
              </div>
              <div className="flex justify-between text-green-400">
                <span>İndirim:</span>
                <span>-{formatPrice(couponDiscount)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Shipping */}
        <div className="flex justify-between text-gray-300">
          <span>Kargo:</span>
          <span className="text-green-400">Ücretsiz</span>
        </div>
      </div>

      {/* Total */}
      <div className="border-t border-gray-600 pt-4 mb-6">
        <div className="flex justify-between text-white text-xl font-bold">
          <span>Toplam:</span>
          <span className="text-primary-400">{formatPrice(total)}</span>
        </div>
        {couponDiscount > 0 && (
          <div className="text-sm text-green-400 text-right mt-1">
            {formatPrice(couponDiscount)} tasarruf ettiniz!
          </div>
        )}
      </div>

      {/* Checkout Button */}
      <button
        onClick={onCheckout}
        disabled={checkingOut}
        className="w-full bg-gradient-primary text-white py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
      >
        {checkingOut ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>İşleniyor...</span>
          </>
        ) : (
          <>
            <FaCreditCard />
            <span>Ödeme Yap</span>
          </>
        )}
      </button>

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 mt-4 text-gray-400 text-sm">
        <FaLock />
        <span>256-bit SSL ile güvenli ödeme</span>
      </div>

      {/* Payment Info */}
      <div className="mt-4 p-4 glass border border-green-500 border-opacity-30 rounded-lg">
        <div className="text-green-400 text-sm font-medium mb-2">
          ✓ Güvenli Ödeme Garantisi
        </div>
        <div className="text-gray-300 text-xs space-y-1">
          <div>• Kredi kartı bilgileriniz güvende</div>
          <div>• 14 gün içinde ücretsiz iade</div>
          <div>• 24/7 müşteri desteği</div>
        </div>
      </div>
    </div>
  );
};

export default CartSummary; 