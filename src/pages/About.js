import React from 'react';
import { FaRocket, FaHeart, FaUsers, FaAward } from 'react-icons/fa';

const About = () => {
  return (
    <div className="min-h-screen dark:bg-gradient-dark light:bg-gradient-light bg-gradient-light relative overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/5 left-1/5 w-96 h-96 bg-primary-500 rounded-full opacity-15 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/5 right-1/5 w-96 h-96 bg-secondary-500 rounded-full opacity-15 blur-3xl animate-pulse animation-delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-20 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-20 animate-fade-in">
          <h1 className="text-5xl lg:text-7xl font-black gradient-text mb-8">Hakkımızda</h1>
          <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-4xl mx-auto">
            iPhone X ile teknolojinin geleceğini bugünden yaşayın. 
            Kalite, güven ve müşteri memnuniyeti odaklı hizmet anlayışımızla yanınızdayız.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid lg:grid-cols-2 gap-16 mb-20 items-center">
          <div className="animate-slide-up">
            <h2 className="text-4xl font-bold gradient-text-secondary mb-8">Hikayemiz</h2>
            <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
              <p>
                2020 yılında teknoloji tutkusu ile başlayan yolculuğumuzda, müşterilerimize 
                en kaliteli Apple ürünlerini en uygun fiyatlarla sunma hedefiyle yola çıktık.
              </p>
              <p>
                Bugün binlerce mutlu müşterimizle, Türkiye'nin önde gelen teknoloji 
                e-ticaret platformlarından biri haline geldik. Her geçen gün büyüyen 
                ailemize katılmaktan gurur duyuyoruz.
              </p>
            </div>
          </div>
          <div className="flex justify-center animate-fade-in">
            <div className="glass p-12 rounded-3xl border border-white border-opacity-20 text-center hover:-translate-y-2 transition-all duration-300">
              <FaRocket size={80} className="text-primary-500 mx-auto mb-6" />
              <h4 className="text-3xl font-bold text-white">İnovasyon</h4>
              <p className="text-gray-300 mt-4">Geleceği bugün yaşatıyoruz</p>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <h2 className="text-4xl lg:text-5xl font-black gradient-text text-center mb-16">Değerlerimiz</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="glass p-8 rounded-2xl border border-white border-opacity-20 text-center hover:-translate-y-2 hover:shadow-xl hover:shadow-primary-500/20 transition-all duration-300 group">
              <FaHeart size={48} className="text-primary-500 mx-auto mb-6 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl font-bold text-white mb-4">Müşteri Odaklılık</h3>
              <p className="text-gray-300 leading-relaxed">
                Müşteri memnuniyeti bizim için her şeyden önce gelir. 
                7/24 destek hizmetimizle yanınızdayız.
              </p>
            </div>

            <div className="glass p-8 rounded-2xl border border-white border-opacity-20 text-center hover:-translate-y-2 hover:shadow-xl hover:shadow-accent-500/20 transition-all duration-300 group">
              <FaAward size={48} className="text-accent-500 mx-auto mb-6 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl font-bold text-white mb-4">Kalite Garantisi</h3>
              <p className="text-gray-300 leading-relaxed">
                Sadece orijinal ve garantili ürünler satıyoruz. 
                Kaliteden asla ödün vermeyiz.
              </p>
            </div>

            <div className="glass p-8 rounded-2xl border border-white border-opacity-20 text-center hover:-translate-y-2 hover:shadow-xl hover:shadow-secondary-500/20 transition-all duration-300 group">
              <FaUsers size={48} className="text-secondary-500 mx-auto mb-6 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl font-bold text-white mb-4">Güvenilirlik</h3>
              <p className="text-gray-300 leading-relaxed">
                Güvenli ödeme sistemleri ve hızlı teslimat ile 
                güveninizi kazanmaya devam ediyoruz.
              </p>
            </div>

            <div className="glass p-8 rounded-2xl border border-white border-opacity-20 text-center hover:-translate-y-2 hover:shadow-xl hover:shadow-warning-500/20 transition-all duration-300 group">
              <FaRocket size={48} className="text-warning-500 mx-auto mb-6 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl font-bold text-white mb-4">İnovasyon</h3>
              <p className="text-gray-300 leading-relaxed">
                Teknolojinin son gelişmelerini takip ederek 
                size en yeni ürünleri sunuyoruz.
              </p>
            </div>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          <div className="glass p-10 rounded-2xl border border-white border-opacity-20 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary-500/20 transition-all duration-300">
            <h3 className="text-3xl font-bold gradient-text-primary mb-6">Misyonumuz</h3>
            <p className="text-lg text-gray-300 leading-relaxed">
              Teknoloji severlere en kaliteli Apple ürünlerini en uygun fiyatlarla 
              sunarak, dijital yaşamlarını kolaylaştırmak ve zenginleştirmek.
            </p>
          </div>
          
          <div className="glass p-10 rounded-2xl border border-white border-opacity-20 hover:-translate-y-2 hover:shadow-xl hover:shadow-secondary-500/20 transition-all duration-300">
            <h3 className="text-3xl font-bold gradient-text-secondary mb-6">Vizyonumuz</h3>
            <p className="text-lg text-gray-300 leading-relaxed">
              Türkiye'nin en güvenilir ve tercih edilen teknoloji e-ticaret 
              platformu olmak, müşteri memnuniyetinde sektör lideri konumunu korumak.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="relative">
          <div className="absolute inset-0 glass-dark rounded-3xl"></div>
          <div className="relative z-10 p-12">
            <h2 className="text-4xl font-bold gradient-text text-center mb-12">Rakamlarla Biz</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              <div className="group">
                <h3 className="text-4xl lg:text-6xl font-black gradient-text-primary group-hover:scale-110 transition-transform duration-300">10K+</h3>
                <p className="text-xl text-gray-300 mt-2">Mutlu Müşteri</p>
              </div>
              <div className="group">
                <h3 className="text-4xl lg:text-6xl font-black gradient-text-accent group-hover:scale-110 transition-transform duration-300">500+</h3>
                <p className="text-xl text-gray-300 mt-2">Ürün Çeşidi</p>
              </div>
              <div className="group">
                <h3 className="text-4xl lg:text-6xl font-black gradient-text-secondary group-hover:scale-110 transition-transform duration-300">99%</h3>
                <p className="text-xl text-gray-300 mt-2">Müşteri Memnuniyeti</p>
              </div>
              <div className="group">
                <h3 className="text-4xl lg:text-6xl font-black text-yellow-400 group-hover:scale-110 transition-transform duration-300">24/7</h3>
                <p className="text-xl text-gray-300 mt-2">Destek Hizmeti</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 