import React, { useState, useRef, useEffect } from 'react';
import { FaImage } from 'react-icons/fa';

const SmartImage = React.memo(({ 
  src, 
  alt, 
  className = '', 
  style = {},
  loading = 'lazy',
  aspectRatio = '1/1',
  placeholder = true,
  fallbackSrc = '/images/placeholder.svg',
  onLoad,
  onError
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Intersection Observer for lazy loading - OPTIMIZED
  useEffect(() => {
    if (loading === 'lazy' && imgRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsInView(true);
              observerRef.current?.disconnect();
            }
          });
        },
        {
          rootMargin: '100px', // Increased for better UX
          threshold: 0.01 // Lower threshold for faster loading
        }
      );

      observerRef.current.observe(imgRef.current);

      return () => {
        observerRef.current?.disconnect();
      };
    } else {
      setIsInView(true);
    }
  }, [loading]);

  const handleImageLoad = (e) => {
    setImageLoaded(true);
    onLoad?.(e);
  };

  const handleImageError = (e) => {
    setImageError(true);
    onError?.(e);
  };

  return (
    <div 
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ 
        aspectRatio: aspectRatio,
        ...style 
      }}
    >
      {/* Placeholder */}
      {placeholder && !imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center animate-pulse">
          <FaImage className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
      )}

      {/* Main Image */}
      {isInView && !imageError && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading={loading}
          decoding="async"
        />
      )}

      {/* Error State */}
      {imageError && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <img
            src={fallbackSrc}
            alt={alt}
            className="w-full h-full object-cover opacity-50"
            onError={() => {}}
          />
        </div>
      )}

      {/* Loading indicator */}
      {isInView && !imageLoaded && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
});

export default SmartImage; 