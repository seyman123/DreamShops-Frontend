// Centralized configuration for API and environment settings
export const config = {
  // API Configuration
  API_BASE_URL: process.env.REACT_APP_API_URL || 'https://e-commerceproject-7f8i.onrender.com/api/v1',
  
  // Environment
  ENVIRONMENT: process.env.NODE_ENV || 'production',
  
  // Timeouts
  API_TIMEOUT: 30000,
  
  // Image Configuration
  DEFAULT_PLACEHOLDER: '/images/placeholder.svg',
  
  // Pagination defaults
  DEFAULT_PAGE_SIZE: 12,
  
  // Authentication
  TOKEN_STORAGE_KEY: 'token',
  USER_STORAGE_KEY: 'user',
};

// Helper functions
export const getImageUrl = (imageId) => {
  if (!imageId) return config.DEFAULT_PLACEHOLDER;
  return `${config.API_BASE_URL}/images/image/${imageId}`;
};

export const getProductImageUrl = (product) => {
  if (!product || !product.images || product.images.length === 0) {
    return config.DEFAULT_PLACEHOLDER;
  }

  const image = product.images[0];

  // Use downloadUrl if available
  if (image.downloadUrl) {
    return `${config.API_BASE_URL}${image.downloadUrl}`;
  }

  return getImageUrl(image.id);
};

//export const getProductImageUrl = (product) => {
//  if (!product || !product.images || product.images.length === 0) {
//    return config.DEFAULT_PLACEHOLDER;
//  }
//  
// // Use the downloadUrl from the product if available
//  if (product.images[0].downloadUrl) {
//    return `${config.API_BASE_URL}${product.images[0].downloadUrl}`;
//  }
//  
//  // Fallback to image ID
//  return getImageUrl(product.images[0].id);
//};

export const isProduction = () => config.ENVIRONMENT === 'production';
export const isDevelopment = () => config.ENVIRONMENT === 'development';

export default config; 