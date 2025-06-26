import React, { useState } from 'react';
import { FaCalendar, FaUser, FaSearch, FaEye } from 'react-icons/fa';

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Örnek blog yazıları
  const blogPosts = [
    {
      id: 1,
      title: "iPhone 15 Pro Max İncelemesi: Titanium Çağı Başlıyor",
      excerpt: "Apple'ın en yeni amiral gemisi iPhone 15 Pro Max'i detaylı olarak inceledik. Titanium kasası, A17 Pro çipi ve gelişmiş kamera sistemi...",
      category: "İnceleme",
      author: "Tech Editor",
      date: "2024-01-15",
      readTime: "8 dk",
      views: 1250,
      image: "iphone-15-pro",
      featured: true
    },
    {
      id: 2,
      title: "2024'te Hangi iPad Modelini Almalısınız?",
      excerpt: "iPad Air, iPad Pro, iPad mini... Hangi model sizin için en uygun? Tüm modelleri karşılaştırdık ve önerilerimizi sunduk.",
      category: "Rehber",
      author: "Apple Uzmanı",
      date: "2024-01-12",
      readTime: "6 dk",
      views: 890,
      image: "ipad-comparison"
    },
    {
      id: 3,
      title: "MacBook Air M3 vs MacBook Pro M3: Hangisi Daha İyi?",
      excerpt: "Apple'ın M3 çipli yeni MacBook'larını karşılaştırdık. Performans, fiyat ve kullanım senaryoları açısından detaylı analiz.",
      category: "Karşılaştırma",
      author: "Mac Uzmanı",
      date: "2024-01-10",
      readTime: "10 dk",
      views: 2100,
      image: "macbook-comparison"
    },
    {
      id: 4,
      title: "Apple Watch Series 9'un Gizli Özellikleri",
      excerpt: "Apple Watch Series 9'da keşfetmediğiniz özellikler var mı? İşte size hayatınızı kolaylaştıracak ipuçları ve püf noktaları.",
      category: "İpuçları",
      author: "Wearable Editörü",
      date: "2024-01-08",
      readTime: "5 dk",
      views: 650,
      image: "apple-watch-tips"
    },
    {
      id: 5,
      title: "AirPods Pro 2 ile Mükemmel Ses Deneyimi",
      excerpt: "Spatial Audio, Adaptive Transparency ve gelişmiş noise cancellation özellikleri ile AirPods Pro 2'yi maksimum verimle kullanın.",
      category: "İpuçları",
      author: "Audio Uzmanı",
      date: "2024-01-05",
      readTime: "7 dk",
      views: 1100,
      image: "airpods-pro-2"
    },
    {
      id: 6,
      title: "iOS 17.3 Güncellemesi: Yeni Özellikler ve İyileştirmeler",
      excerpt: "Apple'ın en son iOS güncellemesi ile gelen yenilikler, güvenlik iyileştirmeleri ve performans artışları hakkında her şey.",
      category: "Güncelleme",
      author: "iOS Editörü",
      date: "2024-01-03",
      readTime: "4 dk",
      views: 1800,
      image: "ios-17-3"
    }
  ];

  const categories = ['all', 'İnceleme', 'Rehber', 'Karşılaştırma', 'İpuçları', 'Güncelleme'];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPost = blogPosts.find(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  const getImagePlaceholder = (imageKey) => {
    const gradients = {
      'iphone-15-pro': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'ipad-comparison': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'macbook-comparison': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'apple-watch-tips': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'airpods-pro-2': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'ios-17-3': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    };
    return gradients[imageKey] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'İnceleme': 'bg-primary-500',
      'Rehber': 'bg-accent-500',
      'Karşılaştırma': 'bg-secondary-500',
      'İpuçları': 'bg-warning-500',
      'Güncelleme': 'bg-success-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen dark:bg-gradient-dark light:bg-gradient-light bg-gradient-light relative overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/5 left-1/5 w-96 h-96 bg-primary-500 rounded-full opacity-15 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/5 right-1/5 w-96 h-96 bg-secondary-500 rounded-full opacity-15 blur-3xl animate-pulse animation-delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-20 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-5xl lg:text-7xl font-black gradient-text mb-8">Tech Blog</h1>
          <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
            Apple dünyasından son haberler, detaylı incelemeler ve uzman tavsiyeleri
          </p>
        </div>

        {/* Search and Filter */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="md:col-span-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Blog yazılarında ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 rounded-xl glass border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-500 hover:text-primary-400 transition-colors duration-200">
                <FaSearch size={20} />
              </button>
            </div>
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-6 py-4 rounded-xl glass border border-white border-opacity-20 text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
            >
              {categories.map(category => (
                <option key={category} value={category} className="bg-gray-800 text-white">
                  {category === 'all' ? 'Tüm Kategoriler' : category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Featured Post */}
        {featuredPost && selectedCategory === 'all' && !searchTerm && (
          <div className="mb-16">
            <div className="glass rounded-3xl border border-white border-opacity-20 overflow-hidden hover:-translate-y-2 hover:shadow-xl hover:shadow-primary-500/20 transition-all duration-300 group">
              <div 
                className="h-64 lg:h-80 relative"
                style={{ background: getImagePlaceholder(featuredPost.image) }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-all duration-300"></div>
                <div className="absolute top-6 left-6">
                  <span className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Öne Çıkan
                  </span>
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-4 text-white text-sm mb-4">
                    <span className={`${getCategoryColor(featuredPost.category)} px-3 py-1 rounded-full text-xs font-semibold`}>
                      {featuredPost.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaUser size={12} /> {featuredPost.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaCalendar size={12} /> {new Date(featuredPost.date).toLocaleDateString('tr-TR')}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaEye size={12} /> {featuredPost.views}
                    </span>
                  </div>
                  <h2 className="text-2xl lg:text-4xl font-bold text-white mb-4 group-hover:text-primary-300 transition-colors duration-300">
                    {featuredPost.title}
                  </h2>
                  <p className="text-gray-200 text-lg leading-relaxed mb-6">
                    {featuredPost.excerpt}
                  </p>
                  <div className="flex justify-between items-center">
                    <button className="btn-gradient px-8 py-3 rounded-xl font-semibold">
                      Devamını Oku
                    </button>
                    <span className="text-gray-300">{featuredPost.readTime} okuma</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {regularPosts.map((post, index) => (
            <div 
              key={post.id} 
              className="glass rounded-2xl border border-white border-opacity-20 overflow-hidden hover:-translate-y-2 hover:shadow-xl hover:shadow-primary-500/20 transition-all duration-300 group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div 
                className="h-48 relative"
                style={{ background: getImagePlaceholder(post.image) }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-all duration-300"></div>
                <div className="absolute top-4 left-4">
                  <span className={`${getCategoryColor(post.category)} text-white px-3 py-1 rounded-full text-xs font-semibold`}>
                    {post.category}
                  </span>
                </div>
              </div>
              
              <div className="p-6 flex flex-col h-64">
                <div className="flex items-center gap-3 text-gray-400 text-sm mb-3">
                  <span className="flex items-center gap-1">
                    <FaUser size={12} /> {post.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaCalendar size={12} /> {new Date(post.date).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary-300 transition-colors duration-300 line-clamp-2">
                  {post.title}
                </h3>
                
                <p className="text-gray-300 leading-relaxed mb-6 flex-grow line-clamp-3">
                  {post.excerpt}
                </p>
                
                <div className="flex justify-between items-center mt-auto">
                  <button className="text-primary-400 hover:text-primary-300 font-semibold transition-colors duration-200">
                    Oku →
                  </button>
                  <div className="flex items-center gap-4 text-gray-400 text-sm">
                    <span className="flex items-center gap-1">
                      <FaEye size={12} /> {post.views}
                    </span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-20">
            <div className="glass p-12 rounded-3xl border border-white border-opacity-20 max-w-lg mx-auto">
              <h3 className="text-2xl font-bold text-white mb-4">Sonuç Bulunamadı</h3>
              <p className="text-gray-300 mb-6">
                Aradığınız kriterlere uygun blog yazısı bulunamadı. 
                Farklı anahtar kelimeler veya kategoriler deneyebilirsiniz.
              </p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="btn-gradient px-6 py-3 rounded-xl font-semibold"
              >
                Filtreleri Temizle
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog; 