import React, { useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaShoppingCart, FaHeart, FaRegHeart } from 'react-icons/fa';
import SmartImage from '../SmartImage';

const ProductCard = React.memo(({ 
  product, 
  isAddingToCart, 
  isFavorite, 
  formatPrice, 
  getImageUrl, 
  onAddToCart, 
  onToggleFavorite 
}) => {
  // Memoize expensive calculations
  const priceInfo = useMemo(() => {
    if (product.currentlyOnSale) {
      return {
        currentPrice: formatPrice(product.effectivePrice),
        originalPrice: formatPrice(product.price),
        savings: formatPrice(product.savings),
        isOnSale: true
      };
    }
    return {
      currentPrice: formatPrice(product.price),
      isOnSale: false
    };
  }, [product.currentlyOnSale, product.effectivePrice, product.price, product.savings, formatPrice]);

  const stockInfo = useMemo(() => ({
    inStock: product.inventory > 0,
    stockText: product.inventory > 0 ? `Stokta (${product.inventory})` : 'Stok Yok'
  }), [product.inventory]);

  // Memoize callbacks to prevent unnecessary re-renders
  const handleAddToCart = useCallback(() => {
    onAddToCart(product.id);
  }, [product.id, onAddToCart]);

  const handleToggleFavorite = useCallback(() => {
    onToggleFavorite(product.id);
  }, [product.id, onToggleFavorite]);

  const imageUrl = useMemo(() => getImageUrl(product), [getImageUrl, product]);

  return (
    <div className="glass p-6 rounded-2xl border border-white border-opacity-20 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary-500/20 group relative overflow-hidden">
      {/* Sale Badge */}
      {product.currentlyOnSale && (
        <div className="absolute top-4 left-4 z-20">
          <span className="bg-gradient-secondary px-3 py-1 rounded-full text-xs font-bold text-white animate-pulse">
            %{product.discountPercentage || 'İNDİRİM'}
          </span>
        </div>
      )}

      {/* Flash Sale Badge */}
      {product.isFlashSale && (
        <div className="absolute top-4 right-4 z-20">
          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 px-3 py-1 rounded-full text-xs font-bold text-white animate-bounce">
            ⚡ FLASH
          </span>
        </div>
      )}

      {/* Favorite Button */}
      <button
        onClick={handleToggleFavorite}
        className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full glass border border-white border-opacity-20 text-white hover:bg-red-500 hover:bg-opacity-30 transition-all duration-300 hover:scale-110"
        style={product.isFlashSale ? { top: '50px' } : {}}
        aria-label={isFavorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
      >
        {isFavorite ? (
          <FaHeart className="text-red-400" />
        ) : (
          <FaRegHeart />
        )}
      </button>

      {/* Product Image */}
      <div className="relative mb-4 overflow-hidden rounded-xl">
        <SmartImage
          src={imageUrl}
          alt={product.name}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
          fallbackSrc="/images/placeholder.svg"
          loading="lazy"
        />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 left-4 right-4 flex gap-2">
            <Link
              to={`/products/${product.id}`}
              className="flex-1 bg-primary-500 bg-opacity-90 text-white py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-opacity-100 flex items-center justify-center gap-2"
            >
              <FaEye />
              İncele
            </Link>
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart || !stockInfo.inStock}
              className="flex-1 bg-secondary-500 bg-opacity-90 text-white py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-opacity-100 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Sepete ekle"
            >
              {isAddingToCart ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <FaShoppingCart />
                  Sepet
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="space-y-3">
        {/* Brand */}
        <div className="text-primary-400 text-sm font-medium">
          {product.brand}
        </div>

        {/* Name */}
        <h3 className="text-white font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary-400 transition-colors duration-300">
          {product.name}
        </h3>

        {/* Category */}
        <div className="text-gray-400 text-sm">
          {product.category?.name}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            {priceInfo.isOnSale ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-green-400">
                    {priceInfo.currentPrice}
                  </span>
                  <span className="text-sm text-red-400 line-through">
                    {priceInfo.originalPrice}
                  </span>
                </div>
                <span className="text-xs text-green-400">
                  {priceInfo.savings} tasarruf
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold text-white">
                {priceInfo.currentPrice}
              </span>
            )}
          </div>

          {/* Stock Status */}
          <div className="text-right">
            <span className={`text-sm ${stockInfo.inStock ? 'text-green-400' : 'text-red-400'}`}>
              {stockInfo.stockText}
            </span>
          </div>
        </div>

        {/* Action Buttons - Mobile */}
        <div className="flex gap-2 lg:hidden">
          <Link
            to={`/products/${product.id}`}
            className="flex-1 bg-primary-500 bg-opacity-20 border border-primary-500 border-opacity-50 text-primary-400 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-opacity-30 text-center"
          >
            İncele
          </Link>
          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart || !stockInfo.inStock}
            className="flex-1 bg-secondary-500 bg-opacity-20 border border-secondary-500 border-opacity-50 text-secondary-400 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-opacity-30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAddingToCart ? (
              <div className="w-4 h-4 border-2 border-secondary-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            ) : (
              'Sepete Ekle'
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard; 