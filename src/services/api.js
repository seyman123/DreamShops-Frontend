import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import logger from '../utils/logger';
import { config } from '../utils/config';

// Create axios instance
const api = axios.create({
  baseURL: config.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: config.API_TIMEOUT,
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    logger.info(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    logger.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    logger.info(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    logger.error('API Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      localStorage.removeItem(config.TOKEN_STORAGE_KEY);
      localStorage.removeItem(config.USER_STORAGE_KEY);
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Products API - COMPLETE WITH SEARCH ENDPOINTS
export const productsAPI = {
  // Basic CRUD operations
  getAllProducts: () => api.get('/products/all'),
  getProductById: (id) => api.get(`/products/product/${id}/product`),
  addProduct: (productData) => api.post('/products/add', productData),
  updateProduct: (id, productData) => api.put(`/products/product/${id}/update`, productData),
  deleteProduct: (id) => api.delete(`/products/product/${id}/delete`),
  
  // Search and filter operations - ACTIVELY USED
  getProductsByCategory: (category) => api.get(`/products/category/${encodeURIComponent(category)}/products`),
  searchProductsByName: (name) => api.get(`/products/name/products?name=${encodeURIComponent(name)}`),
  getProductsByBrand: (brand) => api.get(`/products/product/by/brand?brand=${encodeURIComponent(brand)}`),
  getProductsByCategoryAndBrand: (category, brand) => api.get(`/products/by/category-and-brand?category=${encodeURIComponent(category)}&brand=${encodeURIComponent(brand)}`),
  getProductsByBrandAndName: (brand, name) => api.get(`/products/by/brand-and-name?brand=${encodeURIComponent(brand)}&name=${encodeURIComponent(name)}`),
  getProductCount: (brand, name) => api.get(`/products/product/count/by-brand-and-name?brand=${encodeURIComponent(brand)}&name=${encodeURIComponent(name)}`),
  
  // Pagination endpoints - ACTIVELY USED by productService.js
  getProductsPaginated: (params) => api.get('/products/paginated', { params }),
  searchProductsPaginated: (params) => api.get('/products/search/paginated', { params }),
  getCategoryProductsPaginated: (params) => api.get('/products/category/paginated', { params }),
  searchByCategoryAndName: (params) => api.get('/products/search/by-category-and-name', { params }),
  
  // Direct search endpoints - ACTIVELY USED by Products.js
  searchProducts: (searchTerm) => api.get(`/products/search/${encodeURIComponent(searchTerm)}`),
  getCategoryProducts: (category) => api.get(`/products/category/${encodeURIComponent(category)}/products`),
  searchProductsByCategoryAndName: (category, productName) => api.get(`/products/search/by-category-and-name?category=${encodeURIComponent(category)}&productName=${encodeURIComponent(productName)}`),
  
  // Legacy aliases for backward compatibility
  getProduct: (id) => api.get(`/products/product/${id}/product`),
  getProductsPaginatedLegacy: (params) => api.get('/products/all', { params }),
};

// Categories API - ACTIVE METHODS ONLY with Frontend Cache
export const categoriesAPI = {
  getAllCategories: async () => {
    // Import cache dynamically to avoid circular dependency
    const { default: frontendCache } = await import('../utils/cache');
    
    // Check cache first
    const cached = frontendCache.get(frontendCache.constructor.KEYS.CATEGORIES);
    if (cached) {
      return { data: cached };
    }
    
    // Cache miss - fetch from API
    const response = await api.get('/categories/all');
    
    // Cache for 30 minutes (categories rarely change)
    frontendCache.set(frontendCache.constructor.KEYS.CATEGORIES, response.data, 30);
    
    return response;
  },
  
  getCategoryById: (id) => api.get(`/categories/category/${id}/category`),
  addCategory: async (categoryData) => {
    const response = await api.post('/categories/add', categoryData);
    // Clear categories cache when new category is added
    const { default: frontendCache } = await import('../utils/cache');
    frontendCache.delete(frontendCache.constructor.KEYS.CATEGORIES);
    return response;
  },
  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/categories/category/${id}/update`, categoryData);
    // Clear categories cache when category is updated
    const { default: frontendCache } = await import('../utils/cache');
    frontendCache.delete(frontendCache.constructor.KEYS.CATEGORIES);
    return response;
  },
  deleteCategory: async (id) => {
    const response = await api.delete(`/categories/category/${id}/delete`);
    // Clear categories cache when category is deleted
    const { default: frontendCache } = await import('../utils/cache');
    frontendCache.delete(frontendCache.constructor.KEYS.CATEGORIES);
    return response;
  },
  
  // Legacy alias
  getCategory: (id) => api.get(`/categories/category/${id}/category`),
};

// Images API - ACTIVE METHODS ONLY
export const imagesAPI = {
  // Currently used upload methods
  uploadImages: (productId, files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return api.post(`/images/upload?productId=${productId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadOptimizedImages: (productId, files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return api.post(`/images/upload-optimized?productId=${productId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Image operations
  getImage: (imageId) => api.get(`/images/image/${imageId}`, { responseType: 'blob' }),
  deleteImage: (imageId) => api.delete(`/images/image/${imageId}/delete`),
  
  // Utility method for frontend image URL generation - FIXED: Use full API URL
  getImageUrl: (imageId) => `${config.API_BASE_URL}/images/image/${imageId}`,
};

// Auth API - COMPLETE
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/users/add/user', userData),
  logout: () => {
    localStorage.removeItem(config.TOKEN_STORAGE_KEY);
    localStorage.removeItem(config.USER_STORAGE_KEY);
  },
  getCurrentUser: () => {
    const token = localStorage.getItem(config.TOKEN_STORAGE_KEY);
    if (token) {
      try {
        const decoded = jwtDecode(token);
        return decoded;
      } catch (error) {
        logger.error('Error decoding token:', error);
        return null;
      }
    }
    return null;
  },
};

// Cart API - SIMPLIFIED
export const cartAPI = {
  getUserCart: () => api.get('/carts/user/my-cart'),
  clearCart: (cartId) => api.delete(`/carts/${cartId}/clear`),
  
  // Legacy methods - still used in hooks
  addToCart: (cartData) => api.post('/carts/items/add', cartData),
  updateCartItem: (cartId, itemId, quantity) => 
    api.put(`/cartItems/cart/${cartId}/item/${itemId}/update?quantity=${quantity}`),
  removeFromCart: (cartId, itemId) => api.delete(`/cartItems/cart/${cartId}/item/${itemId}/remove`),
};

// Orders API - ACTIVE METHODS ONLY
export const ordersAPI = {
  // Order operations
  placeOrder: (userId, couponCode = null) => {
    const params = new URLSearchParams({ userId: userId.toString() });
    if (couponCode) {
      params.append('couponCode', couponCode);
    }
    return api.post(`/orders/order?${params.toString()}`);
  },
  
  // Order retrieval
  getOrderById: (orderId) => api.get(`/orders/${orderId}/order`),
  getUserOrders: (userId) => api.get(`/orders/${userId}/orders`),
  getAllOrders: () => api.get('/orders/admin/all'),
  
  // Order management
  cancelOrder: (orderId) => api.put(`/orders/${orderId}/cancel`),
  
  // Admin operations
  updateOrderStatus: (orderId, status) => api.put(`/orders/admin/${orderId}/status?status=${status}`),
  approveOrder: (orderId) => api.put(`/orders/admin/${orderId}/approve`),
  rejectOrder: (orderId) => api.put(`/orders/admin/${orderId}/reject`),
  
  // Legacy alias
  getOrder: (orderId) => api.get(`/orders/${orderId}/order`),
};

// Favorites API - ACTIVE METHODS ONLY with Frontend Cache
export const favoritesAPI = {
  // Currently used methods with cache
  getUserFavorites: async (userId) => {
    const { default: frontendCache } = await import('../utils/cache');
    
    // Check cache first
    const cacheKey = frontendCache.constructor.KEYS.USER_FAVORITES(userId);
    const cached = frontendCache.get(cacheKey);
    if (cached) {
      return { data: cached };
    }
    
    // Cache miss - fetch from API
    const response = await api.get(`/favorites/user/${userId}`);
    
    // Cache for 5 minutes (favorites change more frequently)
    frontendCache.set(cacheKey, response.data, 5);
    
    return response;
  },
  
  addToFavorites: async (userId, productId) => {
    const response = await api.post(`/favorites/add?userId=${userId}&productId=${productId}`);
    // Clear favorites cache when new favorite is added
    const { default: frontendCache } = await import('../utils/cache');
    frontendCache.delete(frontendCache.constructor.KEYS.USER_FAVORITES(userId));
    return response;
  },
  
  removeFromFavorites: async (userId, productId) => {
    const response = await api.delete(`/favorites/remove?userId=${userId}&productId=${productId}`);
    // Clear favorites cache when favorite is removed
    const { default: frontendCache } = await import('../utils/cache');
    frontendCache.delete(frontendCache.constructor.KEYS.USER_FAVORITES(userId));
    return response;
  },
  
  // Convenience method for current user
  getCurrentUserFavorites: async () => {
    const user = JSON.parse(localStorage.getItem(config.USER_STORAGE_KEY) || '{}');
    if (user.id) {
      return favoritesAPI.getUserFavorites(user.id);
    }
    return Promise.resolve({ data: { data: [] } });
  },
  
  // Legacy alias
  getFavorites: (userId) => favoritesAPI.getUserFavorites(userId),
};

// Sales API - ACTIVELY USED
export const salesAPI = {
  // Get sale products - USED in Sale.js, SaleManagement.js
  getProductsOnSale: () => api.get('/sales/products'),
  getFlashSaleProducts: () => api.get('/sales/flash-sale'),
  getProductsOnSaleByCategory: (category) => api.get(`/sales/category/${encodeURIComponent(category)}`),
  
  // Sale management - USED in SaleManagement.js
  setProductOnSale: (productId, saleData) => api.put(`/sales/product/${productId}/sale`, saleData),
  removeProductFromSale: (productId) => api.delete(`/sales/product/${productId}/sale`),
};

// Coupons API - ACTIVELY USED
export const couponsAPI = {
  // Get operations - USED in Sale.js, CouponManagement.js, AdminDashboard.js
  getAllCoupons: () => api.get('/coupons/all'),
  getActiveCoupons: () => api.get('/coupons/active'),
  getCouponsByType: (type) => api.get(`/coupons/type/${type}`),
  getCouponByCode: (code) => api.get(`/coupons/${code}`),
  
  // Validation and application - USED in couponService.js
  validateCoupon: (couponData) => api.post('/coupons/validate', couponData),
  applyCoupon: (code, amount) => api.post(`/coupons/apply?code=${code}&amount=${amount}`),
  
  // Management operations - USED in CouponManagement.js
  createCoupon: (couponData) => api.post('/coupons', couponData),
  updateCoupon: (id, couponData) => api.put(`/coupons/${id}`, couponData),
  deleteCoupon: (id) => api.delete(`/coupons/${id}`),
  
  // Legacy aliases
  getCoupons: () => api.get('/coupons/all'),
};

// Data initialization API
export const dataAPI = {
  initializeData: () => api.post('/data/initialize'),
};

// Export default api instance for direct usage
export default api;
