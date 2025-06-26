import React from 'react';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';

const ProductFilters = ({
  categories,
  searchTerm,
  selectedCategory,
  sortBy,
  showFilters,
  setShowFilters,
  onSearchInputChange,
  onSearch,
  onCategoryChange,
  onSortChange,
  onClearFilters
}) => {
  return (
    <div className="dark:bg-gradient-dark light:bg-gradient-light bg-gradient-light relative z-10">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/5 left-1/5 w-96 h-96 bg-primary-500 rounded-full opacity-15 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/5 right-1/5 w-96 h-96 bg-secondary-500 rounded-full opacity-15 blur-3xl animate-pulse animation-delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl lg:text-5xl font-black gradient-text mb-4">
            Ürünlerimiz
          </h1>
          <p className="text-gray-300 text-lg">
            Premium kalitede teknoloji ürünleri
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="glass p-6 rounded-2xl border border-white border-opacity-20 mb-8">
          {/* Desktop Search Bar */}
          <div className="hidden lg:flex items-center justify-between gap-6">
            {/* Search */}
            <form onSubmit={onSearch} className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ürün ara..."
                  value={searchTerm}
                  onChange={onSearchInputChange}
                  className="w-full pl-4 pr-12 py-3 rounded-xl glass border border-white border-opacity-20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-primary-400 transition-colors duration-200"
                >
                  <FaSearch />
                </button>
              </div>
            </form>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="px-4 py-3 rounded-xl glass border border-white border-opacity-20 text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-48"
            >
              <option value="" className="bg-gray-800">Tüm Kategoriler</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name} className="bg-gray-800">
                  {category.name}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="px-4 py-3 rounded-xl glass border border-white border-opacity-20 text-white bg-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 min-w-48"
            >
              <option value="name" className="bg-gray-800">İsme Göre (A-Z)</option>
              <option value="price-asc" className="bg-gray-800">Fiyat (Düşük → Yüksek)</option>
              <option value="price-desc" className="bg-gray-800">Fiyat (Yüksek → Düşük)</option>
              <option value="brand" className="bg-gray-800">Markaya Göre (A-Z)</option>
              <option value="discount" className="bg-gray-800">En Çok İndirimli</option>
              <option value="flash-sale" className="bg-gray-800">Flash Sale Ürünleri</option>
            </select>

            {/* Clear Filters */}
            {(searchTerm || selectedCategory || sortBy !== 'name') && (
              <button
                onClick={onClearFilters}
                className="px-4 py-3 rounded-xl bg-red-500 bg-opacity-20 border border-red-500 border-opacity-50 text-red-400 hover:bg-opacity-30 transition-all duration-300"
              >
                <FaTimes className="mr-2" />
                Temizle
              </button>
            )}
          </div>

          {/* Mobile Filter Toggle */}
          <div className="lg:hidden">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl glass border border-white border-opacity-20 text-white hover:bg-primary-500 hover:bg-opacity-20 transition-all duration-300"
            >
              <FaFilter />
              Filtrele
            </button>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="mt-4 space-y-4">
                {/* Search */}
                <form onSubmit={onSearch}>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Ürün ara..."
                      value={searchTerm}
                      onChange={onSearchInputChange}
                      className="w-full pl-4 pr-12 py-3 rounded-xl glass border border-white border-opacity-20 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <button
                      type="submit"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-primary-400 transition-colors duration-200"
                    >
                      <FaSearch />
                    </button>
                  </div>
                </form>

                {/* Category */}
                <select
                  value={selectedCategory}
                  onChange={(e) => onCategoryChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass border border-white border-opacity-20 text-white bg-transparent"
                >
                  <option value="" className="bg-gray-800">Tüm Kategoriler</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name} className="bg-gray-800">
                      {category.name}
                    </option>
                  ))}
                </select>

                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => onSortChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl glass border border-white border-opacity-20 text-white bg-transparent"
                >
                  <option value="name" className="bg-gray-800">İsme Göre (A-Z)</option>
                  <option value="price-asc" className="bg-gray-800">Fiyat (Düşük → Yüksek)</option>
                  <option value="price-desc" className="bg-gray-800">Fiyat (Yüksek → Düşük)</option>
                  <option value="brand" className="bg-gray-800">Markaya Göre (A-Z)</option>
                  <option value="discount" className="bg-gray-800">En Çok İndirimli</option>
                  <option value="flash-sale" className="bg-gray-800">Flash Sale Ürünleri</option>
                </select>

                {/* Clear Filters */}
                {(searchTerm || selectedCategory || sortBy !== 'name') && (
                  <button
                    onClick={onClearFilters}
                    className="w-full px-4 py-3 rounded-xl bg-red-500 bg-opacity-20 border border-red-500 border-opacity-50 text-red-400 hover:bg-opacity-30 transition-all duration-300"
                  >
                    <FaTimes className="mr-2" />
                    Filtreleri Temizle
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductFilters; 