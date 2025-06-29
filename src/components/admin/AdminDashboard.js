import React, { useState, useEffect } from 'react';
import { FaChartBar, FaBox, FaTags, FaShoppingCart, FaImages, FaPercentage, FaGift } from 'react-icons/fa';
import SaleManagement from '../../pages/admin/components/SaleManagement';
import CouponManagement from '../../pages/admin/components/CouponManagement';
import CategoryManagement from '../../pages/admin/components/CategoryManagement';
import OrderManagement from '../../pages/admin/components/OrderManagement';
import ImageManagement from '../../pages/admin/components/ImageManagement';
import ProductManagement from './ProductManagement';
import { productsAPI, categoriesAPI, ordersAPI, couponsAPI } from '../../services/api';
import { config } from '../../utils/config';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalCategories: 0,
        totalOrders: 0,
        pendingOrders: 0,
        productsOnSale: 0,
        flashSaleProducts: 0,
        totalCoupons: 0,
        activeCoupons: 0
    });

    const [activeTab, setActiveTab] = useState('products');

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const [productsResponse, categoriesResponse, couponsResponse, ordersResponse] = await Promise.all([
                productsAPI.getAllProducts(),
                categoriesAPI.getAllCategories(),
                couponsAPI.getAllCoupons().catch(() => ({ data: [] })),
                ordersAPI.getAllOrders().catch(() => ({ data: { data: [] } }))
            ]);
            
            console.log('Dashboard stats - Products:', productsResponse.data);
            console.log('Dashboard stats - Categories:', categoriesResponse.data);
            console.log('Dashboard stats - Coupons:', couponsResponse.data);
            console.log('Dashboard stats - Orders:', ordersResponse.data);
            
            // Backend ApiResponse wrapper kullanıyor, data field'ına erişmemiz gerekiyor
            const productsData = productsResponse.data?.data ? 
                (Array.isArray(productsResponse.data.data) ? productsResponse.data.data : []) :
                (Array.isArray(productsResponse.data) ? productsResponse.data : []);
                
            const categoriesData = categoriesResponse.data?.data ? 
                (Array.isArray(categoriesResponse.data.data) ? categoriesResponse.data.data : []) :
                (Array.isArray(categoriesResponse.data) ? categoriesResponse.data : []);
                
            const couponsData = couponsResponse.data?.data ? 
                (Array.isArray(couponsResponse.data.data) ? couponsResponse.data.data : []) :
                (Array.isArray(couponsResponse.data) ? couponsResponse.data : []);

            const ordersData = ordersResponse.data?.data ? 
                (Array.isArray(ordersResponse.data.data) ? ordersResponse.data.data : []) :
                (Array.isArray(ordersResponse.data) ? ordersResponse.data : []);
            
            console.log('Parsed data:', {
                products: productsData.length,
                categories: categoriesData.length,
                coupons: couponsData.length,
                orders: ordersData.length
            });
            
            // İndirimli ürünleri say
            const productsOnSale = productsData.filter(product => product.isOnSale === true).length;
            const flashSaleProducts = productsData.filter(product => product.isFlashSale === true).length;
            
            // Aktif kuponları say
            const activeCoupons = couponsData.filter(coupon => coupon.isActive === true).length;
            
            // Bekleyen siparişleri say
            const pendingOrders = ordersData.filter(order => order.status === 'PENDING').length;
            
            setStats({
                totalProducts: productsData.length,
                totalCategories: categoriesData.length,
                totalOrders: ordersData.length,
                pendingOrders: pendingOrders,
                productsOnSale: productsOnSale,
                flashSaleProducts: flashSaleProducts,
                totalCoupons: couponsData.length,
                activeCoupons: activeCoupons
            });
        } catch (error) {
            console.error('Error loading stats:', error);
            setStats({
                totalProducts: 0,
                totalCategories: 0,
                totalOrders: 0,
                pendingOrders: 0,
                productsOnSale: 0,
                flashSaleProducts: 0,
                totalCoupons: 0,
                activeCoupons: 0
            });
        }
    };

    const tabs = [
        { key: 'products', label: 'Ürün Yönetimi', icon: FaBox, color: 'primary' },
        { key: 'categories', label: 'Kategori Yönetimi', icon: FaTags, color: 'accent' },
        { key: 'orders', label: 'Sipariş Yönetimi', icon: FaShoppingCart, color: 'success' },
        { key: 'images', label: 'Resim Yönetimi', icon: FaImages, color: 'warning' },
        { key: 'sales', label: 'İndirim Yönetimi', icon: FaPercentage, color: 'danger' },
        { key: 'coupons', label: 'Kupon Yönetimi', icon: FaGift, color: 'secondary' }
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'products':
                return <ProductManagement onStatsUpdate={loadStats} />;
            case 'categories':
                return <CategoryManagement onStatsUpdate={loadStats} />;
            case 'orders':
                return <OrderManagement onStatsUpdate={loadStats} />;
            case 'images':
                return <ImageManagement onStatsUpdate={loadStats} />;
            case 'sales':
                return <SaleManagement onStatsUpdate={loadStats} />;
            case 'coupons':
                return <CouponManagement onStatsUpdate={loadStats} />;
            default:
                return <ProductManagement onStatsUpdate={loadStats} />;
        }
    };

    return (
        <div className="min-h-screen dark:bg-gradient-dark light:bg-gradient-light bg-gradient-light admin-panel">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-1/5 left-1/5 w-96 h-96 bg-primary-500 rounded-full opacity-15 blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/5 right-1/5 w-96 h-96 bg-secondary-500 rounded-full opacity-15 blur-3xl animate-pulse animation-delay-1000"></div>
            </div>

            <div className="container mx-auto px-4 lg:px-8 py-8 relative z-10">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl lg:text-5xl font-black gradient-text mb-4 flex items-center justify-center">
                        <FaChartBar className="mr-4 text-primary-500" />
                        Admin Paneli
                    </h1>
                    <p className="text-gray-300 text-lg">
                        E-ticaret sitesi yönetim merkezi
                    </p>
                </div>

                {/* İstatistik Kartları */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
                    <div className="glass p-6 rounded-2xl border border-white border-opacity-20 text-center bg-gradient-to-br from-primary-500 from-opacity-10 to-primary-600 to-opacity-10 hover:scale-105 transition-all duration-300">
                        <h3 className="text-3xl font-bold text-primary-400 mb-2">{stats.totalProducts}</h3>
                        <p className="text-gray-300 font-medium">Toplam Ürün</p>
                    </div>
                    <div className="glass p-6 rounded-2xl border border-white border-opacity-20 text-center bg-gradient-to-br from-accent-500 from-opacity-10 to-accent-600 to-opacity-10 hover:scale-105 transition-all duration-300">
                        <h3 className="text-3xl font-bold text-accent-400 mb-2">{stats.totalCategories}</h3>
                        <p className="text-gray-300 font-medium">Kategori</p>
                    </div>
                    <div className="glass p-6 rounded-2xl border border-white border-opacity-20 text-center bg-gradient-to-br from-green-500 from-opacity-10 to-green-600 to-opacity-10 hover:scale-105 transition-all duration-300">
                        <h3 className="text-3xl font-bold text-green-400 mb-2">{stats.productsOnSale}</h3>
                        <p className="text-gray-300 font-medium">İndirimli Ürün</p>
                    </div>
                    <div className="glass p-6 rounded-2xl border border-white border-opacity-20 text-center bg-gradient-to-br from-yellow-500 from-opacity-10 to-yellow-600 to-opacity-10 hover:scale-105 transition-all duration-300">
                        <h3 className="text-3xl font-bold text-yellow-400 mb-2">{stats.flashSaleProducts}</h3>
                        <p className="text-gray-300 font-medium">Flash Sale</p>
                    </div>
                    <div className="glass p-6 rounded-2xl border border-white border-opacity-20 text-center bg-gradient-to-br from-red-500 from-opacity-10 to-red-600 to-opacity-10 hover:scale-105 transition-all duration-300">
                        <h3 className="text-3xl font-bold text-red-400 mb-2">{stats.totalOrders}</h3>
                        <p className="text-gray-300 font-medium">Toplam Sipariş</p>
                    </div>
                    <div className="glass p-6 rounded-2xl border border-white border-opacity-20 text-center bg-gradient-to-br from-purple-500 from-opacity-10 to-purple-600 to-opacity-10 hover:scale-105 transition-all duration-300">
                        <h3 className="text-3xl font-bold text-purple-400 mb-2">{stats.activeCoupons}</h3>
                        <p className="text-gray-300 font-medium">Aktif Kupon</p>
                    </div>
                </div>

                {/* Yönetim Sekmeleri */}
                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-1">
                        <div className="glass p-6 rounded-2xl border border-white border-opacity-20 sticky top-24">
                            <nav className="space-y-2">
                                {tabs.map((tab) => {
                                    const IconComponent = tab.icon;
                                    const isActive = activeTab === tab.key;
                                    return (
                                        <button
                                            key={tab.key}
                                            onClick={() => setActiveTab(tab.key)}
                                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 relative ${
                                                isActive
                                                    ? 'bg-primary-500 bg-opacity-20 text-primary-400 border border-primary-500 border-opacity-50'
                                                    : 'text-gray-300 hover:bg-white hover:bg-opacity-10'
                                            }`}
                                        >
                                            <IconComponent className={`text-${tab.color}-500`} />
                                            <span className="font-semibold">{tab.label}</span>
                                            {tab.key === 'orders' && stats.pendingOrders > 0 && (
                                                <span className="absolute top-2 right-2 bg-gradient-secondary text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                                                    {stats.pendingOrders}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <div className="glass p-8 rounded-2xl border border-white border-opacity-20">
                            {renderTabContent()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard; 