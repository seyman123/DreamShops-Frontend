import React, { useState } from 'react';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [showAlert, setShowAlert] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Form gönderme işlemi burada yapılacak
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 5000);
    
    // Formu temizle
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  const contactInfo = [
    {
      icon: <FaPhone />,
      title: "Telefon",
      info: "+90 (555) 106 7814",
      subInfo: "Pazartesi - Cuma: 09:00 - 18:00",
      color: "text-primary-500"
    },
    {
      icon: <FaEnvelope />,
      title: "E-posta",
      info: "seyman@gmail.com",
      subInfo: "24 saat içinde yanıt veriyoruz",
      color: "text-accent-500"
    },
    {
      icon: <FaMapMarkerAlt />,
      title: "Adres",
      info: "Bahçelievler Mahallesi, KYK Erkek Öğrenci Yurdu",
      subInfo: "Gölbaşı/Ankara",
      color: "text-secondary-500"
    },
    {
      icon: <FaClock />,
      title: "Çalışma Saatleri",
      info: "Pazartesi - Cuma: 09:00 - 18:00",
      subInfo: "Cumartesi: 10:00 - 16:00",
      color: "text-warning-500"
    }
  ];

  const socialLinks = [
    { icon: <FaFacebook />, name: "Facebook", url: "#", color: "hover:text-blue-500" },
    { icon: <FaTwitter />, name: "Twitter", url: "#", color: "hover:text-blue-400" },
    { icon: <FaInstagram />, name: "Instagram", url: "#", color: "hover:text-pink-500" },
    { icon: <FaLinkedin />, name: "LinkedIn", url: "#", color: "hover:text-blue-600" }
  ];

  return (
    <div className="min-h-screen dark:bg-gradient-dark light:bg-gradient-light bg-gradient-light relative overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/5 left-1/5 w-96 h-96 bg-primary-500 rounded-full opacity-15 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/5 right-1/5 w-96 h-96 bg-secondary-500 rounded-full opacity-15 blur-3xl animate-pulse animation-delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-20 relative z-10">
        {/* Header */}
        <div className="text-center mb-20 animate-fade-in">
          <h1 className="text-5xl lg:text-7xl font-black gradient-text mb-8">İletişim</h1>
          <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-4xl mx-auto">
            Sorularınız, önerileriniz veya destek talepleriniz için bizimle iletişime geçin.
            Size yardımcı olmaktan mutluluk duyarız!
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-20">
          {contactInfo.map((info, index) => (
            <div 
              key={index} 
              className="glass p-8 rounded-2xl border border-white border-opacity-20 text-center hover:-translate-y-2 hover:shadow-xl hover:shadow-primary-500/20 transition-all duration-300 group animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`text-5xl ${info.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {info.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{info.title}</h3>
              <p className="text-gray-200 text-lg font-medium mb-2">{info.info}</p>
              <p className="text-gray-400 text-sm">{info.subInfo}</p>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="glass p-8 lg:p-12 rounded-3xl border border-white border-opacity-20 hover:shadow-xl hover:shadow-primary-500/20 transition-all duration-300">
              <h3 className="text-3xl font-bold gradient-text-primary mb-8 flex items-center">
                <span className="text-4xl mr-3">📝</span>
                Bize Mesaj Gönderin
              </h3>
              
              {showAlert && (
                <div className="bg-success-500 bg-opacity-20 border border-success-500 rounded-xl p-4 mb-8 animate-fade-in">
                  <div className="flex items-center">
                    <div className="text-success-400 text-xl mr-3">✓</div>
                    <div>
                      <p className="text-success-300 font-semibold">Teşekkürler!</p>
                      <p className="text-success-200 text-sm">Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white font-medium mb-2">Ad Soyad *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Adınızı ve soyadınızı girin"
                      required
                      className="w-full px-4 py-4 rounded-xl glass border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-medium mb-2">E-posta *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="E-posta adresinizi girin"
                      required
                      className="w-full px-4 py-4 rounded-xl glass border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-white font-medium mb-2">Konu</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Mesajınızın konusunu belirtin"
                    className="w-full px-4 py-4 rounded-xl glass border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                
                <div>
                  <label className="block text-white font-medium mb-2">Mesaj *</label>
                  <textarea
                    rows={6}
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Mesajınızı buraya yazın..."
                    required
                    className="w-full px-4 py-4 rounded-xl glass border border-white border-opacity-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 resize-none"
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="btn-gradient px-8 py-4 rounded-xl font-semibold text-lg w-full md:w-auto hover:scale-105 transition-transform duration-300"
                >
                  Mesajı Gönder
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Map Card */}
            <div className="glass p-8 rounded-2xl border border-white border-opacity-20 hover:-translate-y-2 hover:shadow-xl hover:shadow-secondary-500/20 transition-all duration-300">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="text-3xl mr-3">📍</span>
                Konumumuz
              </h3>
              <div className="text-center py-12 rounded-xl bg-gradient-secondary bg-opacity-20 border border-secondary-500 border-opacity-30">
                <FaMapMarkerAlt size={60} className="text-secondary-400 mx-auto mb-4" />
                <div className="text-white space-y-2">
                  <p className="font-bold text-lg">iPhone X Mağaza</p>
                  <p className="text-gray-300">Bahçelievler Mahallesi</p>
                  <p className="text-gray-300">KYK Erkek Öğrenci Yurdu</p>
                  <p className="text-gray-300">Gölbaşı/Ankara</p>
                </div>
                <button className="mt-6 border border-secondary-400 text-secondary-400 hover:bg-secondary-400 hover:text-white px-6 py-2 rounded-lg transition-all duration-300">
                  Haritada Görüntüle
                </button>
              </div>
            </div>

            {/* Social Media */}
            <div className="glass p-8 rounded-2xl border border-white border-opacity-20 hover:-translate-y-2 hover:shadow-xl hover:shadow-accent-500/20 transition-all duration-300">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="text-3xl mr-3">🌐</span>
                Sosyal Medya
              </h3>
              <p className="text-gray-300 mb-6">
                Sosyal medya hesaplarımızdan bizi takip edin ve en son haberleri kaçırmayın!
              </p>
              <div className="grid grid-cols-2 gap-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    className={`flex items-center justify-center p-4 rounded-xl glass border border-white border-opacity-20 text-gray-300 ${social.color} transition-all duration-300 hover:scale-105 hover:shadow-lg group`}
                  >
                    <span className="text-2xl mr-3 group-hover:scale-110 transition-transform duration-300">
                      {social.icon}
                    </span>
                    <span className="font-medium">{social.name}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div className="glass p-8 rounded-2xl border border-white border-opacity-20 hover:-translate-y-2 hover:shadow-xl hover:shadow-warning-500/20 transition-all duration-300">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="text-3xl mr-3">❓</span>
                Sık Sorulan Sorular
              </h3>
              <div className="space-y-4">
                <div className="border-b border-gray-600 pb-4">
                  <h4 className="text-white font-medium mb-2">Teslimat süresi ne kadar?</h4>
                  <p className="text-gray-400 text-sm">Siparişleriniz 1-3 iş günü içinde kargoya verilir.</p>
                </div>
                <div className="border-b border-gray-600 pb-4">
                  <h4 className="text-white font-medium mb-2">İade koşulları nelerdir?</h4>
                  <p className="text-gray-400 text-sm">14 gün içinde koşulsuz iade hakkınız bulunmaktadır.</p>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-2">Garantili ürün mü?</h4>
                  <p className="text-gray-400 text-sm">Tüm ürünlerimiz orijinal ve Apple garantili.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 