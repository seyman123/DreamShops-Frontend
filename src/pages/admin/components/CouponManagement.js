import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaCopy, FaTicketAlt, FaPercent, FaGift } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../../services/api';

const CouponManagement = ({ onStatsUpdate }) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponForm, setCouponForm] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minOrderAmount: '',
    expiryDate: '',
    usageLimit: '',
    isActive: true
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/coupons', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setCoupons(response.data.data || []);
      
      if (onStatsUpdate) {
        const activeCoupons = (response.data.data || []).filter(c => c.isActive).length;
        onStatsUpdate({ coupons: activeCoupons });
      }
    } catch (error) {
      console.error('Error loading coupons:', error);
      toast.error('Kuponlar yüklenirken hata oluştu.');
      setCoupons([]);
      
      if (onStatsUpdate) {
        onStatsUpdate({ coupons: 0 });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Backend Coupon model'ine uygun veri yapısı
      const couponData = {
        code: couponForm.code,
        description: couponForm.description,
        type: 'GENERAL', // Default type
        discountType: couponForm.discountType,
        discountValue: parseFloat(couponForm.discountValue),
        minOrderAmount: couponForm.minOrderAmount ? parseFloat(couponForm.minOrderAmount) : 0,
        maxDiscountAmount: null, // Şimdilik null
        usageLimit: couponForm.usageLimit ? parseInt(couponForm.usageLimit) : null,
        usedCount: 0,
        startDate: new Date().toISOString(), // Şu anda başlasın
        endDate: couponForm.expiryDate ? new Date(couponForm.expiryDate).toISOString() : null,
        isActive: couponForm.isActive
      };
      
      if (editingCoupon) {
        // Update existing coupon
        const response = await api.put(`/coupons/${editingCoupon.id}`, couponData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        toast.success('Kupon başarıyla güncellendi!');
      } else {
        // Create new coupon
        const response = await api.post('/coupons', couponData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        toast.success('Kupon başarıyla oluşturuldu!');
      }
      
      resetForm();
      loadCoupons(); // Refresh list
    } catch (error) {
      console.error('Error saving coupon:', error);
      if (error.response?.status === 403) {
        toast.error('Bu işlemi yapmaya yetkiniz yok');
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(editingCoupon ? 'Kupon güncellenirken hata oluştu' : 'Kupon oluşturulurken hata oluştu');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (couponId) => {
    if (!window.confirm('Bu kuponu silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await api.delete(`/coupons/${couponId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      toast.success('Kupon başarıyla silindi!');
      loadCoupons(); // Refresh list
    } catch (error) {
      console.error('Error deleting coupon:', error);
      if (error.response?.status === 403) {
        toast.error('Bu işlemi yapmaya yetkiniz yok');
      } else {
        toast.error(error.response?.data?.message || 'Kupon silinirken hata oluştu.');
      }
    }
  };

  const generateCouponCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCouponForm({...couponForm, code: result});
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Kupon kodu kopyalandı!');
  };

  const resetForm = () => {
    setCouponForm({
      code: '',
      description: '',
      discountType: 'PERCENTAGE',
      discountValue: '',
      minOrderAmount: '',
      expiryDate: '',
      usageLimit: '',
      isActive: true
    });
    setEditingCoupon(null);
    setShowModal(false);
  };

  const editCoupon = (coupon) => {
    setCouponForm({
      code: coupon.code || '',
      description: coupon.description || '',
      discountType: coupon.discountType || 'PERCENTAGE',
      discountValue: coupon.discountValue || '',
      minOrderAmount: coupon.minOrderAmount || '',
      expiryDate: coupon.endDate ? coupon.endDate.split('T')[0] : '',
      usageLimit: coupon.usageLimit || '',
      isActive: coupon.isActive !== undefined ? coupon.isActive : true
    });
    setEditingCoupon(coupon);
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

  return (
    <div className="space-y-6 admin-panel">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-white">🎫 Kupon Yönetimi</h3>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
        >
          <FaPlus className="inline mr-2" />
          Yeni Kupon
        </button>
      </div>

      {/* Coupons List */}
      {loading && coupons.length === 0 ? (
        <div className="glass p-8 rounded-2xl border border-white border-opacity-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Kuponlar yükleniyor...</p>
        </div>
      ) : coupons.length === 0 ? (
        <div className="glass p-12 rounded-2xl border border-white border-opacity-20 text-center">
          <FaTicketAlt className="text-6xl text-gray-400 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-white mb-4">Henüz Kupon Yok</h3>
          <p className="text-gray-300 mb-8">İlk kuponu oluşturmak için butona tıklayın.</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
          >
            <FaPlus className="inline mr-2" />
            İlk Kuponu Oluştur
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {coupons.map((coupon) => (
            <div key={coupon.id} className="glass p-6 rounded-2xl border border-white border-opacity-20 hover:border-opacity-40 transition-all duration-300">
              {/* Coupon Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-xl ${coupon.discountType === 'PERCENTAGE' ? 'bg-blue-500' : 'bg-green-500'} text-white`}>
                    {coupon.discountType === 'PERCENTAGE' ? <FaPercent /> : <FaGift />}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-lg text-white font-mono tracking-wider bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                        {coupon.code}
                      </span>
                      <button
                        onClick={() => copyToClipboard(coupon.code)}
                        className="text-gray-400 hover:text-white transition-colors"
                        title="Kopyala"
                      >
                        <FaCopy size={14} />
                      </button>
                    </div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${
                      coupon.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                    }`}>
                      {coupon.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Coupon Details */}
              <div className="space-y-3 mb-4">
                <p className="text-gray-300 text-sm">{coupon.description}</p>
                
                <div className="bg-white bg-opacity-5 rounded-lg p-3">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-1">
                      {coupon.discountType === 'PERCENTAGE' 
                        ? `%${coupon.discountValue}` 
                        : formatPrice(coupon.discountValue)
                      }
                    </div>
                    <div className="text-gray-400 text-sm">İndirim</div>
                  </div>
                </div>

                {coupon.minOrderAmount > 0 && (
                  <div className="text-gray-300 text-sm">
                    <span className="font-medium">Min. Sipariş:</span> {formatPrice(coupon.minOrderAmount)}
                  </div>
                )}

                <div className="text-gray-300 text-sm">
                  <span className="font-medium">Son Kullanım:</span> {coupon.endDate ? formatDate(coupon.endDate) : 'Sınırsız'}
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Kullanım:</span>
                  <span className="text-white">{coupon.usedCount || 0} / {coupon.usageLimit || '∞'}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => editCoupon(coupon)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  <FaEdit className="inline mr-2" />
                  Düzenle
                </button>
                <button
                  onClick={() => handleDelete(coupon.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  <FaTrash className="inline mr-2" />
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Coupon Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl border border-white border-opacity-20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-white border-opacity-20">
              <h2 className="text-2xl font-bold text-white">
                {editingCoupon ? 'Kupon Düzenle' : 'Yeni Kupon Oluştur'}
              </h2>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Kupon Kodu *
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={couponForm.code}
                      onChange={(e) => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})}
                      className="flex-1 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-l-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="KUPON2024"
                      required
                      maxLength="20"
                    />
                    <button
                      type="button"
                      onClick={generateCouponCode}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-r-lg border border-purple-600 transition-colors"
                      title="Otomatik Oluştur"
                    >
                      🎲
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    İndirim Tipi *
                  </label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm({...couponForm, discountType: e.target.value})}
                    className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm({...couponForm, discountValue: e.target.value})}
                    className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder={couponForm.discountType === 'PERCENTAGE' ? '20' : '100'}
                    min="0"
                    max={couponForm.discountType === 'PERCENTAGE' ? '100' : undefined}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Min. Sipariş Tutarı (₺)
                  </label>
                  <input
                    type="number"
                    value={couponForm.minOrderAmount}
                    onChange={(e) => setCouponForm({...couponForm, minOrderAmount: e.target.value})}
                    className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Son Kullanım Tarihi *
                  </label>
                  <input
                    type="date"
                    value={couponForm.expiryDate}
                    onChange={(e) => setCouponForm({...couponForm, expiryDate: e.target.value})}
                    className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Kullanım Limiti
                  </label>
                  <input
                    type="number"
                    value={couponForm.usageLimit}
                    onChange={(e) => setCouponForm({...couponForm, usageLimit: e.target.value})}
                    className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Sınırsız"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Açıklama
                </label>
                <textarea
                  value={couponForm.description}
                  onChange={(e) => setCouponForm({...couponForm, description: e.target.value})}
                  className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Kupon açıklaması..."
                  rows="3"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={couponForm.isActive}
                  onChange={(e) => setCouponForm({...couponForm, isActive: e.target.checked})}
                  className="mr-3 w-4 h-4 text-purple-600 bg-white bg-opacity-10 border-white border-opacity-20 rounded focus:ring-purple-500"
                />
                <label htmlFor="isActive" className="text-white">
                  Kupon aktif olsun
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
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  {loading ? 'Kaydediliyor...' : editingCoupon ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponManagement; 