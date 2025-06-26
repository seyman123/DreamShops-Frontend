import React, { useState, useEffect, useCallback } from 'react';
import { FaUser, FaEdit, FaSave, FaTimes, FaShieldAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  
  const [loading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [newAddress, setNewAddress] = useState({
    title: '',
    fullName: '',
    address: '',
    city: '',
    district: '',
    postalCode: '',
    phone: ''
  });

  const fetchUserData = useCallback(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchUserData();
    fetchAddresses();
  }, [user, navigate, fetchUserData]);

  const fetchAddresses = async () => {
    try {
      const response = await api.get('/addresses');
      console.log('Address response:', response.data);
      // Backend API response yapısı: { message: "...", data: [...] }
      setAddresses(response.data.data || response.data || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setAddresses([]); // Hata durumunda boş array set et
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      setUpdating(true);
      const userId = user.id || user.sub || user.userId;
      const response = await api.put(`/users/update/${userId}/user`, formData);
      updateUser(response.data.data);
      setSuccess('Profil başarıyla güncellendi');
      setEditMode(false);
      toast.success('Profil başarıyla güncellendi');
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.message || 'Profil güncellenirken bir hata oluştu';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Yeni şifreler eşleşmiyor');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setError('Yeni şifre en az 6 karakter olmalıdır');
      return;
    }
    
    try {
      setUpdating(true);
      const userId = user.id || user.sub || user.userId;
      await api.put(`/users/${userId}/change-password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setSuccess('Şifre başarıyla değiştirildi');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Şifre başarıyla değiştirildi');
    } catch (error) {
      console.error('Error changing password:', error);
      const errorMessage = error.response?.data?.message || 'Şifre değiştirilirken bir hata oluştu';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  const addAddress = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      setUpdating(true);
      await api.post('/addresses', newAddress);
      setSuccess('Adres başarıyla eklendi');
      setNewAddress({
        title: '',
        fullName: '',
        address: '',
        city: '',
        district: '',
        postalCode: '',
        phone: ''
      });
      fetchAddresses();
    } catch (error) {
      console.error('Error adding address:', error);
      setError('Adres eklenirken bir hata oluştu');
    } finally {
      setUpdating(false);
    }
  };

  const deleteAddress = async (addressId) => {
    try {
      await api.delete(`/addresses/${addressId}`);
      toast.success('Adres silindi');
      fetchAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Adres silinirken bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen dark:bg-gradient-dark light:bg-gradient-light bg-gradient-light flex items-center justify-center">
        <div className="glass p-8 rounded-2xl border border-white border-opacity-20 text-center">
          <div className="w-12 h-12 border-t-4 border-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Profil yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen dark:bg-gradient-dark light:bg-gradient-light bg-gradient-light">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/5 left-1/5 w-96 h-96 bg-primary-500 rounded-full opacity-15 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/5 right-1/5 w-96 h-96 bg-secondary-500 rounded-full opacity-15 blur-3xl animate-pulse animation-delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-20 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-black gradient-text mb-4">
            Profilim
          </h1>
          <p className="text-gray-300 text-lg">
            Hesap ayarlarınızı ve tercihlerinizi yönetin
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="glass p-4 rounded-xl border border-red-500 border-opacity-50 bg-red-500 bg-opacity-10 text-red-300 mb-6">
            {error}
          </div>
        )}
        {success && (
          <div className="glass p-4 rounded-xl border border-green-500 border-opacity-50 bg-green-500 bg-opacity-10 text-green-300 mb-6">
            {success}
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass p-6 rounded-2xl border border-white border-opacity-20 sticky top-24">
              {/* User Info */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaUser className="text-white text-3xl" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-gray-400">{user?.email}</p>
              </div>

              {/* Navigation Tabs */}
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    activeTab === 'profile'
                      ? 'bg-primary-500 bg-opacity-20 text-primary-400 border border-primary-500 border-opacity-50'
                      : 'text-gray-300 hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  <FaUser />
                  <span>Profil Bilgileri</span>
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    activeTab === 'password'
                      ? 'bg-primary-500 bg-opacity-20 text-primary-400 border border-primary-500 border-opacity-50'
                      : 'text-gray-300 hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  <FaShieldAlt />
                  <span>Güvenlik</span>
                </button>
                <button
                  onClick={() => setActiveTab('addresses')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                    activeTab === 'addresses'
                      ? 'bg-primary-500 bg-opacity-20 text-primary-400 border border-primary-500 border-opacity-50'
                      : 'text-gray-300 hover:bg-white hover:bg-opacity-10'
                  }`}
                >
                  <FaMapMarkerAlt />
                  <span>Adresler</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="glass p-8 rounded-2xl border border-white border-opacity-20">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Profil Bilgileri</h2>
                    <button
                      onClick={() => setEditMode(!editMode)}
                      className="flex items-center space-x-2 px-4 py-2 rounded-xl border border-primary-500 text-primary-400 hover:bg-primary-500 hover:text-white transition-all duration-300"
                    >
                      {editMode ? <FaTimes /> : <FaEdit />}
                      <span>{editMode ? 'İptal' : 'Düzenle'}</span>
                    </button>
                  </div>

                  <form onSubmit={updateProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-white font-medium mb-2">Ad</label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          disabled={!editMode}
                          className="w-full px-4 py-3 rounded-xl glass border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label className="block text-white font-medium mb-2">Soyad</label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          disabled={!editMode}
                          className="w-full px-4 py-3 rounded-xl glass border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">E-posta</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!editMode}
                        className="w-full px-4 py-3 rounded-xl glass border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-white font-medium mb-2">Telefon</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          disabled={!editMode}
                          className="w-full px-4 py-3 rounded-xl glass border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                        />
                      </div>
                      <div>
                        <label className="block text-white font-medium mb-2">Doğum Tarihi</label>
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          disabled={!editMode}
                          className="w-full px-4 py-3 rounded-xl glass border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                        />
                      </div>
                    </div>

                    {editMode && (
                      <button
                        type="submit"
                        disabled={updating}
                        className="flex items-center space-x-2 btn-gradient px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50"
                      >
                        {updating ? (
                          <>
                            <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                            <span>Güncelleniyor...</span>
                          </>
                        ) : (
                          <>
                            <FaSave />
                            <span>Değişiklikleri Kaydet</span>
                          </>
                        )}
                      </button>
                    )}
                  </form>
                </div>
              )}

              {/* Password Tab */}
              {activeTab === 'password' && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Şifre Değiştir</h2>
                    <p className="text-gray-400">Hesabınızın güvenliği için şifrenizi güncelleyin</p>
                  </div>

                  <form onSubmit={changePassword} className="space-y-6">
                    <div>
                      <label className="block text-white font-medium mb-2">Mevcut Şifre</label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        required
                        className="w-full px-4 py-3 rounded-xl glass border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">Yeni Şifre</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                        className="w-full px-4 py-3 rounded-xl glass border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">Yeni Şifre Tekrar</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                        className="w-full px-4 py-3 rounded-xl glass border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={updating}
                      className="flex items-center space-x-2 btn-gradient px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50"
                    >
                      {updating ? (
                        <>
                          <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin"></div>
                          <span>Güncelleniyor...</span>
                        </>
                      ) : (
                        <>
                          <FaShieldAlt />
                          <span>Şifreyi Güncelle</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === 'addresses' && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Adreslerim</h2>
                    <p className="text-gray-400">Teslimat adreslerinizi yönetin</p>
                  </div>

                  {/* Add New Address Form */}
                  <div className="glass p-6 rounded-xl border border-white border-opacity-20 mb-6">
                    <h3 className="text-lg font-bold text-white mb-4">Yeni Adres Ekle</h3>
                    <form onSubmit={addAddress} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          type="text"
                          name="title"
                          placeholder="Adres Başlığı (örn: Ev, İş)"
                          value={newAddress.title}
                          onChange={handleAddressChange}
                          required
                          className="px-4 py-3 rounded-xl glass border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <input
                          type="text"
                          name="fullName"
                          placeholder="Ad Soyad"
                          value={newAddress.fullName}
                          onChange={handleAddressChange}
                          required
                          className="px-4 py-3 rounded-xl glass border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <textarea
                        name="address"
                        placeholder="Tam Adres"
                        value={newAddress.address}
                        onChange={handleAddressChange}
                        required
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl glass border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                          type="text"
                          name="city"
                          placeholder="Şehir"
                          value={newAddress.city}
                          onChange={handleAddressChange}
                          required
                          className="px-4 py-3 rounded-xl glass border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <input
                          type="text"
                          name="district"
                          placeholder="İlçe"
                          value={newAddress.district}
                          onChange={handleAddressChange}
                          required
                          className="px-4 py-3 rounded-xl glass border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                        <input
                          type="text"
                          name="postalCode"
                          placeholder="Posta Kodu"
                          value={newAddress.postalCode}
                          onChange={handleAddressChange}
                          required
                          className="px-4 py-3 rounded-xl glass border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="Telefon Numarası"
                        value={newAddress.phone}
                        onChange={handleAddressChange}
                        required
                        className="w-full px-4 py-3 rounded-xl glass border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <button
                        type="submit"
                        disabled={updating}
                        className="btn-gradient px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50"
                      >
                        {updating ? 'Ekleniyor...' : 'Adres Ekle'}
                      </button>
                    </form>
                  </div>

                  {/* Existing Addresses */}
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <div key={address.id} className="glass p-6 rounded-xl border border-white border-opacity-20">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-lg font-bold text-white mb-2">{address.title}</h4>
                            <p className="text-gray-300 mb-1">{address.fullName}</p>
                            <p className="text-gray-400 mb-2">{address.address}</p>
                            <p className="text-gray-400">
                              {address.district}, {address.city} {address.postalCode}
                            </p>
                            <p className="text-gray-400">{address.phone}</p>
                          </div>
                          <button
                            onClick={() => deleteAddress(address.id)}
                            className="px-3 py-2 rounded-lg border border-red-500 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300"
                          >
                            Sil
                          </button>
                        </div>
                      </div>
                    ))}
                    {addresses.length === 0 && (
                      <div className="text-center py-8">
                        <FaMapMarkerAlt className="text-4xl text-gray-400 mb-4 mx-auto" />
                        <p className="text-gray-400">Henüz adres eklenmemiş</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 