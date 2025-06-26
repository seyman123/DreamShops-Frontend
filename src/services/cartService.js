import api from './api';
import logger from '../utils/logger';

export const addToCart = async (productId, quantity = 1) => {
  try {
    // First get user's cart
    const cartResponse = await api.get('/carts/user/my-cart');
    const cart = cartResponse.data.data;
    
    if (!cart) {
      throw new Error('User cart not found');
    }

    // Then add item to cart using the correct endpoint
    const response = await api.post(`/cartItems/cart/${cart.cartId}/item/${productId}/add?quantity=${quantity}`);
    return response.data;
  } catch (error) {
    logger.error('Error adding to cart', error, { productId, quantity });
    throw error;
  }
};

export const getCart = async () => {
  try {
    const response = await api.get('/carts/user/my-cart');
    return response.data;
  } catch (error) {
    logger.error('Error fetching cart', error, { userId: 'user' });
    throw error;
  }
};

export const updateCartItemQuantity = async (cartId, productId, quantity) => {
  try {
    const response = await api.put(`/cartItems/cart/${cartId}/item/${productId}/update?quantity=${quantity}`);
    return response.data;
  } catch (error) {
    logger.error('Error updating cart item quantity', error, { cartId, productId, quantity });
    throw error;
  }
};

export const removeFromCart = async (cartId, productId) => {
  try {
    const response = await api.delete(`/cartItems/cart/${cartId}/item/${productId}/remove`);
    return response.data;
  } catch (error) {
    logger.error('Error removing from cart', error, { cartId, productId });
    throw error;
  }
};

export const clearCart = async (cartId) => {
  try {
    const response = await api.delete(`/carts/${cartId}/clear`);
    return response.data;
  } catch (error) {
    logger.error('Error clearing cart', error, { cartId });
    throw error;
  }
}; 