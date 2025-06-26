import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoriesAPI } from '../services/api';

const Home = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesResponse = await categoriesAPI.getAllCategories();
        setCategories(categoriesResponse.data.data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen dark:bg-gradient-dark light:bg-gradient-light bg-gradient-light relative overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/5 left-1/5 w-96 h-96 bg-primary-500 rounded-full opacity-15 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/5 right-1/5 w-96 h-96 bg-secondary-500 rounded-full opacity-15 blur-3xl animate-pulse animation-delay-1000"></div>
        <div className="absolute top-3/5 left-2/5 w-64 h-64 bg-accent-500 rounded-full opacity-10 blur-3xl animate-pulse animation-delay-2000"></div>
      </div>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center relative overflow-hidden">
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 min-h-screen items-center">
            <div className="p-8 lg:p-12">
              <div className="animate-fade-in">
                <h1 className="text-4xl lg:text-6xl xl:text-7xl font-black leading-tight mb-8 gradient-text text-center lg:text-left">
                  iPhone'u tek büyük ekran<br />
                  yapma hayalimizi gerçekleştirdik.
                </h1>
                <div className="w-48 h-1.5 bg-gradient-primary rounded-full mb-8 animate-slide-up mx-auto lg:mx-0"></div>
                <p className="text-lg lg:text-xl leading-relaxed dark:text-gray-300 light:text-gray-700 text-gray-700 mb-12 max-w-2xl text-center lg:text-left mx-auto lg:mx-0">
                  iPhone X, şirketin tam ekran özelliğine sahip ilk akıllı telefonu olup, Galaxy Note 8 
                  gibi modelleri hedef alıyor. Yepyeni 'Super Retina' çözünürlüğü, güçlendirilmiş cam 
                  tasarımı ve kablosuz şarj desteği ile iPhone X, Qi şarj standardını destekleyerek geliyor.
                </p>
                <div className="text-center lg:text-left">
                  <button className="bg-transparent border-3 border-transparent bg-gradient-to-r from-primary-500 to-secondary-500 p-1 rounded-full hover:scale-105 hover:-translate-y-1 transition-all duration-300 hover:shadow-2xl hover:shadow-primary-500/50">
                    <span className="block bg-gray-900 px-8 py-4 rounded-full text-white font-bold text-lg tracking-widest">
                  SUNUMU İZLEYİN
                    </span>
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-center items-center relative">
              <div className="w-80 h-96 lg:w-96 lg:h-[600px] bg-gradient-primary rounded-[60px] flex items-center justify-center relative shadow-2xl shadow-primary-500/50 animate-float">
                <div className="absolute inset-5 bg-gray-900 rounded-[40px] shadow-inner"></div>
                <div className="text-6xl lg:text-8xl font-black gradient-text-accent relative z-10 animate-pulse">
                  X
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-white/10 rounded-[60px]"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Collections Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 dark:glass-dark light:glass-light glass-light"></div>
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            <div className="dark:glass light:glass-light glass-light h-full p-8 rounded-2xl border border-white border-opacity-20 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary-500/20 group">
              <h5 className="text-2xl font-bold dark:text-white light:text-gray-800 text-gray-800 mb-6 flex items-center">
                <span className="text-3xl mr-3">💻</span> 
                Mac Serisi
              </h5>
              <ul className="space-y-3 dark:text-gray-300 light:text-gray-600 text-gray-600">
                <li className="flex items-center dark:hover:text-white light:hover:text-gray-800 hover:text-gray-800 transition-colors duration-200 cursor-pointer group-hover:translate-x-1">
                  <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                  Apple Aksesuarları
                </li>
                <li className="flex items-center dark:hover:text-white light:hover:text-gray-800 hover:text-gray-800 transition-colors duration-200 cursor-pointer group-hover:translate-x-1">
                  <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                  Multimedia iRig Acoustic
                </li>
                <li className="flex items-center dark:hover:text-white light:hover:text-gray-800 hover:text-gray-800 transition-colors duration-200 cursor-pointer group-hover:translate-x-1">
                  <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                  iPad Pro Smart Connector
                </li>
                <li className="flex items-center dark:hover:text-white light:hover:text-gray-800 hover:text-gray-800 transition-colors duration-200 cursor-pointer group-hover:translate-x-1">
                  <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                  MacBook
                </li>
                <li className="flex items-center dark:hover:text-white light:hover:text-gray-800 hover:text-gray-800 transition-colors duration-200 cursor-pointer group-hover:translate-x-1">
                  <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                  MacBook Air
                </li>
                <li className="flex items-center dark:hover:text-white light:hover:text-gray-800 hover:text-gray-800 transition-colors duration-200 cursor-pointer group-hover:translate-x-1">
                  <span className="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
                  MacBook Pro
                </li>
                </ul>
              </div>
            <div className="dark:glass light:glass-light glass-light h-full p-8 rounded-2xl border border-white border-opacity-20 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-accent-500/20 group">
              <h5 className="text-2xl font-bold dark:text-white light:text-gray-800 text-gray-800 mb-6 flex items-center">
                <span className="text-3xl mr-3">📱</span> 
                iPad Dünyası
              </h5>
              <ul className="space-y-3 dark:text-gray-300 light:text-gray-600 text-gray-600">
                <li className="flex items-center dark:hover:text-white light:hover:text-gray-800 hover:text-gray-800 transition-colors duration-200 cursor-pointer group-hover:translate-x-1">
                  <span className="w-2 h-2 bg-accent-500 rounded-full mr-3"></span>
                  iPad mini Silikon Kılıf
                </li>
                <li className="flex items-center dark:hover:text-white light:hover:text-gray-800 hover:text-gray-800 transition-colors duration-200 cursor-pointer group-hover:translate-x-1">
                  <span className="w-2 h-2 bg-accent-500 rounded-full mr-3"></span>
                  iPad mini Smart Cover
                </li>
                <li className="flex items-center dark:hover:text-white light:hover:text-gray-800 hover:text-gray-800 transition-colors duration-200 cursor-pointer group-hover:translate-x-1">
                  <span className="w-2 h-2 bg-accent-500 rounded-full mr-3"></span>
                  iPad Pro Smart Keyboard
                </li>
                <li className="flex items-center dark:hover:text-white light:hover:text-gray-800 hover:text-gray-800 transition-colors duration-200 cursor-pointer group-hover:translate-x-1">
                  <span className="w-2 h-2 bg-accent-500 rounded-full mr-3"></span>
                  MacBook Standı
                </li>
                <li className="flex items-center dark:hover:text-white light:hover:text-gray-800 hover:text-gray-800 transition-colors duration-200 cursor-pointer group-hover:translate-x-1">
                  <span className="w-2 h-2 bg-accent-500 rounded-full mr-3"></span>
                  iMac
                </li>
                <li className="flex items-center dark:hover:text-white light:hover:text-gray-800 hover:text-gray-800 transition-colors duration-200 cursor-pointer group-hover:translate-x-1">
                  <span className="w-2 h-2 bg-accent-500 rounded-full mr-3"></span>
                  iPad Air 2
                </li>
                </ul>
              </div>
            <div className="dark:glass light:glass-light glass-light h-full p-8 rounded-2xl border border-white border-opacity-20 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-secondary-500/20 group">
              <h5 className="text-2xl font-bold dark:text-white light:text-gray-800 text-gray-800 mb-6 flex items-center">
                <span className="text-3xl mr-3">📞</span> 
                iPhone Koleksiyonu
              </h5>
              <ul className="space-y-3 dark:text-gray-300 light:text-gray-600 text-gray-600">
                <li className="flex items-center dark:hover:text-white light:hover:text-gray-800 hover:text-gray-800 transition-colors duration-200 cursor-pointer group-hover:translate-x-1">
                  <span className="w-2 h-2 bg-secondary-500 rounded-full mr-3"></span>
                  iPad Pro
                </li>
                <li className="flex items-center dark:hover:text-white light:hover:text-gray-800 hover:text-gray-800 transition-colors duration-200 cursor-pointer group-hover:translate-x-1">
                  <span className="w-2 h-2 bg-secondary-500 rounded-full mr-3"></span>
                  iPad mini 4
                </li>
                <li className="flex items-center dark:hover:text-white light:hover:text-gray-800 hover:text-gray-800 transition-colors duration-200 cursor-pointer group-hover:translate-x-1">
                  <span className="w-2 h-2 bg-secondary-500 rounded-full mr-3"></span>
                  iPhone 6s
                </li>
                <li className="flex items-center dark:hover:text-white light:hover:text-gray-800 hover:text-gray-800 transition-colors duration-200 cursor-pointer group-hover:translate-x-1">
                  <span className="w-2 h-2 bg-secondary-500 rounded-full mr-3"></span>
                  iPhone Lightning Dock
                </li>
                <li className="flex items-center dark:hover:text-white light:hover:text-gray-800 hover:text-gray-800 transition-colors duration-200 cursor-pointer group-hover:translate-x-1">
                  <span className="w-2 h-2 bg-secondary-500 rounded-full mr-3"></span>
                  6s Deri Kılıf
                </li>
                <li className="flex items-center dark:hover:text-white light:hover:text-gray-800 hover:text-gray-800 transition-colors duration-200 cursor-pointer group-hover:translate-x-1">
                  <span className="w-2 h-2 bg-secondary-500 rounded-full mr-3"></span>
                  iPhone SE
                </li>
                </ul>
              </div>
            <div className="dark:glass light:glass-light glass-light h-full p-8 rounded-2xl border border-white border-opacity-20 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-warning-500/20 group">
              <h5 className="text-2xl font-bold dark:text-white light:text-gray-800 text-gray-800 mb-6 flex items-center">
                <span className="text-3xl mr-3">🎵</span> 
                Müzik & Eğlence
              </h5>
              <ul className="space-y-3 dark:text-gray-300 light:text-gray-600 text-gray-600">
                <li className="flex items-center dark:hover:text-white light:hover:text-gray-800 hover:text-gray-800 transition-colors duration-200 cursor-pointer group-hover:translate-x-1">
                  <span className="w-2 h-2 bg-warning-500 rounded-full mr-3"></span>
                  iPhone X
                </li>
                <li className="flex items-center dark:hover:text-white light:hover:text-gray-800 hover:text-gray-800 transition-colors duration-200 cursor-pointer group-hover:translate-x-1">
                  <span className="w-2 h-2 bg-warning-500 rounded-full mr-3"></span>
                  iPod nano
                </li>
                <li className="flex items-center dark:hover:text-white light:hover:text-gray-800 hover:text-gray-800 transition-colors duration-200 cursor-pointer group-hover:translate-x-1">
                  <span className="w-2 h-2 bg-warning-500 rounded-full mr-3"></span>
                  iPod touch
                </li>
                <li className="flex items-center dark:hover:text-white light:hover:text-gray-800 hover:text-gray-800 transition-colors duration-200 cursor-pointer group-hover:translate-x-1">
                  <span className="w-2 h-2 bg-warning-500 rounded-full mr-3"></span>
                  MacBook
                </li>
                <li className="flex items-center dark:hover:text-white light:hover:text-gray-800 hover:text-gray-800 transition-colors duration-200 cursor-pointer group-hover:translate-x-1">
                  <span className="w-2 h-2 bg-warning-500 rounded-full mr-3"></span>
                  iPad Pro Smart Cover
                </li>
                <li className="flex items-center dark:hover:text-white light:hover:text-gray-800 hover:text-gray-800 transition-colors duration-200 cursor-pointer group-hover:translate-x-1">
                  <span className="w-2 h-2 bg-warning-500 rounded-full mr-3"></span>
                  Apple TV
                </li>
                </ul>
              </div>
          </div>
        </div>
      </section>

      {/* iPhone Uzay Grisi Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-black gradient-text mb-8">
              iPhone X Uzay Grisi
            </h2>
            <p className="text-xl dark:text-gray-300 light:text-gray-700 text-gray-700 max-w-3xl mx-auto">
              Mükemmel iPhone X rengini seçin ve kendinize ait yapın.
            </p>
          </div>
          
          <div className="flex justify-center items-center space-x-8">
            <div className="w-32 h-48 bg-gradient-to-b from-gray-700 to-gray-900 rounded-[24px] shadow-2xl animate-float"></div>
            <div className="w-32 h-48 bg-gradient-to-b from-gray-100 to-gray-300 rounded-[24px] shadow-2xl border-4 border-white animate-float" style={{ animationDelay: '0.5s' }}></div>
          </div>
        </div>
      </section>

      {/* Dynamic Categories Section */}
      {categories.length > 0 && (
        <section className="py-20 relative">
          <div className="absolute inset-0 glass"></div>
          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-black gradient-text mb-8">
                Kategorilerimiz
              </h2>
              <p className="text-xl dark:text-gray-300 light:text-gray-700 text-gray-700 max-w-3xl mx-auto">
                Geniş ürün yelpazemizi keşfedin
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categories.map((category, index) => {
                const getGradientClass = (index) => {
                  const gradients = [
                    'bg-gradient-primary',
                    'bg-gradient-secondary', 
                    'bg-gradient-accent',
                    'bg-gradient-to-r from-green-400 to-blue-500',
                    'bg-gradient-to-r from-purple-400 to-pink-500',
                    'bg-gradient-to-r from-yellow-400 to-red-500'
                  ];
                  return gradients[index % gradients.length];
                };

              return (
                  <Link 
                    key={category.id} 
                    to={`/products?category=${category.name}`}
                    className="group block"
                  >
                    <div className={`${getGradientClass(index)} p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group-hover:scale-105`}>
                      <div className="text-center">
                        <div className="text-6xl mb-4 opacity-80">
                          {category.name === 'iPhone' ? '📱' : 
                           category.name === 'iPad' ? '💻' : 
                           category.name === 'Mac' ? '🖥️' : 
                           category.name === 'Apple Watch' ? '⌚' : 
                           category.name === 'AirPods' ? '🎧' : '📦'}
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">
                          {category.name}
                        </h3>
                        <p className="text-white opacity-80 text-sm">
                          {category.description || 'Kategoriyi keşfedin'}
                        </p>
                      </div>
                    </div>
                      </Link>
              );
            })}
                 </div>
               </div>
      </section>
      )}
    </div>
  );
};

export default Home; 