// Image Preloader Utility
class ImagePreloader {
  constructor() {
    this.preloadedImages = new Set();
    this.preloadingQueue = new Map();
  }

  // Preload single image
  preloadImage(src) {
    return new Promise((resolve, reject) => {
      if (this.preloadedImages.has(src)) {
        resolve(src);
        return;
      }

      if (this.preloadingQueue.has(src)) {
        // Already preloading, return existing promise
        return this.preloadingQueue.get(src);
      }

      const img = new Image();
      const promise = new Promise((res, rej) => {
        img.onload = () => {
          this.preloadedImages.add(src);
          this.preloadingQueue.delete(src);
          res(src);
        };
        
        img.onerror = () => {
          this.preloadingQueue.delete(src);
          rej(new Error(`Failed to preload image: ${src}`));
        };
      });

      this.preloadingQueue.set(src, promise);
      img.src = src;
      
      return promise;
    });
  }

  // Preload multiple images
  preloadImages(srcArray) {
    return Promise.allSettled(
      srcArray.map(src => this.preloadImage(src))
    );
  }

  // Preload product images specifically
  preloadProductImages(products, getImageUrl) {
    const imageUrls = products
      .map(product => getImageUrl(product))
      .filter(url => url && !this.preloadedImages.has(url));

    if (imageUrls.length === 0) {
      return Promise.resolve([]);
    }

    const startTime = performance.now();
    
    return this.preloadImages(imageUrls).then((results) => {
      const loadTime = performance.now() - startTime;
      const successful = results.filter(r => r.status === 'fulfilled').length;
      return results;
    });
  }

  // Check if image is already preloaded
  isPreloaded(src) {
    return this.preloadedImages.has(src);
  }

  // Clear preloaded cache
  clear() {
    this.preloadedImages.clear();
    this.preloadingQueue.clear();
  }
}

// Single instance
const imagePreloader = new ImagePreloader();

export default imagePreloader; 