import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated() && user) {
      fetchCart();
    } else {
      setCartItems([]);
      setCartCount(0);
      setCartTotal(0);
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      
      
      const response = await cartAPI.getUserCart();
      const cart = response.data.data;
      
      if (cart && cart.items && Array.isArray(cart.items) && cart.items.length > 0) {
        // Directly use the items array instead of Array.from to avoid circular reference issues
        const items = cart.items.map(item => ({
          id: item.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          product: {
            id: item.product.id,
            name: item.product.name,
            brand: item.product.brand,
            price: item.product.price,
            inventory: item.product.inventory,
            description: item.product.description,
            category: item.product.category,
            images: item.product.images
          }
        }));
        
        
        setCartItems(items);
        const count = items.reduce((sum, item) => sum + item.quantity, 0);
        const total = items.reduce((sum, item) => sum + (item.totalPrice || item.unitPrice * item.quantity), 0);
        setCartCount(count);
        setCartTotal(total);
      } else {
        setCartItems([]);
        setCartCount(0);
        setCartTotal(0);
      }
    } catch (error) {
      setCartItems([]);
      setCartCount(0);
      setCartTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const refreshCart = () => {
    if (isAuthenticated() && user) {
      fetchCart();
    }
  };

  const value = {
    cartItems,
    cartCount,
    cartTotal,
    loading,
    refreshCart,
    fetchCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 