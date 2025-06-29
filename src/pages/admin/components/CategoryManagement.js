import React, { useState, useEffect } from 'react';
import { 
  FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaTags
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { categoriesAPI, productsAPI } from '../../../services/api';
import { config } from '../../../utils/config';

const CategoryManagement = ({ onStatsUpdate }) => {
  // State management
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Category management states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '' });

  useEffect(() => {
    fetchCategories();
    fetchProducts(); // Ürün sayısı göstermek için
  }, []);

  // Data fetching functions
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoriesAPI.getAllCategories();
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Kategoriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAllProducts();
      setProducts(response.data.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Category management functions
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (editingCategory) {
        await categoriesAPI.updateCategory(editingCategory.id, categoryForm);
        toast.success('Kategori başarıyla güncellendi!');
      } else {
        await categoriesAPI.addCategory(categoryForm);
        toast.success('Kategori başarıyla eklendi!');
      }
      
      setShowCategoryModal(false);
      resetCategoryForm();
      fetchCategories();
      onStatsUpdate && onStatsUpdate();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Kategori kaydedilirken hata oluştu: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryDelete = async (categoryId) => {
    if (window.confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
      try {
        await categoriesAPI.deleteCategory(categoryId);
        toast.success('Kategori başarıyla silindi!');
        fetchCategories();
        onStatsUpdate && onStatsUpdate();
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error('Kategori silinirken hata oluştu');
      }
    }
  };

  const openCategoryModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({ name: category.name });
    } else {
      setEditingCategory(null);
      resetCategoryForm();
    }
    setShowCategoryModal(true);
  };

  const resetCategoryForm = () => {
    setCategoryForm({ name: '' });
  };

  if (loading && categories.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-t-4 border-primary-500 rounded-full animate-spin"></div>
          <span className="text-white text-lg">Kategoriler yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <FaTags className="mr-3 text-accent-500" />
          Kategori Yönetimi
        </h2>
        <button
          onClick={() => openCategoryModal()}
          className="flex items-center space-x-2 btn-gradient px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
        >
          <FaPlus />
          <span>Yeni Kategori Ekle</span>
        </button>
      </div>

      {/* Categories Table */}
      <div className="glass rounded-2xl border border-white border-opacity-20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-white bg-opacity-5">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Kategori Adı</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ürün Sayısı</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white divide-opacity-10">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-white hover:bg-opacity-5 transition-all duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-white font-medium">{category.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-white font-semibold">{category.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-500 text-primary-100">
                      {products.filter(p => p.category?.id === category.id).length} ürün
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openCategoryModal(category)}
                        className="inline-flex items-center px-3 py-1.5 border border-blue-500 text-blue-400 text-sm font-medium rounded-lg hover:bg-blue-500 hover:text-white transition-all duration-200"
                      >
                        <FaEdit className="mr-1" />
                        Düzenle
                      </button>
                      <button
                        onClick={() => handleCategoryDelete(category.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-red-500 text-red-400 text-sm font-medium rounded-lg hover:bg-red-500 hover:text-white transition-all duration-200"
                      >
                        <FaTrash className="mr-1" />
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {categories.length === 0 && !loading && (
          <div className="p-12 text-center">
            <FaTags className="text-6xl text-gray-400 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold text-white mb-2">Henüz kategori bulunmuyor</h3>
            <p className="text-gray-400 mb-6">İlk kategoriyi eklemek için yukarıdaki butonu kullanın.</p>
            <button
              onClick={() => openCategoryModal()}
              className="btn-gradient px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
            >
              İlk Kategoriyi Ekle
            </button>
          </div>
        )}
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="glass max-w-md w-full rounded-2xl border border-white border-opacity-20 p-6">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
              </h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCategorySubmit}>
              <div className="mb-6">
                <label className="block text-white font-medium mb-2">Kategori Adı *</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                  placeholder="Kategori adını girin..."
                  className="w-full px-4 py-3 rounded-xl glass border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-6 py-2 border border-gray-500 text-gray-300 rounded-xl hover:bg-gray-500 hover:text-white transition-all duration-200"
                >
                  <FaTimes className="mr-2" />
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 btn-gradient px-6 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                      <span>Kaydediliyor...</span>
                    </>
                  ) : (
                    <>
                      <FaSave />
                      <span>Kaydet</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement; 