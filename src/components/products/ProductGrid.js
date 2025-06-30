import React, { useMemo, useCallback } from 'react';
import ProductCard from './ProductCard';

const ProductGrid = React.memo(({
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
  // Memoize callbacks to prevent unnecessary re-renders
  const memoizedOnAddToCart = useCallback((productId) => {
    onAddToCart(productId);
  }, [onAddToCart]);

  const memoizedOnToggleFavorite = useCallback((productId) => {
    onToggleFavorite(productId);
  }, [onToggleFavorite]);

  // Memoize product cards to prevent unnecessary re-renders
  const productCards = useMemo(() => {
    console.time('ProductCards Memoization');
    const cards = products.map((product) => (
      <ProductCard
        key={product.id}
        product={product}
        isAddingToCart={addingToCart[product.id] || false}
        isFavorite={favorites.has(product.id)}
        formatPrice={formatPrice}
        getImageUrl={getImageUrl}
        onAddToCart={memoizedOnAddToCart}
        onToggleFavorite={memoizedOnToggleFavorite}
      />
    ));
    console.timeEnd('ProductCards Memoization');
    return cards;
  }, [products, addingToCart, favorites, formatPrice, getImageUrl, memoizedOnAddToCart, memoizedOnToggleFavorite]);

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
        {productCards}
      </div>
    </div>
  );
});

ProductGrid.displayName = 'ProductGrid';

export default ProductGrid; 