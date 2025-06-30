import React, { useState, useEffect, useRef } from 'react';
import { FaChartBar, FaBox, FaTags, FaShoppingCart, FaImages, FaPercentage, FaGift, FaSpinner } from 'react-icons/fa';
import SaleManagement from '../../pages/admin/components/SaleManagement';
import CouponManagement from '../../pages/admin/components/CouponManagement';
import CategoryManagement from '../../pages/admin/components/CategoryManagement';
import OrderManagement from '../../pages/admin/components/OrderManagement';
import ImageManagement from '../../pages/admin/components/ImageManagement';
import ProductManagement from './ProductManagement';
import { productsAPI, categoriesAPI, ordersAPI, couponsAPI } from '../../services/api';
import { config } from '../../utils/config';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('products');
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
    
    const [statsLoading, setStatsLoading] = useState(false);
    const isLoadingRef = useRef(false); // Prevent duplicate API calls
    const hasLoadedRef = useRef(false); // Track if stats have been loaded once

    useEffect(() => {
        // Only load stats once on mount, prevent duplicate calls
        if (!hasLoadedRef.current && !isLoadingRef.current) {
            loadStats();
        }
    }, []);

    const loadStats = async () => {
        // Prevent duplicate API calls
        if (isLoadingRef.current) {
            return;
        }

        isLoadingRef.current = true;
        setStatsLoading(true);
        
        try {
            
            // Reset stats immediately to show loading
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
            
            const [productResponse, categoriesResponse, couponsResponse, ordersResponse] = await Promise.all([
                productsAPI.getProductsPaginated({ page: 0, size: 100 }), // Use paginated endpoint
                categoriesAPI.getAllCategories(),
                couponsAPI.getAllCoupons().catch(() => ({ data: [] })),
                ordersAPI.getAllOrders().catch(() => ({ data: { data: [] } }))
            ]);
            
            // Handle paginated response structure for products
            const productsData = productResponse.data?.data?.products || 
                                productResponse.data?.products || 
                                productResponse.data?.data || 
                                [];
                
            const categoriesData = categoriesResponse.data?.data || categoriesResponse.data || [];
            const couponsData = couponsResponse.data?.data || couponsResponse.data || [];
            const ordersData = ordersResponse.data?.data || ordersResponse.data || [];
            
            
            
            // Process stats calculation asynchronously to avoid UI blocking
            setTimeout(() => {
                const productsOnSale = productsData.filter(product => product.isOnSale === true).length;
                const flashSaleProducts = productsData.filter(product => product.isFlashSale === true).length;
                const activeCoupons = couponsData.filter(coupon => coupon.isActive === true).length;
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
                
            }, 0); // Yield to browser for immediate UI update
            
            hasLoadedRef.current = true;
        } catch (error) {
            console.error('❌ Error loading stats:', error);
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
        } finally {
            setStatsLoading(false);
            isLoadingRef.current = false;
        }
    };

    // Only update stats when specifically called (not on every state change)
    const handleStatsUpdate = (newStats) => {
        if (newStats && typeof newStats === 'object') {
            setStats(prevStats => ({
                ...prevStats,
                ...newStats
            }));
        } else {
            // Small delay to prevent immediate re-calls
            setTimeout(() => {
                if (!isLoadingRef.current) {
                    loadStats();
                }
            }, 500);
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
                return <ProductManagement onStatsUpdate={handleStatsUpdate} />;
            case 'categories':
                return <CategoryManagement onStatsUpdate={handleStatsUpdate} />;
            case 'orders':
                return <OrderManagement onStatsUpdate={handleStatsUpdate} />;
            case 'images':
                return <ImageManagement onStatsUpdate={handleStatsUpdate} />;
            case 'sales':
                return <SaleManagement onStatsUpdate={handleStatsUpdate} />;
            case 'coupons':
                return <CouponManagement onStatsUpdate={handleStatsUpdate} />;
            default:
                return <ProductManagement onStatsUpdate={handleStatsUpdate} />;
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
                        <h3 className="text-3xl font-bold text-primary-400 mb-2">
                            {statsLoading ? (
                                <div className="w-8 h-8 border-t-2 border-primary-400 rounded-full animate-spin mx-auto"></div>
                            ) : (
                                stats.totalProducts
                            )}
                        </h3>
                        <p className="text-gray-300 font-medium">Toplam Ürün</p>
                    </div>
                    <div className="glass p-6 rounded-2xl border border-white border-opacity-20 text-center bg-gradient-to-br from-accent-500 from-opacity-10 to-accent-600 to-opacity-10 hover:scale-105 transition-all duration-300">
                        <h3 className="text-3xl font-bold text-accent-400 mb-2">
                            {statsLoading ? (
                                <div className="w-8 h-8 border-t-2 border-accent-400 rounded-full animate-spin mx-auto"></div>
                            ) : (
                                stats.totalCategories
                            )}
                        </h3>
                        <p className="text-gray-300 font-medium">Kategori</p>
                    </div>
                    <div className="glass p-6 rounded-2xl border border-white border-opacity-20 text-center bg-gradient-to-br from-green-500 from-opacity-10 to-green-600 to-opacity-10 hover:scale-105 transition-all duration-300">
                        <h3 className="text-3xl font-bold text-green-400 mb-2">
                            {statsLoading ? (
                                <div className="w-8 h-8 border-t-2 border-green-400 rounded-full animate-spin mx-auto"></div>
                            ) : (
                                stats.productsOnSale
                            )}
                        </h3>
                        <p className="text-gray-300 font-medium">İndirimli Ürün</p>
                    </div>
                    <div className="glass p-6 rounded-2xl border border-white border-opacity-20 text-center bg-gradient-to-br from-yellow-500 from-opacity-10 to-yellow-600 to-opacity-10 hover:scale-105 transition-all duration-300">
                        <h3 className="text-3xl font-bold text-yellow-400 mb-2">
                            {statsLoading ? (
                                <div className="w-8 h-8 border-t-2 border-yellow-400 rounded-full animate-spin mx-auto"></div>
                            ) : (
                                stats.flashSaleProducts
                            )}
                        </h3>
                        <p className="text-gray-300 font-medium">Flash Sale</p>
                    </div>
                    <div className="glass p-6 rounded-2xl border border-white border-opacity-20 text-center bg-gradient-to-br from-red-500 from-opacity-10 to-red-600 to-opacity-10 hover:scale-105 transition-all duration-300">
                        <h3 className="text-3xl font-bold text-red-400 mb-2">
                            {statsLoading ? (
                                <div className="w-8 h-8 border-t-2 border-red-400 rounded-full animate-spin mx-auto"></div>
                            ) : (
                                stats.totalOrders
                            )}
                        </h3>
                        <p className="text-gray-300 font-medium">Toplam Sipariş</p>
                    </div>
                    <div className="glass p-6 rounded-2xl border border-white border-opacity-20 text-center bg-gradient-to-br from-purple-500 from-opacity-10 to-purple-600 to-opacity-10 hover:scale-105 transition-all duration-300">
                        <h3 className="text-3xl font-bold text-purple-400 mb-2">
                            {statsLoading ? (
                                <div className="w-8 h-8 border-t-2 border-purple-400 rounded-full animate-spin mx-auto"></div>
                            ) : (
                                stats.activeCoupons
                            )}
                        </h3>
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