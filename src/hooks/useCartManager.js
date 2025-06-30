import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import { removeFromCart, clearCart as clearUserCart } from '../services/cartService';
import { useCart } from '../contexts/CartContext';
import logger from '../utils/logger';
import { config, getProductImageUrl } from '../utils/config';

export const useCartManager = () => {
  const { refreshCart } = useCart();
  
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  // Fetch cart items
  const fetchCartItems = useCallback(async (user) => {
    if (!user) {
      return;
    }
    
    
    try {
      setLoading(true);
      
      const response = await api.get('/carts/user/my-cart');
      
      if (response.data && response.data.data) {
        const cart = response.data.data;
        
        // Backend'de field adı "items" ama "cartItems" de deneyelim
        const items = cart.items || cart.cartItems || [];
        
        setCartItems(items);
      } else {
        setCartItems([]);
      }
      
      setError('');
    } catch (error) {
      logger.error('Error fetching cart', error, { userId: user?.id });
      setError('Sepet yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update item quantity
  const updateQuantity = useCallback(async (item, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      setUpdating(true);
      
      const cartResponse = await api.get('/carts/user/my-cart');
      const cart = cartResponse.data.data;
      
      if (cart && cart.cartId) {
        const updateUrl = `/cartItems/cart/${cart.cartId}/item/${item.product.id}/update?quantity=${newQuantity}`;
        await api.put(updateUrl);
        
        setCartItems(prevItems => 
          prevItems.map(cartItem => 
            cartItem.itemId === item.itemId 
              ? { ...cartItem, quantity: newQuantity, totalPrice: cartItem.unitPrice * newQuantity }
              : cartItem
          )
        );
        
        await refreshCart();
        toast.success(`Miktar ${newQuantity} olarak güncellendi`);
      }
    } catch (error) {
      toast.error('Miktar güncellenirken bir hata oluştu');
    } finally {
      setUpdating(false);
    }
  }, [refreshCart]);

  // Remove item from cart
  const removeItem = useCallback(async (item) => {
    try {
      setUpdating(true);
      
      
      // Validate item data first
      if (!item) {
        toast.error('Ürün bilgisi bulunamadı');
        return;
      }
      
      if (!item.product || !item.product.id) {
        toast.error('Ürün ID bilgisi bulunamadı');
        return;
      }
      
      // Get cart info first
      const cartResponse = await api.get('/carts/user/my-cart');
      const cart = cartResponse.data.data;
      
      
      if (!cart || !cart.cartId) {
        toast.error('Sepet bilgisi bulunamadı');
        return;
      }
      
      // Ensure IDs are numbers (convert if necessary)
      const cartId = Number(cart.cartId);
      const productId = Number(item.product.id);
      
      
      if (isNaN(cartId) || isNaN(productId)) {
        toast.error('Geçersiz ID formatı');
        return;
      }
      
      // Use cartService function with proper parameters
      await removeFromCart(cartId, productId);
      
      // Update local state
      setCartItems(prevItems => 
        prevItems.filter(cartItem => cartItem.itemId !== item.itemId)
      );
      
      await refreshCart();
      toast.success('Ürün sepetten kaldırıldı');
      
    } catch (error) {
      
      
      // More specific error messages
      if (error.response?.status === 404) {
        toast.error('Ürün sepette bulunamadı');
      } else if (error.response?.status === 500) {
        toast.error('Sunucu hatası. Lütfen daha sonra tekrar deneyin.');
      } else {
        toast.error('Ürün çıkarılırken bir hata oluştu');
      }
    } finally {
      setUpdating(false);
    }
  }, [refreshCart]);

  // Clear entire cart
  const clearCart = useCallback(async () => {
    try {
      setUpdating(true);
      
      // Get cart info first for proper endpoint
      const cartResponse = await api.get('/carts/user/my-cart');
      const cart = cartResponse.data.data;
      
      if (cart && cart.cartId) {
        await clearUserCart(cart.cartId);
      } else {
        // Fallback to user endpoint if cart not found
        await api.delete('/carts/user/clear');
      }
      
      setCartItems([]);
      await refreshCart();
      
      toast.success('Sepet temizlendi');
    } catch (error) {
      toast.error('Sepet temizlenirken bir hata oluştu');
    } finally {
      setUpdating(false);
    }
  }, [refreshCart]);

  // Calculate subtotal
  const calculateSubtotal = useCallback(() => {
    return cartItems.reduce((total, item) => {
      const itemPrice = item.product?.effectivePrice || item.product?.price || item.unitPrice || 0;
      return total + (itemPrice * item.quantity);
    }, 0);
  }, [cartItems]);

  // Calculate total with discounts
  const calculateTotal = useCallback((couponDiscount = 0) => {
    const subtotal = calculateSubtotal();
    return Math.max(0, subtotal - couponDiscount);
  }, [calculateSubtotal]);

  // Format price helper
  const formatPrice = useCallback((price) => {
    if (typeof price === 'number') {
      return price.toLocaleString('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    }
    return '₺0';
  }, []);

  // Get image URL helper
  const getImageUrl = useCallback((product) => {
    return getProductImageUrl(product);
  }, []);

  return {
    cartItems,
    setCartItems,
    loading,
    setLoading,
    updating,
    setUpdating,
    error,
    setError,
    fetchCartItems,
    updateQuantity,
    removeItem,
    clearCart,
    calculateSubtotal,
    calculateTotal,
    formatPrice,
    getImageUrl
  };
}; 