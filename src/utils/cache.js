// Frontend Cache Utility
class FrontendCache {
  constructor() {
    this.cache = new Map();
    this.expiry = new Map();
    
    // Auto cleanup expired entries every 5 minutes
    this.startAutoCleanup();
  }

  set(key, value, ttlMinutes = 10) {
    const expiryTime = Date.now() + (ttlMinutes * 60 * 1000);
    this.cache.set(key, value);
    this.expiry.set(key, expiryTime);
  }

  get(key) {
    const expiryTime = this.expiry.get(key);
    
    if (!expiryTime || Date.now() > expiryTime) {
      // Expired or doesn't exist
      this.cache.delete(key);
      this.expiry.delete(key);
      return null;
    }
    
    return this.cache.get(key);
  }

  has(key) {
    return this.get(key) !== null;
  }

  clear() {
    this.cache.clear();
    this.expiry.clear();
  }

  delete(key) {
    this.cache.delete(key);
    this.expiry.delete(key);
  }

  // Auto cleanup expired entries
  startAutoCleanup() {
    setInterval(() => {
      const now = Date.now();
      let cleanedCount = 0;
      
      for (const [key, expiryTime] of this.expiry.entries()) {
        if (now > expiryTime) {
          this.cache.delete(key);
          this.expiry.delete(key);
          cleanedCount++;
        }
      }
      
      if (cleanedCount > 0) {
      }
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  // Get cache stats for debugging
  getStats() {
    const now = Date.now();
    let expired = 0;
    let active = 0;
    
    for (const expiryTime of this.expiry.values()) {
      if (now > expiryTime) {
        expired++;
      } else {
        active++;
      }
    }
    
    return {
      total: this.cache.size,
      active,
      expired,
      memoryUsage: JSON.stringify([...this.cache.values()]).length + ' chars'
    };
  }

  // Specific cache keys for common data
  static KEYS = {
    CATEGORIES: 'categories_all',
    USER_FAVORITES: (userId) => `user_favorites_${userId}`,
    FLASH_SALES: 'flash_sales',
    COUPONS: 'active_coupons'
  };
}

// Single instance
const frontendCache = new FrontendCache();

export default frontendCache; 