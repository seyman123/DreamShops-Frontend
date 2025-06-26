import { useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export const useProductSearch = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState(() => {
    const searchFromUrl = searchParams.get('search');
    return searchFromUrl ? decodeURIComponent(searchFromUrl) : '';
  });
  
  const [selectedCategory, setSelectedCategory] = useState(() => {
    const categoryFromUrl = searchParams.get('category');
    return categoryFromUrl ? decodeURIComponent(categoryFromUrl) : '';
  });
  
  const [sortBy, setSortBy] = useState('name');
  
  // Debounced search
  const [searchTimeout, setSearchTimeout] = useState(null);

  const handleSearchInputChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    
    if (searchTerm.trim()) {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.set('search', searchTerm.trim());
      if (selectedCategory) params.set('category', selectedCategory);
      
      navigate(`/products?${params.toString()}`);
    }
  }, [searchTerm, selectedCategory, navigate]);

  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
    
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (searchTerm.trim()) params.set('search', searchTerm.trim());
    
    navigate(`/products?${params.toString()}`);
  }, [searchTerm, navigate]);

  const handleSortChange = useCallback((newSortBy) => {
    setSortBy(newSortBy);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('');
    setSortBy('name');
    navigate('/products');
  }, [navigate]);

  return {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    searchTimeout,
    setSearchTimeout,
    handleSearchInputChange,
    handleSearch,
    handleCategoryChange,
    handleSortChange,
    clearFilters
  };
}; 