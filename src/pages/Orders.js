import React, { useState, useEffect } from 'react';
import { FaShoppingBag, FaSearch, FaCalendarAlt, FaMapMarkerAlt, FaDownload, FaTimes, FaEye, FaBox, FaTruck, FaCheckCircle, FaGift } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { ordersAPI } from '../services/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      loadUserOrders();
    }
  }, [user]);

  const loadUserOrders = async () => {
    if (!user?.id) {
      console.warn('User ID not available for loading orders');
      return;
    }

    setLoading(true);
    try {
      const response = await ordersAPI.getUserOrders(user.id);
      setOrders(response.data.data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Siparişler yüklenirken hata oluştu.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Bu siparişi iptal etmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      await ordersAPI.updateOrderStatus(orderId, 'CANCELLED');
      await loadUserOrders(); // Refresh orders
      toast.success('Sipariş başarıyla iptal edildi!');
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error(error.response?.data?.message || 'Sipariş iptal edilirken hata oluştu.');
    }
  };

  const downloadInvoice = async (orderId) => {
    try {
      // Simulate invoice download
      const link = document.createElement('a');
      link.href = `data:text/plain;charset=utf-8,Fatura - Sipariş #${orderId}`;
      link.download = `fatura-${orderId}.txt`;
      link.click();
      toast.success('Fatura indiriliyor...');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Fatura indirilirken hata oluştu.');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-500',
      CONFIRMED: 'bg-blue-500',
      PROCESSING: 'bg-purple-500',
      SHIPPED: 'bg-orange-500',
      DELIVERED: 'bg-green-500',
      CANCELLED: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusText = (status) => {
    const texts = {
      PENDING: 'Beklemede',
      CONFIRMED: 'Onaylandı',
      PROCESSING: 'Hazırlanıyor',
      SHIPPED: 'Kargoda',
      DELIVERED: 'Teslim Edildi',
      CANCELLED: 'İptal Edildi'
    };
    return texts[status] || status;
  };

  const getStatusIcon = (status) => {
    const icons = {
      PENDING: <FaCalendarAlt />,
      CONFIRMED: <FaCheckCircle />,
      PROCESSING: <FaBox />,
      SHIPPED: <FaTruck />,
      DELIVERED: <FaCheckCircle />,
      CANCELLED: <FaTimes />
    };
    return icons[status] || <FaBox />;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id?.toString().includes(searchTerm) || 
                         order.items?.some(item => 
                           item.productName?.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getOrderStats = () => {
    const total = orders.length;
    const pending = orders.filter(o => o.status === 'PENDING').length;
    const delivered = orders.filter(o => o.status === 'DELIVERED').length;
    const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    
    return { total, pending, delivered, totalSpent };
  };

  const stats = getOrderStats();

  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen dark:bg-gradient-dark light:bg-gradient-light bg-gradient-light flex items-center justify-center">
        <div className="glass p-8 rounded-2xl border border-white border-opacity-20 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Siparişler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dark:bg-gradient-dark light:bg-gradient-light bg-gradient-light pt-8 pb-16">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-4">🛍️ Siparişlerim</h1>
          <p className="text-gray-300 text-lg">Tüm siparişlerinizi buradan takip edebilirsiniz</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="glass p-6 rounded-2xl border border-white border-opacity-20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Toplam Sipariş</p>
                <p className="text-3xl font-bold text-white">{stats.total}</p>
              </div>
              <FaShoppingBag className="text-4xl text-blue-500" />
            </div>
          </div>
          
          <div className="glass p-6 rounded-2xl border border-white border-opacity-20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Bekleyen</p>
                <p className="text-3xl font-bold text-white">{stats.pending}</p>
              </div>
              <FaCalendarAlt className="text-4xl text-yellow-500" />
            </div>
          </div>
          
          <div className="glass p-6 rounded-2xl border border-white border-opacity-20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Teslim Edildi</p>
                <p className="text-3xl font-bold text-white">{stats.delivered}</p>
              </div>
              <FaCheckCircle className="text-4xl text-green-500" />
            </div>
          </div>
          
          <div className="glass p-6 rounded-2xl border border-white border-opacity-20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Toplam Harcama</p>
                <p className="text-3xl font-bold text-white">{formatPrice(stats.totalSpent)}</p>
              </div>
              <FaShoppingBag className="text-4xl text-purple-500" />
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Sipariş ID veya ürün adı ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 glass rounded-xl border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-6 py-3 glass rounded-xl border border-white border-opacity-20 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL" className="bg-gray-800 text-white">Tüm Durumlar</option>
            <option value="PENDING" className="bg-gray-800 text-white">Beklemede</option>
            <option value="CONFIRMED" className="bg-gray-800 text-white">Onaylandı</option>
            <option value="PROCESSING" className="bg-gray-800 text-white">Hazırlanıyor</option>
            <option value="SHIPPED" className="bg-gray-800 text-white">Kargoda</option>
            <option value="DELIVERED" className="bg-gray-800 text-white">Teslim Edildi</option>
            <option value="CANCELLED" className="bg-gray-800 text-white">İptal Edildi</option>
          </select>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 && !loading ? (
          <div className="glass p-12 rounded-2xl border border-white border-opacity-20 text-center">
            <FaShoppingBag className="text-6xl text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">Henüz Sipariş Yok</h3>
            <p className="text-gray-300 mb-8">İlk siparişinizi vermek için alışverişe başlayın!</p>
            <button 
              onClick={() => window.location.href = '/products'}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Alışverişe Başla
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div key={order.id} className="glass p-6 rounded-2xl border border-white border-opacity-20 hover:border-opacity-40 transition-all duration-300">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                    <div className={`p-3 rounded-xl ${getStatusColor(order.status)} text-white`}>
                      {getStatusIcon(order.status)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">Sipariş #{order.id}</h3>
                      <p className="text-gray-400">{formatDate(order.orderDate)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className={`px-4 py-2 rounded-full text-sm font-medium text-white ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">{formatPrice(order.totalAmount)}</p>
                      <p className="text-gray-400 text-sm">{order.items?.length || 0} ürün</p>
                    </div>
                  </div>
                </div>

                {/* Order Items Preview */}
                {order.items && order.items.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {order.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="bg-white bg-opacity-10 px-3 py-1 rounded-lg">
                        <span className="text-white text-sm">
                          {item.productName || 'Ürün'} x{item.quantity}
                        </span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="bg-white bg-opacity-10 px-3 py-1 rounded-lg">
                        <span className="text-gray-300 text-sm">
                          +{order.items.length - 3} ürün daha
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Show applied coupon if exists */}
                {order.couponCode && (
                  <div className="mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-500 bg-opacity-20 text-green-400 border border-green-500 border-opacity-50">
                      <FaGift className="mr-2" />
                      Kupon Uygulandı: {order.couponCode}
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowOrderModal(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <FaEye />
                    <span>Detay</span>
                  </button>
                  
                  <button
                    onClick={() => downloadInvoice(order.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <FaDownload />
                    <span>Fatura</span>
                  </button>
                  
                  {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                    <button
                      onClick={() => cancelOrder(order.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <FaTimes />
                      <span>İptal Et</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl border border-white border-opacity-20 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-white border-opacity-20 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">
                Sipariş Detayı #{selectedOrder.id}
              </h2>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Sipariş Bilgileri</h4>
                  <div className="space-y-2">
                    <p className="text-gray-300">
                      <span className="font-medium">Sipariş Tarihi:</span> {formatDate(selectedOrder.orderDate)}
                    </p>
                    <p className="text-gray-300">
                      <span className="font-medium">Durum:</span> 
                      <span className={`ml-2 px-3 py-1 rounded-full text-sm ${getStatusColor(selectedOrder.status)} text-white`}>
                        {getStatusText(selectedOrder.status)}
                      </span>
                    </p>
                    {selectedOrder.originalAmount && selectedOrder.discountAmount && selectedOrder.discountAmount > 0 && (
                      <p className="text-gray-300">
                        <span className="font-medium">Orijinal Tutar:</span> 
                        <span className="text-lg text-gray-400 ml-2 line-through">{formatPrice(selectedOrder.originalAmount)}</span>
                      </p>
                    )}
                    {selectedOrder.discountAmount && selectedOrder.discountAmount > 0 && (
                      <p className="text-gray-300">
                        <span className="font-medium">İndirim Tutarı:</span> 
                        <span className="text-lg text-green-400 ml-2">-{formatPrice(selectedOrder.discountAmount)}</span>
                      </p>
                    )}
                    <p className="text-gray-300">
                      <span className="font-medium">Toplam Tutar:</span> 
                      <span className="text-2xl font-bold text-white ml-2">{formatPrice(selectedOrder.totalAmount)}</span>
                    </p>
                    {selectedOrder.couponCode && (
                      <p className="text-gray-300">
                        <span className="font-medium">Kullanılan Kupon:</span> 
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded text-sm bg-green-500 bg-opacity-20 text-green-400">
                          <FaGift className="mr-1" />
                          {selectedOrder.couponCode}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                    <FaMapMarkerAlt className="mr-2" />
                    Teslimat Adresi
                  </h4>
                  <div className="bg-white bg-opacity-10 p-4 rounded-lg">
                    {selectedOrder.shippingAddress ? (
                      <div className="text-gray-300">
                        <p className="font-medium">{selectedOrder.shippingAddress.fullName}</p>
                        <p>{selectedOrder.shippingAddress.addressLine1}</p>
                        {selectedOrder.shippingAddress.addressLine2 && (
                          <p>{selectedOrder.shippingAddress.addressLine2}</p>
                        )}
                        <p>
                          {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}
                        </p>
                        <p>{selectedOrder.shippingAddress.country}</p>
                        {selectedOrder.shippingAddress.phoneNumber && (
                          <p className="mt-2">Tel: {selectedOrder.shippingAddress.phoneNumber}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-400">Adres bilgisi mevcut değil</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Sipariş Ürünleri</h4>
                <div className="space-y-4">
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item, index) => (
                      <div key={index} className="bg-white bg-opacity-10 p-4 rounded-lg flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {item.productImageUrl ? (
                            <img
                              src={item.productImageUrl}
                              alt={item.productName}
                              className="w-16 h-16 object-cover rounded-lg"
                              onError={(e) => {
                                e.target.src = '/images/placeholder.svg';
                              }}
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-600 rounded-lg flex items-center justify-center">
                              <FaBox className="text-gray-400" />
                            </div>
                          )}
                          <div>
                            <h5 className="font-semibold text-white">{item.productName || 'Ürün'}</h5>
                            <p className="text-gray-400 text-sm">
                              {item.productBrand && <span>{item.productBrand} • </span>}
                              {item.productCategory && <span>{item.productCategory}</span>}
                            </p>
                            <p className="text-gray-400">
                              {formatPrice(item.price)} x {item.quantity}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-white text-lg">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-8">Ürün bilgisi mevcut değil</p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-white border-opacity-20 flex justify-end space-x-4">
              <button
                onClick={() => downloadInvoice(selectedOrder.id)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <FaDownload />
                <span>Fatura İndir</span>
              </button>
              <button
                onClick={() => setShowOrderModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;