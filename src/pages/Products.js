﻿import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';
import logger from '../utils/logger';
import Pagination from '../components/Pagination';
import ProductFilters from '../components/products/ProductFilters';
import ProductGrid from '../components/products/ProductGrid';
import { useProductSearch } from '../hooks/useProductSearch';
import { useProductPagination } from '../hooks/useProductPagination';
import { useProductActions } from '../hooks/useProductActions';
import imagePreloader from '../utils/imagePreloader';

const Products = () => {
  // Custom hooks
  const {
    searchTerm,
    debouncedSearchTerm,
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
    setCurrentPage,
    setTotalPages,
    setTotalElements,
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

  // Fetch data functions - OPTIMIZED
  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories/all');
      const categoriesData = response.data.data || response.data || [];
      setCategories(categoriesData);
    } catch (error) {
      logger.error('Error fetching categories', error);
      setCategories([]); // Fallback to empty array
    }
  };

  const fetchProducts = async (pageNum = 0) => {
    try {
      setLoading(true);
      setError(null);

      // Server-side pagination parametreleri
      const params = {
        page: pageNum,
        size: 12,
        sort: getSortParam(sortBy)
      };

      let endpoint = '/products/paginated';
      
      if (debouncedSearchTerm && selectedCategory) {
        endpoint = '/products/search/paginated';
        params.search = debouncedSearchTerm;
        params.category = selectedCategory;
      } else if (debouncedSearchTerm) {
        endpoint = '/products/search/paginated';
        params.search = debouncedSearchTerm;
      } else if (selectedCategory) {
        endpoint = '/products/category/paginated';
        params.category = selectedCategory;
      }

      const response = await api.get(endpoint, { params });
      const responseData = response.data.data;


      // Server-side pagination response yapısını kontrol et
      if (responseData && typeof responseData === 'object' && responseData.products) {
        // Paginated response
        const products = responseData.products || [];
        setProducts(products);
        setCurrentPage(responseData.currentPage || 0);
        setTotalPages(responseData.totalPages || 0);
        setTotalElements(responseData.totalElements || 0);
        
        
        
        // Preload product images for better UX
        if (products.length > 0) {
          imagePreloader.preloadProductImages(products, getImageUrl).catch(console.error);
        }
      } else {
        // Fallback: Non-paginated response - client-side pagination uygula
        const allProducts = responseData || [];
        const sortedProducts = sortProducts(allProducts, sortBy);
        const currentPageProducts = updatePaginationData(sortedProducts, true);
        setProducts(currentPageProducts);
        
        // Preload images for fallback case too
        if (currentPageProducts.length > 0) {
          imagePreloader.preloadProductImages(currentPageProducts, getImageUrl).catch(console.error);
        }
      }

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

  // Handle page change with server-side pagination
  const onPageChange = (newPage) => {
    fetchProducts(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle sort change with server-side pagination
  const onSortChange = (newSortBy) => {
    handleSortChange(newSortBy);
    
    // Sıralama değiştiğinde ilk sayfadan başla
    const timer = setTimeout(() => {
      fetchProducts(0);
    }, 100);
    
    if (searchTimeout) clearTimeout(searchTimeout);
    setSearchTimeout(timer);
  };

  // Sort parametresi helper function
  const getSortParam = (sortOption) => {
    switch (sortOption) {
      case 'price-asc':
        return 'price,asc';
      case 'price-desc':
        return 'price,desc';
      case 'brand':
        return 'brand,asc';
      case 'brand-desc':
        return 'brand,desc';
      case 'name-desc':
        return 'name,desc';
      case 'name':
      default:
        return 'name,asc';
    }
  };

  // Effects - OPTIMIZED to prevent multiple requests
  useEffect(() => {
    // Load categories and favorites once on component mount
    const loadInitialData = async () => {
      try {
        // Fetch in parallel to reduce request time
        await Promise.all([
          fetchCategories(),
          fetchUserFavorites()
        ]);
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };
    
    loadInitialData();
  }, []); // Remove fetchUserFavorites dependency to prevent re-runs

  useEffect(() => {
    // Use debouncedSearchTerm instead of searchTerm to prevent excessive API calls
    fetchProducts(0); // Her arama/filtre değişikliğinde ilk sayfadan başla
  }, [debouncedSearchTerm, selectedCategory, sortBy]);

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
            totalElements={totalElements}
            size={pageSize}
            onPageChange={onPageChange}
            isLoading={loading}
          />
        </div>
      )}
    </div>
  );
};

export default Products;
