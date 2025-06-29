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
      console.log('=== REMOVING ITEM FROM CART ===');
      console.log('Full item object:', JSON.stringify(item, null, 2));
      console.log('Product object:', JSON.stringify(item.product, null, 2));
      console.log('Product ID:', item.product?.id);
      console.log('Product ID type:', typeof item.product?.id);
      console.log('Item ID:', item.itemId);
      console.log('Item ID type:', typeof item.itemId);
      
      // Validate item data first
      if (!item) {
        toast.error('Ürün bilgisi bulunamadı');
        return;
      }
      
      if (!item.product || !item.product.id) {
        console.error('Product or product ID is missing:', item);
        toast.error('Ürün ID bilgisi bulunamadı');
        return;
      }
      
      // Get cart info first
      const cartResponse = await api.get('/carts/user/my-cart');
      const cart = cartResponse.data.data;
      console.log('Cart response full:', JSON.stringify(cart, null, 2));
      console.log('Cart ID:', cart?.cartId);
      console.log('Cart ID type:', typeof cart?.cartId);
      
      if (!cart || !cart.cartId) {
        console.error('Cart not found or cartId missing');
        toast.error('Sepet bilgisi bulunamadı');
        return;
      }
      
      // Ensure IDs are numbers (convert if necessary)
      const cartId = Number(cart.cartId);
      const productId = Number(item.product.id);
      
      console.log('Final IDs - Cart:', cartId, 'Product:', productId);
      
      if (isNaN(cartId) || isNaN(productId)) {
        console.error('Invalid ID formats:', { cartId, productId });
        toast.error('Geçersiz ID formatı');
        return;
      }
      
      // Use cartService function with proper parameters
      await removeFromCart(cartId, productId);
      console.log('Remove request successful');
      
      // Update local state
      setCartItems(prevItems => 
        prevItems.filter(cartItem => cartItem.itemId !== item.itemId)
      );
      
      await refreshCart();
      toast.success('Ürün sepetten kaldırıldı');
      
    } catch (error) {
      console.error('Error removing item:', error);
      console.log('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      
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