import api from './api';

class ProductService {
  // Get products with pagination
  async getProductsPaginated(params = {}) {
    const {
      page = 0,
      size = 12,
      search = '',
      category = '',
      sort = 'name,asc'
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort
    });

    // Add search and category parameters if provided
    if (search.trim()) {
      queryParams.append('search', search.trim());
    }
    if (category.trim()) {
      queryParams.append('category', category.trim());
    }

    const endpoint = search && category 
      ? `/products/search/by-category-and-name?${queryParams}`
      : search 
        ? `/products/search/paginated?${queryParams}`
        : category
          ? `/products/category/paginated?${queryParams}`
          : `/products/paginated?${queryParams}`;

    return api.get(endpoint);
  }

  // Get all products (fallback for non-paginated endpoints)
  async getAllProducts() {
    return api.get('/products/all');
  }

  // Search products by name
  async searchProducts(searchTerm, pagination = null) {
    if (pagination) {
      return this.getProductsPaginated({
        search: searchTerm,
        ...pagination
      });
    }
    return api.get(`/products/search/${encodeURIComponent(searchTerm)}`);
  }

  // Get products by category
  async getProductsByCategory(categoryName, pagination = null) {
    if (pagination) {
      return this.getProductsPaginated({
        category: categoryName,
        ...pagination
      });
    }
    return api.get(`/products/category/${encodeURIComponent(categoryName)}/products`);
  }

  // Search products by category and name
  async searchProductsByCategoryAndName(categoryName, productName, pagination = null) {
    if (pagination) {
      return this.getProductsPaginated({
        search: productName,
        category: categoryName,
        ...pagination
      });
    }
    
    const params = new URLSearchParams({
      category: categoryName,
      productName: productName
    });
    
    return api.get(`/products/search/by-category-and-name?${params}`);
  }

  // Get single product
  async getProductById(id) {
    return api.get(`/products/product/${id}`);
  }

  // Sort options mapping
  getSortOptions() {
    return {
      'name': 'name,asc',
      'name-desc': 'name,desc',
      'price-asc': 'price,asc',
      'price-desc': 'price,desc',
      'brand': 'brand,asc',
      'brand-desc': 'brand,desc',
      'discount': 'discountPercentage,desc',
      'flash-sale': 'isFlashSale,desc'
    };
  }

  // Helper method to convert frontend sort to backend sort
  convertSortOption(frontendSort) {
    const sortOptions = this.getSortOptions();
    return sortOptions[frontendSort] || 'name,asc';
  }
}

export default new ProductService(); 