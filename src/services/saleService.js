import api from './api';

export const saleService = {
  // Get all products on sale
  getProductsOnSale: async () => {
    try {
      const response = await api.get('/sales/products');
      return response.data;
    } catch (error) {
      console.error('Error fetching products on sale:', error);
      throw error;
    }
  },

  // Get flash sale products
  getFlashSaleProducts: async () => {
    try {
      const response = await api.get('/sales/flash-sale');
      return response.data;
    } catch (error) {
      console.error('Error fetching flash sale products:', error);
      throw error;
    }
  },

  // Get products on sale by category
  getProductsOnSaleByCategory: async (category) => {
    try {
      const response = await api.get(`/sales/category/${category}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching products on sale by category:', error);
      throw error;
    }
  },

  // Admin: Put product on sale
  putProductOnSale: async (productId, saleData) => {
    try {
      console.log('PUT request details:');
      console.log('Product ID:', productId);
      console.log('Sale Data:', saleData);
      
      const response = await api.put(`/sales/product/${productId}/sale`, saleData);
      
      console.log('PUT response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error putting product on sale:');
      console.error('Status:', error.response?.status);
      console.error('Status Text:', error.response?.statusText);
      console.error('Response Data:', error.response?.data);
      console.error('Full Error:', error);
      throw error;
    }
  },

  // Admin: Remove product from sale
  removeProductFromSale: async (productId) => {
    try {
      const response = await api.delete(`/sales/product/${productId}/sale`);
      return response.data;
    } catch (error) {
      console.error('Error removing product from sale:', error);
      throw error;
    }
  }
};

export const couponService = {
  // Get all active coupons
  getActiveCoupons: async () => {
    try {
      const response = await api.get('/coupons/active');
      return response.data;
    } catch (error) {
      console.error('Error fetching active coupons:', error);
      throw error;
    }
  },

  // Validate coupon
  validateCoupon: async (code, orderAmount) => {
    try {
      const response = await api.post('/coupons/validate', null, {
        params: { code, orderAmount }
      });
      return response.data;
    } catch (error) {
      console.error('Error validating coupon:', error);
      throw error;
    }
  },

  // Apply coupon
  applyCoupon: async (code, orderAmount) => {
    try {
      const response = await api.post('/coupons/apply', null, {
        params: { code, orderAmount }
      });
      return response.data;
    } catch (error) {
      console.error('Error applying coupon:', error);
      throw error;
    }
  },

  // Get coupon by code
  getCouponByCode: async (code) => {
    try {
      const response = await api.get(`/coupons/${code}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching coupon by code:', error);
      throw error;
    }
  }
}; 