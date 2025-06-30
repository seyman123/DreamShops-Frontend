import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { favoritesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import api from '../services/api';
import logger from '../utils/logger';
import { config, getProductImageUrl } from '../utils/config';

export const useProductActions = () => {
  const [addingToCart, setAddingToCart] = useState({});
  const [favorites, setFavorites] = useState(new Set());
  
  const { user } = useAuth();
  const { refreshCart } = useCart();

  // Format price helper - MEMOIZED
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

  // Add to cart function
  const addToCart = useCallback(async (productId) => {
    if (!user) {
      toast.warn('Sepete ürün eklemek için giriş yapmalısınız');
      return;
    }

    // Check if user has valid token
    const token = localStorage.getItem(config.TOKEN_STORAGE_KEY);
    if (!token) {
      toast.error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
      return;
    }

    try {
      setAddingToCart(prev => ({ ...prev, [productId]: true }));
      
      // Önce kullanıcının sepetini al veya oluştur
      const cartResponse = await api.get('/carts/user/my-cart');
      
      const cart = cartResponse.data.data;

      if (cart && cart.cartId) {
        // Backend'deki doğru endpoint'i kullan
        const addResponse = await api.post(`/cartItems/cart/${cart.cartId}/item/${productId}/add?quantity=1`);
        
        await refreshCart();
        toast.success('Ürün sepete eklendi! 🛒');
      } else {
        // Sepet yoksa alternatif endpoint kullan
        const addResponse = await api.post(`/cartItems/item/add?productId=${productId}&quantity=1`);
        
        await refreshCart();
        toast.success('Ürün sepete eklendi! 🛒');
      }
    } catch (error) {
      
      
      logger.error('Error adding to cart', error);
      
      if (error.response?.status === 401) {
        toast.error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        // Clear invalid token
        localStorage.removeItem(config.TOKEN_STORAGE_KEY);
        localStorage.removeItem(config.USER_STORAGE_KEY);
      } else if (error.response?.status === 404) {
        toast.error('Ürün bulunamadı');
      } else if (error.response?.status === 500) {
        const errorMessage = error.response?.data?.message || 'Sunucu hatası';
        toast.error(`Sunucu hatası: ${errorMessage}`);
      } else {
        const errorMessage = error.response?.data?.message || error.message || 'Bilinmeyen hata';
        toast.error(`Ürün sepete eklenirken hata: ${errorMessage}`);
      }
    } finally {
      setAddingToCart(prev => ({ ...prev, [productId]: false }));
    }
  }, [user, refreshCart]);

  // Toggle favorite function
  const toggleFavorite = useCallback(async (productId) => {
    if (!user?.id) {
      toast.warn('Favorilere eklemek için giriş yapmalısınız');
      return;
    }

    try {
      const isFavorite = favorites.has(productId);
      
      if (isFavorite) {
        await favoritesAPI.removeFromFavorites(user.id, productId);
        setFavorites(prev => {
          const newFavorites = new Set(prev);
          newFavorites.delete(productId);
          return newFavorites;
        });
        toast.success('Favorilerden kaldırıldı');
      } else {
        await favoritesAPI.addToFavorites(user.id, productId);
        setFavorites(prev => new Set([...prev, productId]));
        toast.success('Favorilere eklendi ❤️');
      }
    } catch (error) {
      logger.error('Error toggling favorite', error);
      toast.error('Favori işlemi sırasında bir hata oluştu');
    }
  }, [user, favorites]);

  // Fetch user favorites
  const fetchUserFavorites = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await favoritesAPI.getUserFavorites(user.id);
      const favoriteProducts = response.data.data || [];
      const favoriteIds = new Set(favoriteProducts.map(product => product.id));
      setFavorites(favoriteIds);
    } catch (error) {
      logger.error('Error fetching favorites', error);
    }
  }, [user]);

  // Get image URL helper (now uses centralized function) - MEMOIZED
  const getImageUrl = useCallback((product) => {
    return getProductImageUrl(product);
  }, []);

  return {
    addingToCart,
    favorites,
    setFavorites,
    formatPrice,
    addToCart,
    toggleFavorite,
    fetchUserFavorites,
    getImageUrl
  };
}; 