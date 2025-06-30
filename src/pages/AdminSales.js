import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaPercent, FaChartBar, FaFire, FaTags, FaCalendarAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../services/api';

const AdminSales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [saleForm, setSaleForm] = useState({
    name: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    startDate: '',
    endDate: '',
    isActive: true,
    minOrderAmount: '',
    applicableCategories: [],
    applicableProducts: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Try to fetch sales from backend
      // Since the sales endpoint might not exist, we'll handle the error gracefully
      const salesResponse = await api.get('/sales/all').catch(() => ({ data: { data: [] } }));
      setSales(salesResponse.data.data || []);
    } catch (error) {
      toast.error('Veriler yüklenirken hata oluştu.');
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      if (editingSale) {
        // Update existing sale
        const response = await api.put(`/sales/${editingSale.id}/update`, saleForm);
        setSales(prev => prev.map(sale => 
          sale.id === editingSale.id 
            ? response.data.data
            : sale
        ));
        toast.success('İndirim başarıyla güncellendi!');
      } else {
        // Create new sale
        const response = await api.post('/sales/add', saleForm);
        setSales(prev => [response.data.data, ...prev]);
        toast.success('İndirim başarıyla oluşturuldu!');
      }
      
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || 'İndirim kaydedilirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (saleId) => {
    if (!window.confirm('Bu indirimi silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      await api.delete(`/sales/${saleId}/delete`);
      setSales(prev => prev.filter(sale => sale.id !== saleId));
      toast.success('İndirim başarıyla silindi!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'İndirim silinirken hata oluştu.');
    }
  };

  const resetForm = () => {
    setSaleForm({
      name: '',
      description: '',
      discountType: 'PERCENTAGE',
      discountValue: '',
      startDate: '',
      endDate: '',
      isActive: true,
      minOrderAmount: '',
      applicableCategories: [],
      applicableProducts: []
    });
    setEditingSale(null);
    setShowModal(false);
  };

  const editSale = (sale) => {
    setSaleForm(sale);
    setEditingSale(sale);
    setShowModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getSaleStats = () => {
    const activeSales = sales.filter(sale => sale.isActive).length;
    const totalUsage = sales.reduce((sum, sale) => sum + (sale.usageCount || 0), 0);
    const totalSavings = sales.reduce((sum, sale) => sum + (sale.totalSavings || 0), 0);
    
    return { activeSales, totalUsage, totalSavings };
  };

  const stats = getSaleStats();

  if (loading && sales.length === 0) {
    return (
              <div className="min-h-screen dark:bg-gradient-dark light:bg-gradient-light bg-gradient-light flex items-center justify-center">
        <div className="glass p-8 rounded-2xl border border-white border-opacity-20 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">İndirimler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dark:bg-gradient-dark light:bg-gradient-light bg-gradient-light pt-8 pb-16">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-4">📊 İndirim Yönetimi</h1>
          <p className="text-gray-300 text-lg">Tüm indirimleri buradan yönetebilirsiniz</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass p-6 rounded-2xl border border-white border-opacity-20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Aktif İndirimler</p>
                <p className="text-3xl font-bold text-white">{stats.activeSales}</p>
              </div>
              <FaFire className="text-4xl text-orange-500" />
            </div>
          </div>
          
          <div className="glass p-6 rounded-2xl border border-white border-opacity-20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Toplam Kullanım</p>
                <p className="text-3xl font-bold text-white">{stats.totalUsage}</p>
              </div>
              <FaChartBar className="text-4xl text-blue-500" />
            </div>
          </div>
          
          <div className="glass p-6 rounded-2xl border border-white border-opacity-20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Toplam Tasarruf</p>
                <p className="text-3xl font-bold text-white">{formatPrice(stats.totalSavings)}</p>
              </div>
              <FaTags className="text-4xl text-green-500" />
            </div>
          </div>
        </div>

        {/* Add Sale Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
          >
            <FaPlus className="inline mr-2" />
            Yeni İndirim Ekle
          </button>
        </div>

        {/* Sales Table */}
        {sales.length === 0 && !loading ? (
          <div className="glass p-12 rounded-2xl border border-white border-opacity-20 text-center">
            <FaTags className="text-6xl text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">Henüz İndirim Yok</h3>
            <p className="text-gray-300 mb-8">İlk indirimi oluşturmak için butona tıklayın.</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
            >
              <FaPlus className="inline mr-2" />
              İlk İndirimi Oluştur
            </button>
          </div>
        ) : (
          <div className="glass rounded-2xl border border-white border-opacity-20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white bg-opacity-10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">İndirim Adı</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Tip</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Değer</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Tarih Aralığı</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Durum</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Kullanım</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white divide-opacity-10">
                  {sales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-white hover:bg-opacity-5 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-white font-semibold">{sale.name}</div>
                          <div className="text-gray-400 text-sm">{sale.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          sale.discountType === 'PERCENTAGE' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-green-500 text-white'
                        }`}>
                          {sale.discountType === 'PERCENTAGE' ? <FaPercent className="mr-1" /> : '₺'}
                          {sale.discountType === 'PERCENTAGE' ? 'Yüzde' : 'Sabit'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white font-bold text-lg">
                          {sale.discountType === 'PERCENTAGE' 
                            ? `%${sale.discountValue}` 
                            : formatPrice(sale.discountValue)
                          }
                        </div>
                        {sale.minOrderAmount > 0 && (
                          <div className="text-gray-400 text-sm">
                            Min. {formatPrice(sale.minOrderAmount)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white text-sm">
                          <div className="flex items-center mb-1">
                            <FaCalendarAlt className="mr-2 text-gray-400" />
                            {formatDate(sale.startDate)}
                          </div>
                          <div className="text-gray-400">
                            → {formatDate(sale.endDate)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          sale.isActive 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-500 text-white'
                        }`}>
                          {sale.isActive ? 'Aktif' : 'Pasif'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-white">
                          <div className="font-semibold">{sale.usageCount || 0} kez</div>
                          <div className="text-gray-400 text-sm">
                            {formatPrice(sale.totalSavings || 0)} tasarruf
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => editSale(sale)}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                            title="Düzenle"
                          >
                            <FaEdit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(sale.id)}
                            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
                            title="Sil"
                          >
                            <FaTrash size={14} />
                          </button>
                          <button
                            className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors"
                            title="Detay"
                          >
                            <FaEye size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Sale Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl border border-white border-opacity-20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-white border-opacity-20">
              <h2 className="text-2xl font-bold text-white">
                {editingSale ? 'İndirim Düzenle' : 'Yeni İndirim Oluştur'}
              </h2>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    İndirim Adı *
                  </label>
                  <input
                    type="text"
                    value={saleForm.name}
                    onChange={(e) => setSaleForm({...saleForm, name: e.target.value})}
                    className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Örn: Black Friday Sale"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    İndirim Tipi *
                  </label>
                  <select
                    value={saleForm.discountType}
                    onChange={(e) => setSaleForm({...saleForm, discountType: e.target.value})}
                    className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PERCENTAGE" className="bg-gray-800 text-white">Yüzde (%)</option>
                    <option value="FIXED_AMOUNT" className="bg-gray-800 text-white">Sabit Tutar (₺)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    İndirim Değeri *
                  </label>
                  <input
                    type="number"
                    value={saleForm.discountValue}
                    onChange={(e) => setSaleForm({...saleForm, discountValue: e.target.value})}
                    className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={saleForm.discountType === 'PERCENTAGE' ? '10' : '100'}
                    min="0"
                    max={saleForm.discountType === 'PERCENTAGE' ? '100' : undefined}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Min. Sipariş Tutarı (₺)
                  </label>
                  <input
                    type="number"
                    value={saleForm.minOrderAmount}
                    onChange={(e) => setSaleForm({...saleForm, minOrderAmount: e.target.value})}
                    className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Başlangıç Tarihi *
                  </label>
                  <input
                    type="date"
                    value={saleForm.startDate}
                    onChange={(e) => setSaleForm({...saleForm, startDate: e.target.value})}
                    className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bitiş Tarihi *
                  </label>
                  <input
                    type="date"
                    value={saleForm.endDate}
                    onChange={(e) => setSaleForm({...saleForm, endDate: e.target.value})}
                    className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Açıklama
                </label>
                <textarea
                  value={saleForm.description}
                  onChange={(e) => setSaleForm({...saleForm, description: e.target.value})}
                  className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="İndirim açıklaması..."
                  rows="3"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={saleForm.isActive}
                  onChange={(e) => setSaleForm({...saleForm, isActive: e.target.checked})}
                  className="mr-3 w-4 h-4 text-blue-600 bg-white bg-opacity-10 border-white border-opacity-20 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-white">
                  İndirim aktif olsun
                </label>
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
                  {loading ? 'Kaydediliyor...' : editingSale ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSales; 