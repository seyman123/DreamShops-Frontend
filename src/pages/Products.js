import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import logger from '../utils/logger';
import Pagination from '../components/Pagination';
import ProductFilters from '../components/products/ProductFilters';
import ProductGrid from '../components/products/ProductGrid';
import { useProductSearch } from '../hooks/useProductSearch';
import { useProductPagination } from '../hooks/useProductPagination';
import { useProductActions } from '../hooks/useProductActions';

const Products = () => {
  // Custom hooks
  const {
    searchTerm,
    selectedCategory,
    sortBy,
    searchTimeout,
    setSearchTimeout,
    handleSearchInputChange,
    handleSearch,
    handleCategoryChange,
    handleSortChange,
    clearFilters
  } = useProductSearch();

  const {
    currentPage,
    totalPages,
    totalElements,
    pageSize,
    handlePageChange,
    updatePaginationData,
    resetPagination
  } = useProductPagination();

  const {
    addingToCart,
    favorites,
    formatPrice,
    addToCart,
    toggleFavorite,
    fetchUserFavorites,
    getImageUrl
  } = useProductActions();

  // Local state
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch data functions
  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories/all');
      setCategories(response.data.data || []);
    } catch (error) {
      logger.error('Error fetching categories', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      let endpoint = '/products/all';
      
      if (searchTerm && selectedCategory) {
        endpoint = `/products/search/by-category-and-name?category=${encodeURIComponent(selectedCategory)}&productName=${encodeURIComponent(searchTerm)}`;
      } else if (searchTerm) {
        endpoint = `/products/search/${encodeURIComponent(searchTerm)}`;
      } else if (selectedCategory) {
        endpoint = `/products/category/${encodeURIComponent(selectedCategory)}/products`;
      }

      const response = await api.get(endpoint);
      let allProducts = response.data.data || [];

      // Apply sorting
      allProducts = sortProducts(allProducts, sortBy);

      // Update pagination and get current page products
      const currentPageProducts = updatePaginationData(allProducts, true);
      setProducts(currentPageProducts);

    } catch (error) {
      logger.error('Error fetching products', error);
      setError('Ürünler yüklenirken bir hata oluştu');
      setProducts([]);
      resetPagination();
    } finally {
      setLoading(false);
    }
  };

  // Sort products function
  const sortProducts = (productsArray, sortOption) => {
    console.log(`Sorting ${productsArray.length} products by:`, sortOption);
    const sorted = [...productsArray];
    
    switch (sortOption) {
      case 'price-asc':
        return sorted.sort((a, b) => {
          const priceA = a.effectivePrice !== undefined ? a.effectivePrice : a.price;
          const priceB = b.effectivePrice !== undefined ? b.effectivePrice : b.price;
          return (priceA || 0) - (priceB || 0);
        });
      case 'price-desc':
        return sorted.sort((a, b) => {
          const priceA = a.effectivePrice !== undefined ? a.effectivePrice : a.price;
          const priceB = b.effectivePrice !== undefined ? b.effectivePrice : b.price;
          return (priceB || 0) - (priceA || 0);
        });
      case 'brand':
        return sorted.sort((a, b) => {
          const brandA = (a.brand || '').toLowerCase();
          const brandB = (b.brand || '').toLowerCase();
          return brandA.localeCompare(brandB, 'tr', { sensitivity: 'base' });
        });
      case 'discount':
        return sorted.sort((a, b) => {
          // İndirimli ürünleri önce getir, sonra indirim oranına göre sırala
          const discountA = a.discountPercentage || 0;
          const discountB = b.discountPercentage || 0;
          
          if (discountA > 0 && discountB === 0) return -1;
          if (discountA === 0 && discountB > 0) return 1;
          
          return discountB - discountA;
        });
      case 'flash-sale':
        return sorted.sort((a, b) => {
          // Flash sale ürünleri önce getir
          if (a.isFlashSale && !b.isFlashSale) return -1;
          if (!a.isFlashSale && b.isFlashSale) return 1;
          
          // İkisi de flash sale ise indirim oranına göre sırala
          if (a.isFlashSale && b.isFlashSale) {
            return (b.discountPercentage || 0) - (a.discountPercentage || 0);
          }
          
          return 0;
        });
      case 'name':
      default:
        return sorted.sort((a, b) => {
          const nameA = (a.name || '').toLowerCase();
          const nameB = (b.name || '').toLowerCase();
          return nameA.localeCompare(nameB, 'tr', { 
            sensitivity: 'base',
            numeric: true,
            ignorePunctuation: true
          });
        });
    }
  };

  // Handle page change with current products
  const onPageChange = (newPage) => {
    const newProducts = handlePageChange(newPage);
    setProducts(newProducts);
  };

  // Handle sort change
  const onSortChange = (newSortBy) => {
    console.log('Sort changed to:', newSortBy);
    handleSortChange(newSortBy);
    
    // Sıralama değiştiğinde products'ı yeniden fetch et
    const timer = setTimeout(() => {
      fetchProducts();
    }, 100);
    
    if (searchTimeout) clearTimeout(searchTimeout);
    setSearchTimeout(timer);
  };

  // Effects
  useEffect(() => {
    fetchCategories();
    fetchUserFavorites();
  }, [fetchUserFavorites]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300); // Debounce search

    if (searchTimeout) clearTimeout(searchTimeout);
    setSearchTimeout(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [searchTerm, selectedCategory, sortBy]);

  // Render
  return (
    <div className="min-h-screen dark:bg-gradient-dark light:bg-gradient-light bg-gradient-light">
      {/* Filters */}
      <ProductFilters
        categories={categories}
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        sortBy={sortBy}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        onSearchInputChange={handleSearchInputChange}
        onSearch={handleSearch}
        onCategoryChange={handleCategoryChange}
        onSortChange={onSortChange}
        onClearFilters={clearFilters}
      />

      {/* Results Info */}
      {!loading && !error && (
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center text-gray-300 mb-6">
            <span>
              {totalElements} ürün bulundu
              {searchTerm && ` - "${searchTerm}" için sonuçlar`}
              {selectedCategory && ` - ${selectedCategory} kategorisinde`}
            </span>
          </div>
        </div>
      )}

      {/* Product Grid */}
      <ProductGrid
        products={products}
        loading={loading}
        error={error}
        addingToCart={addingToCart}
        favorites={favorites}
        formatPrice={formatPrice}
        getImageUrl={getImageUrl}
        onAddToCart={addToCart}
        onToggleFavorite={toggleFavorite}
      />

      {/* Pagination */}
      {!loading && !error && products.length > 0 && totalPages > 1 && (
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default Products;
