import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useCart } from '../contexts/CartContext';
import logger from '../utils/logger';

export const useCartManager = () => {
  const { refreshCart } = useCart();
  
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  // Fetch cart items
  const fetchCartItems = useCallback(async (user) => {
    if (!user) {
      console.log('No user provided to fetchCartItems');
      return;
    }
    
    console.log('=== FETCHING CART ITEMS ===');
    console.log('User:', user);
    
    try {
      setLoading(true);
      
      const response = await api.get('/carts/user/my-cart');
      console.log('Cart fetch response:', response.data);
      
      if (response.data && response.data.data) {
        const cart = response.data.data;
        console.log('Cart data:', cart);
        
        // Backend'de field adı "items" ama "cartItems" de deneyelim
        const items = cart.items || cart.cartItems || [];
        console.log('Cart items:', items);
        console.log('Cart items length:', items.length);
        console.log('Available cart fields:', Object.keys(cart));
        
        setCartItems(items);
      } else {
        console.log('No cart data found, setting empty array');
        setCartItems([]);
      }
      
      setError('');
    } catch (error) {
      console.error('Error fetching cart:', error);
      logger.error('Error fetching cart', error, { userId: user?.id });
      setError('Sepet yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
      setCartItems([]);
    } finally {
      setLoading(false);
      console.log('=== FETCH CART ITEMS COMPLETED ===');
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
      console.error('Error updating quantity:', error);
      toast.error('Miktar güncellenirken bir hata oluştu');
    } finally {
      setUpdating(false);
    }
  }, [refreshCart]);

  // Remove item from cart
  const removeItem = useCallback(async (item) => {
    try {
      setUpdating(true);
      
      const cartResponse = await api.get('/carts/user/my-cart');
      const cart = cartResponse.data.data;
      
      if (cart && cart.cartId) {
        await api.delete(`/cartItems/cart/${cart.cartId}/item/${item.product.id}/remove`);
        
        setCartItems(prevItems => 
          prevItems.filter(cartItem => cartItem.itemId !== item.itemId)
        );
        
        await refreshCart();
        toast.success('Ürün sepetten kaldırıldı');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Ürün çıkarılırken bir hata oluştu');
    } finally {
      setUpdating(false);
    }
  }, [refreshCart]);

  // Clear entire cart
  const clearCart = useCallback(async () => {
    try {
      setUpdating(true);
      await api.delete('/carts/user/clear');
      
      setCartItems([]);
      await refreshCart();
      
      toast.success('Sepet temizlendi');
    } catch (error) {
      console.error('Error clearing cart:', error);
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
    if (product?.images && product.images.length > 0) {
      return `http://localhost:9193/api/v1${product.images[0].downloadUrl}`;
    }
    return '/images/placeholder.svg';
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