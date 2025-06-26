import React from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaShoppingCart, FaHeart, FaRegHeart } from 'react-icons/fa';
import SmartImage from '../SmartImage';

const ProductGrid = ({
  products,
  loading,
  error,
  addingToCart,
  favorites,
  formatPrice,
  getImageUrl,
  onAddToCart,
  onToggleFavorite
}) => {
  if (loading) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {/* Loading Skeletons */}
          {[...Array(12)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="glass p-6 rounded-2xl border border-white border-opacity-20">
                <div className="w-full h-48 bg-gray-700 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-700 rounded mb-4 w-3/4"></div>
                <div className="h-6 bg-gray-700 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="text-center">
          <div className="glass p-8 rounded-2xl border border-red-500 border-opacity-50">
            <p className="text-red-400 text-lg">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="text-center">
          <div className="glass p-8 rounded-2xl border border-white border-opacity-20">
            <p className="text-gray-300 text-lg">Ürün bulunamadı</p>
            <p className="text-gray-400 mt-2">Farklı kriterlerle arama yapmayı deneyin</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {products.map((product) => (
          <div 
            key={product.id} 
            className="glass p-6 rounded-2xl border border-white border-opacity-20 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary-500/20 group relative overflow-hidden"
          >
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
              onClick={() => onToggleFavorite(product.id)}
              className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full glass border border-white border-opacity-20 text-white hover:bg-red-500 hover:bg-opacity-30 transition-all duration-300 hover:scale-110"
              style={product.isFlashSale ? { top: '50px' } : {}}
            >
              {favorites.has(product.id) ? (
                <FaHeart className="text-red-400" />
              ) : (
                <FaRegHeart />
              )}
            </button>

            {/* Product Image */}
            <div className="relative mb-4 overflow-hidden rounded-xl">
              <SmartImage
                src={getImageUrl(product)}
                alt={product.name}
                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                fallbackSrc="/images/placeholder.svg"
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
                    onClick={() => onAddToCart(product.id)}
                    disabled={addingToCart[product.id]}
                    className="flex-1 bg-secondary-500 bg-opacity-90 text-white py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-opacity-100 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addingToCart[product.id] ? (
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
                  {product.currentlyOnSale ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-green-400">
                          {formatPrice(product.effectivePrice)}
                        </span>
                        <span className="text-sm text-red-400 line-through">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                      <span className="text-xs text-green-400">
                        {formatPrice(product.savings)} tasarruf
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold text-white">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>

                {/* Stock Status */}
                <div className="text-right">
                  {product.inventory > 0 ? (
                    <span className="text-green-400 text-sm">
                      Stokta ({product.inventory})
                    </span>
                  ) : (
                    <span className="text-red-400 text-sm">
                      Stok Yok
                    </span>
                  )}
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
                  onClick={() => onAddToCart(product.id)}
                  disabled={addingToCart[product.id] || product.inventory === 0}
                  className="flex-1 bg-secondary-500 bg-opacity-20 border border-secondary-500 border-opacity-50 text-secondary-400 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-opacity-30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingToCart[product.id] ? (
                    <div className="w-4 h-4 border-2 border-secondary-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  ) : (
                    'Sepete Ekle'
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductGrid; 