import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaFire, FaCalendarAlt, FaTags, FaBox } from 'react-icons/fa';
import api from '../../../services/api';
import { toast } from 'react-toastify';

const SaleManagement = ({ onStatsUpdate }) => {
  const [products, setProducts] = useState([]);
  const [productsOnSale, setProductsOnSale] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [saleForm, setSaleForm] = useState({
    discountType: 'PERCENTAGE',
    discountValue: '',
    startDate: '',
    endDate: '',
    isFlashSale: false,
    flashSaleStock: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Tüm ürünleri yükle
      const productsResponse = await api.get('/products/all');
      setProducts(productsResponse.data.data || []);
      
      // İndirimli ürünleri yükle
      const salesResponse = await api.get('/sales/products');
      setProductsOnSale(salesResponse.data.data || []);
      
      // İstatistikleri güncelle
      if (onStatsUpdate) {
        onStatsUpdate({
          totalProducts: productsResponse.data.data?.length || 0,
          productsOnSale: salesResponse.data.data?.length || 0
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedProduct) {
      toast.error('Lütfen bir ürün seçin');
      return;
    }
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Tarih formatlarını ayarla
      const startDate = new Date(saleForm.startDate).toISOString();
      const endDate = new Date(saleForm.endDate).toISOString();
      
      const saleData = {
        discountPercentage: saleForm.discountType === 'PERCENTAGE' ? parseInt(saleForm.discountValue) : null,
        discountPrice: saleForm.discountType === 'FIXED_AMOUNT' ? parseFloat(saleForm.discountValue) : null,
        saleStartDate: startDate,
        saleEndDate: endDate,
        isFlashSale: saleForm.isFlashSale,
        flashSaleStock: saleForm.isFlashSale && saleForm.flashSaleStock ? parseInt(saleForm.flashSaleStock) : null
      };

      await api.put(`/sales/product/${selectedProduct.id}/sale`, saleData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      toast.success('Ürün indirimi başarıyla oluşturuldu!');
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving sale:', error);
      if (error.response?.status === 403) {
        toast.error('Bu işlemi yapmaya yetkiniz yok');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('İndirim oluşturulurken hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromSale = async (productId) => {
    if (window.confirm('Bu ürünü indirimden çıkarmak istediğinizden emin misiniz?')) {
      try {
        const token = localStorage.getItem('token');
        await api.delete(`/sales/product/${productId}/sale`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        toast.success('Ürün indirimden çıkarıldı');
        loadData();
      } catch (error) {
        console.error('Error removing from sale:', error);
        if (error.response?.status === 403) {
          toast.error('Bu işlemi yapmaya yetkiniz yok');
        } else {
          toast.error('İndirim kaldırılırken hata oluştu');
        }
      }
    }
  };

  const resetForm = () => {
    setSaleForm({
      discountType: 'PERCENTAGE',
      discountValue: '',
      startDate: '',
      endDate: '',
      isFlashSale: false,
      flashSaleStock: ''
    });
    setSelectedProduct(null);
    setShowModal(false);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const availableProducts = products.filter(product => 
    !productsOnSale.some(saleProduct => saleProduct.id === product.id)
  );

  return (
    <div className="space-y-6 admin-panel">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-white">🔥 İndirim Yönetimi</h3>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
        >
          <FaPlus className="inline mr-2" />
          Ürüne İndirim Uygula
        </button>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-2xl border border-white border-opacity-20">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-orange-500 rounded-xl">
              <FaTags className="text-white text-xl" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">İndirimli Ürünler</p>
              <p className="text-white text-2xl font-bold">{productsOnSale.length}</p>
            </div>
          </div>
        </div>
        
        <div className="glass p-6 rounded-2xl border border-white border-opacity-20">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500 rounded-xl">
              <FaBox className="text-white text-xl" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Toplam Ürün</p>
              <p className="text-white text-2xl font-bold">{products.length}</p>
            </div>
          </div>
        </div>
        
        <div className="glass p-6 rounded-2xl border border-white border-opacity-20">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-500 rounded-xl">
              <FaFire className="text-white text-xl" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Flash Sale</p>
              <p className="text-white text-2xl font-bold">
                {productsOnSale.filter(p => p.isFlashSale).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* İndirimli Ürünler Listesi */}
      {loading ? (
        <div className="glass p-8 rounded-2xl border border-white border-opacity-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">İndirimler yükleniyor...</p>
        </div>
      ) : productsOnSale.length === 0 ? (
        <div className="glass p-12 rounded-2xl border border-white border-opacity-20 text-center">
          <FaFire className="text-6xl text-gray-400 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-white mb-4">Henüz İndirimli Ürün Yok</h3>
          <p className="text-gray-300 mb-8">
            İlk indiriminizi oluşturmak için butona tıklayın.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
          >
            <FaPlus className="inline mr-2" />
            İlk İndirimi Oluştur
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {productsOnSale.map((product) => (
            <div key={product.id} className="glass p-6 rounded-2xl border border-white border-opacity-20 hover:border-opacity-40 transition-all duration-300">
              {/* Ürün Başlığı */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-xl text-white ${product.isFlashSale ? 'bg-yellow-500' : 'bg-orange-500'}`}>
                    {product.isFlashSale ? <FaFire /> : <FaTags />}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{product.name}</h4>
                    <p className="text-gray-400 text-xs">{product.brand}</p>
                    {product.isFlashSale && (
                      <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-yellow-500 text-black mt-1">
                        Flash Sale
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Fiyat Bilgileri */}
              <div className="bg-white bg-opacity-5 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400 text-sm">Orijinal Fiyat:</span>
                  <span className="text-gray-400 line-through">{formatPrice(product.price)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-semibold">İndirimli Fiyat:</span>
                  <span className="text-green-400 font-bold text-lg">{formatPrice(product.effectivePrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-orange-400 text-sm">Tasarruf:</span>
                  <span className="text-orange-400 font-semibold">{formatPrice(product.savings)}</span>
                </div>
              </div>

              {/* İndirim Detayları */}
              {product.saleStartDate && product.saleEndDate && (
                <div className="flex items-center text-gray-300 text-sm mb-4">
                  <FaCalendarAlt className="mr-2" />
                  <span>{formatDate(product.saleStartDate)} - {formatDate(product.saleEndDate)}</span>
                </div>
              )}

              {/* İşlemler */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleRemoveFromSale(product.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg transition-colors text-sm font-medium"
                  title="İndirimden Çıkar"
                >
                  <FaTrash className="inline mr-1" />
                  Çıkar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* İndirim Oluşturma Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl border border-white border-opacity-20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-white border-opacity-20 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Ürüne İndirim Uygula</h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Ürün Seçimi */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Ürün Seç *
                </label>
                <select
                  value={selectedProduct?.id || ''}
                  onChange={(e) => {
                    const product = availableProducts.find(p => p.id === parseInt(e.target.value));
                    setSelectedProduct(product);
                  }}
                  className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="" className="bg-gray-800 text-white">Ürün Seçin</option>
                  {availableProducts.map(product => (
                    <option key={product.id} value={product.id} className="bg-gray-800 text-white">
                      {product.name} - {product.brand} ({formatPrice(product.price)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* İndirim Türü */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    İndirim Türü *
                  </label>
                  <select
                    value={saleForm.discountType}
                    onChange={(e) => setSaleForm({...saleForm, discountType: e.target.value, discountValue: ''})}
                    className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="PERCENTAGE" className="bg-gray-800 text-white">Yüzde (%)</option>
                    <option value="FIXED_AMOUNT" className="bg-gray-800 text-white">Sabit Tutar (₺)</option>
                  </select>
                </div>

                {/* İndirim Değeri */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    İndirim Değeri *
                  </label>
                  <input
                    type="number"
                    step={saleForm.discountType === 'PERCENTAGE' ? '1' : '0.01'}
                    min="0"
                    max={saleForm.discountType === 'PERCENTAGE' ? '100' : undefined}
                    value={saleForm.discountValue}
                    onChange={(e) => setSaleForm({...saleForm, discountValue: e.target.value})}
                    className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder={saleForm.discountType === 'PERCENTAGE' ? 'Örn: 25' : 'Örn: 100.00'}
                    required
                  />
                </div>

                {/* Başlangıç Tarihi */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Başlangıç Tarihi *
                  </label>
                  <input
                    type="datetime-local"
                    value={saleForm.startDate}
                    onChange={(e) => setSaleForm({...saleForm, startDate: e.target.value})}
                    className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>

                {/* Bitiş Tarihi */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bitiş Tarihi *
                  </label>
                  <input
                    type="datetime-local"
                    value={saleForm.endDate}
                    onChange={(e) => setSaleForm({...saleForm, endDate: e.target.value})}
                    className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
              </div>

              {/* Flash Sale */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isFlashSale"
                  checked={saleForm.isFlashSale}
                  onChange={(e) => setSaleForm({...saleForm, isFlashSale: e.target.checked})}
                  className="w-5 h-5 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500"
                />
                <label htmlFor="isFlashSale" className="text-gray-300">
                  Flash Sale olarak işaretle
                </label>
              </div>

              {/* Flash Sale Stock */}
              {saleForm.isFlashSale && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Flash Sale Stok Limiti
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={saleForm.flashSaleStock}
                    onChange={(e) => setSaleForm({...saleForm, flashSaleStock: e.target.value})}
                    className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Maksimum satış adedi"
                  />
                </div>
              )}

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
                  disabled={loading || !selectedProduct}
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  {loading ? 'Uygulanıyor...' : 'İndirimi Uygula'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
  };
  
export default SaleManagement; 