import React, { useState, useEffect } from 'react';
import { FaUpload, FaTrash, FaEye, FaImage, FaEdit } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { imagesAPI, productsAPI } from '../../../services/api';
import Pagination from '../../../components/Pagination';

const ImageManagement = ({ onStatsUpdate }) => {
  const [images, setImages] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadImages();
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productsAPI.getAllProducts();
      const productData = response.data?.data || response.data || [];
      setProducts(productData);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadImages = async () => {
    setLoading(true);
    try {
      // Tüm ürünlerden resimleri topla
      const response = await productsAPI.getAllProducts();
      const productData = response.data?.data || response.data || [];
      
      const allImages = [];
      productData.forEach(product => {
        if (product.images && product.images.length > 0) {
          product.images.forEach(image => {
            allImages.push({
              ...image,
              productName: product.name,
              productId: product.id,
              isUsed: true
            });
          });
        }
      });
      
      setImages(allImages);
      
      if (onStatsUpdate) {
        onStatsUpdate({ images: allImages.length });
      }
    } catch (error) {
      console.error('Error loading images:', error);
      toast.error('Resimler yüklenirken hata oluştu.');
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    
    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      toast.error('Sadece resim dosyaları (JPEG, PNG, GIF, WebP) yükleyebilirsiniz.');
      return;
    }

    // Validate file sizes (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      toast.error('Dosya boyutu 10MB\'dan büyük olamaz.');
      return;
    }

    setSelectedFiles(files);
  };

  const handleUpload = async (useOptimization = true) => {
    if (selectedFiles.length === 0) {
      toast.error('Lütfen yüklenecek dosyaları seçin.');
      return;
    }

    if (!selectedProductId) {
      toast.error('Lütfen resim yüklenecek ürünü seçin.');
      return;
    }

    setUploading(true);
    try {
      if (useOptimization) {
        await imagesAPI.uploadOptimizedImages(selectedProductId, selectedFiles);
        toast.success(`🚀 ${selectedFiles.length} resim optimize edilerek yüklendi! (Otomatik sıkıştırma aktif)`);
      } else {
        await imagesAPI.uploadImages(selectedProductId, selectedFiles);
        toast.success(`${selectedFiles.length} resim başarıyla yüklendi!`);
      }
      
      // Clear selected files
      setSelectedFiles([]);
      setSelectedProductId('');
      
      // Refresh images list
      loadImages();
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error(error.response?.data?.message || 'Resimler yüklenirken hata oluştu.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId) => {
    if (!window.confirm('Bu resmi silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      await imagesAPI.deleteImage(imageId);
      setImages(prev => prev.filter(img => img.id !== imageId));
      toast.success('Resim başarıyla silindi!');
      
      if (onStatsUpdate) {
        onStatsUpdate({ images: images.length - 1 });
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error(error.response?.data?.message || 'Resim silinirken hata oluştu.');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Sayfa değiştiğinde yukarı kaydır
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 admin-panel">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-white">🖼️ Resim Yönetimi</h3>
        <div className="text-gray-300">
          Toplam {images.length} resim
        </div>
      </div>

      {/* Upload Section */}
      <div className="glass p-6 rounded-2xl border border-white border-opacity-20">
        <h4 className="text-lg font-semibold text-white mb-4">Resim Yükle</h4>
        
        <div className="space-y-4">
          {/* Product Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ürün Seçin *
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="" className="bg-gray-800 text-white">Ürün seçiniz...</option>
              {products.map(product => (
                <option key={product.id} value={product.id} className="bg-gray-800 text-white">
                  {product.name} ({product.images?.length || 0} resim)
                </option>
              ))}
            </select>
          </div>

          {/* File Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Resim Dosyalarını Seçin
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-4 py-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
            <p className="text-gray-400 text-sm mt-2">
              Desteklenen formatlar: JPEG, PNG, GIF, WebP • Maksimum dosya boyutu: 10MB
            </p>
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div>
              <h5 className="text-sm font-medium text-gray-300 mb-2">Seçilen Dosyalar:</h5>
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex justify-between items-center bg-white bg-opacity-5 rounded-lg p-3">
                    <div>
                      <p className="text-white font-medium">{file.name}</p>
                      <p className="text-gray-400 text-sm">{formatFileSize(file.size)}</p>
                    </div>
                    <button
                      onClick={() => setSelectedFiles(files => files.filter((_, i) => i !== index))}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Buttons */}
          {selectedFiles.length > 0 && (
            <div className="space-y-3">
              {/* Optimization Info */}
              <div className="bg-blue-500 bg-opacity-20 border border-blue-500 border-opacity-30 rounded-lg p-4">
                <h5 className="text-blue-300 font-semibold mb-2">🚀 Optimize Edilmiş Yükleme (Önerilen)</h5>
                <p className="text-blue-200 text-sm">
                  Resimler otomatik olarak sıkıştırılır ve yeniden boyutlandırılır. %60-80 daha hızlı yükleme!
                </p>
              </div>
              
              {/* Upload Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => handleUpload(true)}
                  disabled={uploading || !selectedProductId}
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:transform-none"
                >
                  {uploading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Optimize Ediliyor...
                    </div>
                  ) : (
                    <>
                      <FaUpload className="inline mr-2" />
                      🚀 Optimize Et & Yükle
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => handleUpload(false)}
                  disabled={uploading || !selectedProductId}
                  className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:transform-none"
                >
                  {uploading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Normal Yükleniyor...
                    </div>
                  ) : (
                    <>
                      <FaUpload className="inline mr-2" />
                      Normal Yükle
                    </>
                  )}
                </button>
              </div>
              
              <p className="text-gray-400 text-xs text-center">
                {selectedFiles.length} dosya yüklenecek
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Images Grid */}
      {loading ? (
        <div className="glass p-8 rounded-2xl border border-white border-opacity-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Resimler yükleniyor...</p>
        </div>
      ) : images.length === 0 ? (
        <div className="glass p-12 rounded-2xl border border-white border-opacity-20 text-center">
          <FaImage className="text-6xl text-gray-400 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-white mb-4">Henüz Resim Yok</h3>
          <p className="text-gray-300 mb-8">
            Ürünlere resim eklemek için yukarıdaki formu kullanabilirsiniz.
          </p>
        </div>
      ) : (
        <>
          {/* Sayfa Bilgisi */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-300 text-sm">
              {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, images.length)} arası gösteriliyor (Toplam: {images.length} resim)
            </p>
            <span className="text-gray-400 text-sm">Sayfa {currentPage}/{Math.ceil(images.length / itemsPerPage)}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {images.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((image) => (
              <div key={image.id} className="glass p-3 rounded-xl border border-white border-opacity-20 hover:border-opacity-40 transition-all duration-300">
                {/* Image Preview */}
                <div className="relative mb-3">
                  <img
                    src={imagesAPI.getImageUrl(image.id)}
                    alt={image.fileName}
                    className="w-full h-32 object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = '/images/placeholder.svg';
                    }}
                  />
                  <div className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-lg p-1">
                    <button
                      onClick={() => window.open(imagesAPI.getImageUrl(image.id), '_blank')}
                      className="text-white hover:text-blue-300 transition-colors"
                      title="Büyük Görsel"
                    >
                      <FaEye size={12} />
                    </button>
                  </div>
                </div>

                {/* Image Info */}
                <div className="space-y-1 mb-3">
                  <h4 className="font-medium text-white text-xs truncate" title={image.fileName}>
                    {image.fileName}
                  </h4>
                  <p className="text-gray-400 text-xs truncate">
                    {image.productName}
                  </p>
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-green-500 text-white">
                    Kullanılıyor
                  </span>
                </div>

                {/* Actions */}
                <div className="flex space-x-1">
                  <button
                    onClick={() => window.open(imagesAPI.getImageUrl(image.id), '_blank')}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded-md transition-colors text-xs"
                  >
                    <FaEye className="inline mr-1" size={10} />
                    Görüntüle
                  </button>
                  <button
                    onClick={() => handleDelete(image.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded-md transition-colors text-xs"
                  >
                    <FaTrash className="inline mr-1" size={10} />
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {Math.ceil(images.length / itemsPerPage) > 1 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage - 1}
                totalPages={Math.ceil(images.length / itemsPerPage)}
                totalElements={images.length}
                size={itemsPerPage}
                onPageChange={(page) => handlePageChange(page + 1)}
                isLoading={loading}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ImageManagement; 