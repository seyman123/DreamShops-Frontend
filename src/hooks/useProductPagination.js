import { useState, useCallback } from 'react';

export const useProductPagination = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(12); // Fixed page size
  const [allProducts, setAllProducts] = useState([]);

  // Client-side pagination function
  const paginateProducts = useCallback((productsArray, page, size) => {
    const startIndex = page * size;
    const endIndex = startIndex + size;
    return productsArray.slice(startIndex, endIndex);
  }, []);

  // Page change handler
  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
    // Return paginated products for the new page
    return paginateProducts(allProducts, newPage, pageSize);
  }, [allProducts, pageSize, paginateProducts]);

  // Update pagination data when products change
  const updatePaginationData = useCallback((productsArray, resetPage = false) => {
    setAllProducts(productsArray);
    setTotalElements(productsArray.length);
    setTotalPages(Math.ceil(productsArray.length / pageSize));
    
    if (resetPage) {
      setCurrentPage(0);
    }
    
    // Return current page products
    const pageToUse = resetPage ? 0 : currentPage;
    return paginateProducts(productsArray, pageToUse, pageSize);
  }, [pageSize, currentPage, paginateProducts]);

  // Reset pagination
  const resetPagination = useCallback(() => {
    setCurrentPage(0);
    setTotalPages(0);
    setTotalElements(0);
    setAllProducts([]);
  }, []);

  return {
    currentPage,
    setCurrentPage,
    totalPages,
    setTotalPages,
    totalElements,
    setTotalElements,
    pageSize,
    allProducts,
    setAllProducts,
    paginateProducts,
    handlePageChange,
    updatePaginationData,
    resetPagination
  };
}; 