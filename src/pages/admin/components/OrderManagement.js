import React, { useState, useEffect } from 'react';
import { 
  FaCheck, FaBan, FaClock, FaUser, FaCalendar, 
  FaBox, FaShoppingCart, FaEye, FaTruck, FaCheckCircle, FaTimesCircle,
  FaTimes, FaGift
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { ordersAPI } from '../../../services/api';

const OrderManagement = ({ onStatsUpdate }) => {
  // State management
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [orderFilter, setOrderFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  // Data fetching functions
  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log('Fetching all orders...');
      const response = await ordersAPI.getAllOrders();
      console.log('Orders API response:', response);
      console.log('Orders data:', response.data);
      
      const ordersData = response.data.data || response.data || [];
      console.log('Parsed orders data:', ordersData);
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      console.error('Error response:', error.response);
      toast.error(`Siparişler yüklenirken hata oluştu: ${error.response?.data?.message || error.message}`);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      console.log('Fetching order details for ID:', orderId);
      const response = await ordersAPI.getOrderById(orderId);
      console.log('Order details API response:', response);
      console.log('Order details data:', response.data);
      
      const orderData = response.data.data || response.data;
      console.log('Parsed order details:', orderData);
      
      setSelectedOrder(orderData);
      setShowOrderModal(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      console.error('Error response:', error.response);
      toast.error(`Sipariş detayları yüklenirken hata oluştu: ${error.response?.data?.message || error.message}`);
    }
  };

  // Order management functions
  const handleApproveOrder = async (orderId) => {
    try {
      console.log('Approving order:', orderId);
      const response = await ordersAPI.approveOrder(orderId);
      console.log('Approve order response:', response);
      toast.success('Sipariş onaylandı!');
      fetchOrders();
      onStatsUpdate && onStatsUpdate();
    } catch (error) {
      console.error('Error approving order:', error);
      console.error('Error response:', error.response);
      toast.error(`Sipariş onaylanırken hata oluştu: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleRejectOrder = async (orderId) => {
    if (window.confirm('Bu siparişi reddetmek istediğinizden emin misiniz?')) {
      try {
        console.log('Rejecting order:', orderId);
        const response = await ordersAPI.rejectOrder(orderId);
        console.log('Reject order response:', response);
        toast.success('Sipariş reddedildi!');
        fetchOrders();
        onStatsUpdate && onStatsUpdate();
      } catch (error) {
        console.error('Error rejecting order:', error);
        console.error('Error response:', error.response);
        toast.error(`Sipariş reddedilirken hata oluştu: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      console.log('Updating order status:', { orderId, status });
      const response = await ordersAPI.updateOrderStatus(orderId, status);
      console.log('Update order status response:', response);
      toast.success('Sipariş durumu güncellendi!');
      fetchOrders();
      onStatsUpdate && onStatsUpdate();
    } catch (error) {
      console.error('Error updating order status:', error);
      console.error('Error response:', error.response);
      toast.error(`Sipariş durumu güncellenirken hata oluştu: ${error.response?.data?.message || error.message}`);
    }
  };

  // Helper functions
  const getStatusBadge = (status) => {
    const statusConfig = {
      'PENDING': { 
        bgColor: 'bg-yellow-500', 
        textColor: 'text-yellow-100', 
        icon: FaClock,
        text: 'Onay Bekliyor' 
      },
      'CONFIRMED': { 
        bgColor: 'bg-blue-500', 
        textColor: 'text-blue-100', 
        icon: FaBox,
        text: 'Onaylandı' 
      },
      'PROCESSING': { 
        bgColor: 'bg-purple-500', 
        textColor: 'text-purple-100', 
        icon: FaBox,
        text: 'Hazırlanıyor' 
      },
      'SHIPPED': { 
        bgColor: 'bg-gray-500', 
        textColor: 'text-gray-100', 
        icon: FaTruck,
        text: 'Kargoda' 
      },
      'DELIVERED': { 
        bgColor: 'bg-green-500', 
        textColor: 'text-green-100', 
        icon: FaCheckCircle,
        text: 'Teslim Edildi' 
      },
      'CANCELLED': { 
        bgColor: 'bg-red-500', 
        textColor: 'text-red-100', 
        icon: FaTimesCircle,
        text: 'İptal Edildi' 
      }
    };
    
    const config = statusConfig[status] || statusConfig['PENDING'];
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
        <IconComponent className="mr-1" />
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Filter orders
  const filteredOrders = orders.filter(order => 
    orderFilter === 'ALL' || order.status === orderFilter
  );

  if (loading && orders.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-t-4 border-primary-500 rounded-full animate-spin"></div>
          <span className="text-white text-lg">Siparişler yükleniyor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <FaShoppingCart className="mr-3 text-green-500" />
          Sipariş Yönetimi
        </h2>
        <div className="flex space-x-2">
          <select
            value={orderFilter}
            onChange={(e) => setOrderFilter(e.target.value)}
            className="px-4 py-2 rounded-xl glass border border-white border-opacity-20 text-white bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="ALL" className="bg-gray-800 text-white">Tüm Siparişler</option>
            <option value="PENDING" className="bg-gray-800 text-white">Onay Bekleyen</option>
            <option value="CONFIRMED" className="bg-gray-800 text-white">Onaylanan</option>
            <option value="PROCESSING" className="bg-gray-800 text-white">Hazırlanan</option>
            <option value="SHIPPED" className="bg-gray-800 text-white">Kargoda</option>
            <option value="DELIVERED" className="bg-gray-800 text-white">Teslim Edilen</option>
            <option value="CANCELLED" className="bg-gray-800 text-white">İptal Edilen</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass rounded-2xl border border-white border-opacity-20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-white bg-opacity-5">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Sipariş #</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Müşteri</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tarih</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ürünler</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Toplam</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Durum</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white divide-opacity-10">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-white hover:bg-opacity-5 transition-all duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-white font-bold">#{order.id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-gray-300">
                      <FaUser className="mr-2 text-blue-400" />
                      Müşteri #{order.userId}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-gray-300">
                      <FaCalendar className="mr-2 text-purple-400" />
                      {formatDate(order.orderDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      {order.items?.slice(0, 2).map((item, index) => (
                        <div key={index} className="text-gray-300">
                          {item.productName} x{item.quantity}
                        </div>
                      ))}
                      {order.items?.length > 2 && (
                        <div className="text-gray-400 text-xs mt-1">
                          +{order.items.length - 2} ürün daha
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-green-400 font-bold">{formatPrice(order.totalAmount)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      {order.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleApproveOrder(order.id)}
                            className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors duration-200"
                            title="Siparişi Onayla"
                          >
                            <FaCheck />
                          </button>
                          <button
                            onClick={() => handleRejectOrder(order.id)}
                            className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors duration-200"
                            title="Siparişi Reddet"
                          >
                            <FaBan />
                          </button>
                        </>
                      )}
                      
                      {order.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'PROCESSING')}
                          className="p-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors duration-200"
                          title="Hazırlanıyor Olarak İşaretle"
                        >
                          <FaBox />
                        </button>
                      )}
                      
                      {order.status === 'PROCESSING' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'SHIPPED')}
                          className="p-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200"
                          title="Kargoya Ver"
                        >
                          <FaTruck />
                        </button>
                      )}
                      
                      {order.status === 'SHIPPED' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'DELIVERED')}
                          className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors duration-200"
                          title="Teslim Edildi Olarak İşaretle"
                        >
                          <FaCheckCircle />
                        </button>
                      )}
                      
                      <button
                        onClick={() => fetchOrderDetails(order.id)}
                        className="p-2 rounded-lg border border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white transition-all duration-200"
                        title="Sipariş Detayları"
                      >
                        <FaEye />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredOrders.length === 0 && !loading && (
          <div className="p-12 text-center">
            <FaShoppingCart className="text-6xl text-gray-400 mb-4 mx-auto" />
            <h3 className="text-xl font-semibold text-white mb-2">Sipariş bulunamadı</h3>
            <p className="text-gray-400">
              {orderFilter === 'ALL' ? 'Henüz hiç sipariş verilmemiş.' : `${orderFilter} durumunda sipariş bulunmuyor.`}
            </p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 bg-opacity-95 backdrop-blur-lg rounded-2xl border border-white border-opacity-30 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
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
                      <span className="font-medium">Sipariş ID:</span> #{selectedOrder.id}
                    </p>
                    <p className="text-gray-300">
                      <span className="font-medium">Müşteri ID:</span> #{selectedOrder.userId}
                    </p>
                    <p className="text-gray-300">
                      <span className="font-medium">Sipariş Tarihi:</span> {formatDate(selectedOrder.orderDate)}
                    </p>
                    <p className="text-gray-300">
                      <span className="font-medium">Durum:</span> 
                      <span className="ml-2">{getStatusBadge(selectedOrder.status)}</span>
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

                {/* Admin Actions */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Admin İşlemleri</h4>
                  <div className="space-y-3">
                    {selectedOrder.status === 'PENDING' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            handleApproveOrder(selectedOrder.id);
                            setShowOrderModal(false);
                          }}
                          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <FaCheck />
                          <span>Onayla</span>
                        </button>
                        <button
                          onClick={() => {
                            handleRejectOrder(selectedOrder.id);
                            setShowOrderModal(false);
                          }}
                          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          <FaBan />
                          <span>Reddet</span>
                        </button>
                      </div>
                    )}
                    
                    {selectedOrder.status === 'CONFIRMED' && (
                      <button
                        onClick={() => {
                          handleUpdateOrderStatus(selectedOrder.id, 'PROCESSING');
                          setShowOrderModal(false);
                        }}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                      >
                        <FaBox />
                        <span>Hazırlanıyor Olarak İşaretle</span>
                      </button>
                    )}
                    
                    {selectedOrder.status === 'PROCESSING' && (
                      <button
                        onClick={() => {
                          handleUpdateOrderStatus(selectedOrder.id, 'SHIPPED');
                          setShowOrderModal(false);
                        }}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        <FaTruck />
                        <span>Kargoya Ver</span>
                      </button>
                    )}
                    
                    {selectedOrder.status === 'SHIPPED' && (
                      <button
                        onClick={() => {
                          handleUpdateOrderStatus(selectedOrder.id, 'DELIVERED');
                          setShowOrderModal(false);
                        }}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <FaCheckCircle />
                        <span>Teslim Edildi Olarak İşaretle</span>
                      </button>
                    )}

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Durum Değiştir:
                      </label>
                      <select
                        onChange={(e) => {
                          if (e.target.value && e.target.value !== selectedOrder.status) {
                            handleUpdateOrderStatus(selectedOrder.id, e.target.value);
                            setShowOrderModal(false);
                          }
                        }}
                        className="w-full px-3 py-2 glass rounded-lg border border-white border-opacity-20 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        defaultValue=""
                      >
                        <option value="" className="bg-gray-800 text-white">Durum seçin...</option>
                        <option value="PENDING" className="bg-gray-800 text-white">Onay Bekliyor</option>
                        <option value="CONFIRMED" className="bg-gray-800 text-white">Onaylandı</option>
                        <option value="PROCESSING" className="bg-gray-800 text-white">Hazırlanıyor</option>
                        <option value="SHIPPED" className="bg-gray-800 text-white">Kargoda</option>
                        <option value="DELIVERED" className="bg-gray-800 text-white">Teslim Edildi</option>
                        <option value="CANCELLED" className="bg-gray-800 text-white">İptal Edildi</option>
                      </select>
                    </div>
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
            <div className="p-6 border-t border-white border-opacity-20 flex justify-end">
              <button
                onClick={() => setShowOrderModal(false)}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
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

export default OrderManagement; 