import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import Validator from '../utils/validation';

export const useCouponManager = () => {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Apply coupon
  const applyCoupon = useCallback(async (subtotal, formatPrice) => {
    // Validate coupon code first
    const couponValidation = Validator.validateCouponCode(couponCode);
    
    if (!couponValidation.isValid) {
      toast.error(couponValidation.errors[0]);
      return;
    }

    try {
      setApplyingCoupon(true);
      
      // Use sanitized coupon code
      const sanitizedCouponCode = couponValidation.sanitized;
      
      // Backend kupon validasyon endpoint'i
      const response = await api.post('/coupons/validate', null, {
        params: {
          code: sanitizedCouponCode,
          orderAmount: subtotal
        }
      });
      
      // Backend response: { message: "...", data: { valid: boolean, discountAmount: number } }
      if (response.data.data && response.data.data.valid === true) {
        const discountAmount = response.data.data.discountAmount;
        setAppliedCoupon({ code: sanitizedCouponCode, discount: discountAmount });
        setCouponDiscount(discountAmount);
        toast.success(`Kupon uygulandı! ${formatPrice(discountAmount)} tasarruf`);
      } else {
        // Kupon geçersiz - kullanıcıya açıklayıcı mesaj ver
        const message = response.data.message || 'Kupon geçersiz veya kullanım koşullarını karşılamıyor';
        toast.error(message);
      }
    } catch (error) {
      
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message;
        
        if (status === 404) {
          toast.error('Kupon kodu bulunamadı');
        } else if (status === 400) {
          toast.error(message || 'Kupon kullanım koşullarını karşılamıyor');
        } else if (status === 410) {
          toast.error('Kupon süresi dolmuş');
        } else {
          toast.error('Kupon uygulanırken bir hata oluştu');
        }
      } else {
        toast.error('Bağlantı hatası. Lütfen tekrar deneyin.');
      }
    } finally {
      setApplyingCoupon(false);
    }
  }, [couponCode]);

  // Remove applied coupon
  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCouponCode('');
    toast.info('Kupon kaldırıldı');
  }, []);

  // Reset coupon state
  const resetCouponState = useCallback(() => {
    setCouponCode('');
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setApplyingCoupon(false);
  }, []);

  return {
    couponCode,
    setCouponCode,
    appliedCoupon,
    setAppliedCoupon,
    couponDiscount,
    setCouponDiscount,
    applyingCoupon,
    setApplyingCoupon,
    applyCoupon,
    removeCoupon,
    resetCouponState
  };
}; 