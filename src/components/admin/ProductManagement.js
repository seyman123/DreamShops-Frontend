import React, { useState, useEffect, useRef } from 'react';
import { FaBox, FaEdit, FaEye, FaTrash, FaImage, FaBolt, FaPlus, FaTimes, FaSync } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { productsAPI, categoriesAPI } from '../../services/api';
import Pagination from '../Pagination';
import { config, getProductImageUrl } from '../../utils/config';

const ProductManagement = ({ onStatsUpdate }) => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [productForm, setProductForm] = useState({
        name: '',
        brand: '',
        price: '',
        inventory: '',
        description: '',
        categoryId: ''
    });
    const [filters, setFilters] = useState({
        category: '',
        brand: '',
        search: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(8);
    const [totalPages, setTotalPages] = useState(1);

    // Prevent duplicate API calls
    const isLoadingRef = useRef(false);
    const hasLoadedRef = useRef(false);

    useEffect(() => {
        // Only load data once on mount, prevent duplicate calls
        if (!hasLoadedRef.current && !isLoadingRef.current) {
            loadData();
        }
    }, []);

    const loadData = async () => {
        // Prevent duplicate API calls
        if (isLoadingRef.current) {
            console.log('🚫 ProductManagement: Data loading already in progress, skipping...');
            return;
        }

        isLoadingRef.current = true;
        setLoading(true);
        
        try {
            console.log('📦 ProductManagement: Loading products and categories...');
            
            // Show loading immediately
            setProducts([]);
            setCategories([]);
            
            // Use paginated endpoint instead of /all to avoid cache issues
            const [productResponse, categoryResponse] = await Promise.all([
                productsAPI.getProductsPaginated({ page: 0, size: 100 }), // Get first 100 products
                categoriesAPI.getAllCategories()
            ]);

            // Handle paginated response structure
            const productsData = productResponse.data?.data?.products || 
                                productResponse.data?.products || 
                                productResponse.data?.data || 
                                [];
            
            const categoriesData = categoryResponse.data?.data || categoryResponse.data || [];
            
            // Process data in chunks to avoid blocking UI
            console.log('🔄 Processing data in chunks to avoid UI blocking...');
            
            // Set categories first (smaller dataset)
            setCategories(categoriesData);
            
            // Process products in batches using setTimeout to yield to browser
            const batchSize = 10;
            const processBatch = (startIndex) => {
                return new Promise((resolve) => {
                    setTimeout(() => {
                        const endIndex = Math.min(startIndex + batchSize, productsData.length);
                        const batch = productsData.slice(0, endIndex);
                        
                        setProducts(batch);
                        
                        if (endIndex < productsData.length) {
                            processBatch(endIndex).then(resolve);
                        } else {
                            resolve();
                        }
                    }, 0); // Yield to browser
                });
            };

            // Start batch processing
            await processBatch(0);

            // Update stats in parent component with specific data
            if (onStatsUpdate) {
                onStatsUpdate({
                    totalProducts: productsData.length,
                    totalCategories: categoriesData.length
                });
            }

            console.log(`✅ ProductManagement: Loaded ${productsData.length} products and ${categoriesData.length} categories`);
            hasLoadedRef.current = true;
        } catch (error) {
            console.error('❌ ProductManagement: Error loading data:', error);
            
            // Fallback: Try categories only if products fail
            try {
                const categoryResponse = await categoriesAPI.getAllCategories();
                const categoriesData = categoryResponse.data?.data || categoryResponse.data || [];
                setCategories(categoriesData);
                
                // Show warning but don't crash
                toast.warn('Ürünler yüklenemedi, ancak kategoriler yüklendi. Cache sorunu olabilir.');
            } catch (catError) {
                console.error('❌ ProductManagement: Categories also failed:', catError);
                toast.error('Veri yüklenirken hata oluştu');
            }
        } finally {
            setLoading(false);
            isLoadingRef.current = false;
        }
    };

    // Clear backend cache function
    const clearCache = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('Admin yetkisi gerekli');
                return;
            }

            const response = await fetch(`${config.API_BASE_URL}/products/admin/clear-cache`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                toast.success('🧹 Cache başarıyla temizlendi!');
                // Reload data after cache clear
                setTimeout(() => loadData(), 1000);
            } else {
                throw new Error(`HTTP ${response.status}`);
            }
        } catch (error) {
            console.error('Cache clear error:', error);
            toast.error('Cache temizlenirken hata oluştu');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            // Seçilen kategoriyi bul
            const selectedCategory = categories.find(cat => cat.id === parseInt(productForm.categoryId));
            
            const productData = {
                name: productForm.name,
                brand: productForm.brand,
                price: parseFloat(productForm.price),
                inventory: parseInt(productForm.inventory),
                description: productForm.description,
                category: { 
                    id: parseInt(productForm.categoryId),
                    name: selectedCategory ? selectedCategory.name : ''
                }
            };

            console.log('Sending product data:', productData);

            if (editingProduct) {
                // Ürün güncelleme
                const response = await productsAPI.updateProduct(editingProduct.id, productData);
                toast.success('Ürün başarıyla güncellendi!');
            } else {
                // Yeni ürün ekleme
                const response = await productsAPI.addProduct(productData);
                toast.success('Ürün başarıyla eklendi!');
            }
            
            resetForm();
            loadData();
        } catch (error) {
            console.error('Error saving product:', error);
            if (error.response?.status === 403) {
                toast.error('Bu işlemi yapmaya yetkiniz yok');
            } else if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error(editingProduct ? 'Ürün güncellenirken hata oluştu' : 'Ürün eklenirken hata oluştu');
            }
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setProductForm({
            name: '',
            brand: '',
            price: '',
            inventory: '',
            description: '',
            categoryId: ''
        });
        setEditingProduct(null);
        setShowModal(false);
    };

    const handleEditProduct = (product) => {
        setProductForm({
            name: product.name,
            brand: product.brand,
            price: product.price.toString(),
            inventory: product.inventory.toString(),
            description: product.description,
            categoryId: product.category?.id?.toString() || ''
        });
        setEditingProduct(product);
        setShowModal(true);
    };

    const handleViewProduct = (product) => {
        // Ürün detaylarını göster
        const productInfo = `
Ürün: ${product.name}
Marka: ${product.brand}
Fiyat: ₺${product.price}
Stok: ${product.inventory}
Kategori: ${product.category?.name || 'Kategorisiz'}
${product.isOnSale ? `İndirimli Fiyat: ₺${product.effectivePrice}` : ''}
        `;
        alert(productInfo.trim());
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
            try {
                await productsAPI.deleteProduct(productId);
                toast.success('Ürün silindi');
                loadData();
            } catch (error) {
                console.error('Error deleting product:', error);
                if (error.response?.status === 403) {
                    toast.error('Bu işlemi yapmaya yetkiniz yok');
                } else if (error.response?.data?.message) {
                    toast.error(error.response.data.message);
                } else {
                    toast.error('Ürün silinirken hata oluştu');
                }
            }
        }
    };

    const filteredProducts = Array.isArray(products) ? products.filter(product => {
        const matchesCategory = !filters.category || product.category?.name === filters.category;
        const matchesBrand = !filters.brand || product.brand.toLowerCase().includes(filters.brand.toLowerCase());
        const matchesSearch = !filters.search || 
            product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
            product.description.toLowerCase().includes(filters.search.toLowerCase());
        
        return matchesCategory && matchesBrand && matchesSearch;
    }) : [];

    // Pagination logic
    const totalItems = filteredProducts.length;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    // Update total pages when filtered products change - OPTIMIZED
    useEffect(() => {
        const newTotalPages = Math.ceil(totalItems / itemsPerPage);
        if (totalPages !== newTotalPages) {
            setTotalPages(newTotalPages);
        }
        if (currentPage > newTotalPages && newTotalPages > 0) {
            setCurrentPage(1);
        }
    }, [totalItems, itemsPerPage]); // Remove currentPage and filteredProducts.length from dependencies

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getStockStatus = (inventory) => {
        if (inventory === 0) return { 
            bgColor: 'bg-red-500', 
            textColor: 'text-red-100', 
            text: 'Tükendi' 
        };
        if (inventory <= 5) return { 
            bgColor: 'bg-yellow-500', 
            textColor: 'text-yellow-100', 
            text: 'Az Stok' 
        };
        if (inventory <= 20) return { 
            bgColor: 'bg-blue-500', 
            textColor: 'text-blue-100', 
            text: 'Normal' 
        };
        return { 
            bgColor: 'bg-green-500', 
            textColor: 'text-green-100', 
            text: 'Bol' 
        };
    };

    const getSaleStatus = (product) => {
        if (product.isOnSale) {
            if (product.isFlashSale) {
                return (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-500 text-yellow-100">
                        <FaBolt className="mr-1" />
                        Flash Sale
                    </span>
                );
            }
            return (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500 text-green-100">
                    İndirimde
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-500 text-gray-100">
                Normal
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 border-t-4 border-primary-500 rounded-full animate-spin"></div>
                    <span className="text-white text-lg">Yükleniyor...</span>
                </div>
                <div className="text-gray-400 text-sm">
                    {products.length === 0 ? 'Veriler getiriliyor...' : `${products.length} ürün işleniyor...`}
                </div>
                {/* Progress bar for batch processing */}
                {products.length > 0 && (
                    <div className="w-64 bg-gray-700 rounded-full h-2 mt-4">
                        <div 
                            className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min((products.length / 100) * 100, 100)}%` }}
                        ></div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="admin-panel">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white flex items-center">
                        <FaBox className="mr-3 text-primary-500" />
                        Ürün Yönetimi ({totalItems})
                    </h2>
                    <p className="text-gray-400 mt-2">Tüm ürünlerinizi buradan yönetebilirsiniz</p>
                </div>
                <div className="flex space-x-3">
                    <button
                        onClick={clearCache}
                        className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-4 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                        title="Cache Temizle"
                    >
                        <FaSync className="inline mr-2" />
                        Cache Temizle
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                    >
                        <FaPlus className="inline mr-2" />
                        Yeni Ürün Ekle
                    </button>
                </div>
            </div>

            {/* Filtreler */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                    <label className="block text-white font-medium mb-2">Kategori</label>
                    <select
                        value={filters.category}
                        onChange={(e) => setFilters({...filters, category: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl glass border border-white border-opacity-20 text-white bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="" className="bg-gray-800 text-white">Tüm Kategoriler</option>
                        {categories.map(category => (
                            <option key={category.id} value={category.name} className="bg-gray-800 text-white">
                                {category.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-white font-medium mb-2">Marka</label>
                    <input
                        type="text"
                        placeholder="Marka ara..."
                        value={filters.brand}
                        onChange={(e) => setFilters({...filters, brand: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl glass border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
                <div>
                    <label className="block text-white font-medium mb-2">Ürün Ara</label>
                    <input
                        type="text"
                        placeholder="Ürün adı veya açıklama..."
                        value={filters.search}
                        onChange={(e) => setFilters({...filters, search: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl glass border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
            </div>

            {/* Sayfa Bilgisi */}
            {totalItems > 0 && (
                <div className="mb-4 text-gray-300 text-sm">
                    {startIndex + 1}-{Math.min(endIndex, totalItems)} arası gösteriliyor (Toplam: {totalItems} ürün)
                </div>
            )}

            {/* Ürünler Grid */}
            {filteredProducts.length === 0 ? (
                <div className="glass p-12 rounded-2xl border border-white border-opacity-20 text-center">
                    <FaBox className="text-6xl text-gray-400 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-white mb-4">Henüz Ürün Yok</h3>
                    <p className="text-gray-300 mb-8">İlk ürünü eklemek için butona tıklayın.</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                    >
                        <FaPlus className="inline mr-2" />
                        İlk Ürünü Ekle
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {paginatedProducts.map((product) => (
                        <div key={product.id} className="glass rounded-xl border border-white border-opacity-20 overflow-hidden hover:border-opacity-40 transition-all duration-300 hover:-translate-y-1">
                            {/* Ürün Resmi */}
                            <div className="relative h-32 bg-gradient-to-br from-gray-700 to-gray-800">
                                {product.images && product.images.length > 0 ? (
                                    <img
                                        src={getProductImageUrl(product)}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = '/images/placeholder.svg';
                                        }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <FaImage className="text-2xl text-gray-500" />
                                    </div>
                                )}
                                
                                {/* Sale Badge */}
                                <div className="absolute top-1 left-1">
                                    {getSaleStatus(product)}
                                </div>
                            </div>

                            {/* Ürün Bilgileri */}
                            <div className="p-3">
                                <h3 className="font-medium text-white text-sm truncate mb-1" title={product.name}>
                                    {product.name}
                                </h3>
                                
                                <p className="text-gray-400 text-xs mb-1">{product.brand}</p>
                                <p className="text-gray-300 text-xs mb-2 line-clamp-1" title={product.description}>{product.description}</p>
                                
                                <div className="flex justify-between items-center mb-2">
                                    <div className="text-lg font-bold text-white">₺{product.price}</div>
                                    <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStockStatus(product.inventory).bgColor} ${getStockStatus(product.inventory).textColor}`}>
                                        {product.inventory}
                                    </div>
                                </div>
                                
                                <div className="text-gray-400 text-xs mb-2">{product.category?.name || 'Kategorisiz'}</div>
                                
                                {/* İşlem Butonları */}
                                <div className="flex space-x-1">
                                    <button
                                        onClick={() => handleViewProduct(product)}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1 px-1 rounded-md transition-colors text-xs"
                                        title="Görüntüle"
                                    >
                                        <FaEye className="inline" size={10} />
                                    </button>
                                    <button
                                        onClick={() => handleEditProduct(product)}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1 px-1 rounded-md transition-colors text-xs"
                                        title="Düzenle"
                                    >
                                        <FaEdit className="inline" size={10} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteProduct(product.id)}
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1 px-1 rounded-md transition-colors text-xs"
                                        title="Sil"
                                    >
                                        <FaTrash className="inline" size={10} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage - 1} // Pagination component 0-based, bizim state 1-based
                    totalPages={totalPages}
                    totalElements={totalItems}
                    size={itemsPerPage}
                    onPageChange={(page) => handlePageChange(page + 1)} // 0-based'den 1-based'e çevir
                    isLoading={loading}
                />
            )}

            {/* Ürün Ekleme/Düzenleme Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div className="glass rounded-2xl border border-white border-opacity-20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-white border-opacity-20 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-white">
                                {editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
                            </h2>
                            <button
                                onClick={resetForm}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <FaTimes size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Ürün Adı *
                                    </label>
                                    <input
                                        type="text"
                                        value={productForm.name}
                                        onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                                        className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Örn: iPhone 15 Pro"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Marka *
                                    </label>
                                    <input
                                        type="text"
                                        value={productForm.brand}
                                        onChange={(e) => setProductForm({...productForm, brand: e.target.value})}
                                        className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Örn: Apple"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Fiyat (₺) *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={productForm.price}
                                        onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                                        className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="0.00"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Stok Miktarı *
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={productForm.inventory}
                                        onChange={(e) => setProductForm({...productForm, inventory: e.target.value})}
                                        className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="0"
                                        required
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Kategori *
                                    </label>
                                    <select
                                        value={productForm.categoryId}
                                        onChange={(e) => setProductForm({...productForm, categoryId: e.target.value})}
                                        className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="" className="bg-gray-800 text-white">Kategori Seçin</option>
                                        {categories.map(category => (
                                            <option key={category.id} value={category.id} className="bg-gray-800 text-white">
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Açıklama
                                </label>
                                <textarea
                                    value={productForm.description}
                                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                                    className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ürün açıklaması..."
                                    rows="4"
                                />
                            </div>

                            {/* Modal Footer */}
                            <div className="flex justify-end space-x-4 pt-6 border-t border-white border-opacity-20">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                                >
                                    {loading ? 'Kaydediliyor...' : editingProduct ? 'Güncelle' : 'Ekle'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductManagement; 