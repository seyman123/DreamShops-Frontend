import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaExclamationTriangle, FaEnvelope, FaLock } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  // Validation rules
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'email':
        if (!value) {
          newErrors.email = 'E-posta adresi gerekli';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Geçerli bir e-posta adresi girin';
        } else {
          delete newErrors.email;
        }
        break;
      case 'password':
        if (!value) {
          newErrors.password = 'Şifre gerekli';
        } else if (value.length < 6) {
          newErrors.password = 'Şifre en az 6 karakter olmalı';
        } else {
          delete newErrors.password;
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Real-time validation if field has been touched
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({
      ...touched,
      [name]: true
    });
    validateField(name, value);
  };

  const validateForm = () => {
    const emailValid = validateField('email', formData.email);
    const passwordValid = validateField('password', formData.password);
    
    setTouched({ email: true, password: true });
    
    return emailValid && passwordValid;
  };

  const getErrorMessage = (error) => {
    const errorMessage = error.message || error.toString();
    
    // Backend'den gelen hata mesajlarını Türkçe'ye çevir
    if (errorMessage.includes('Invalid email or password') || 
        errorMessage.includes('Bad credentials') ||
        errorMessage.includes('401')) {
      return 'E-posta adresi veya şifre hatalı. Lütfen kontrol edin.';
    } else if (errorMessage.includes('User not found') || errorMessage.includes('404')) {
      return 'Bu e-posta adresi ile kayıtlı bir kullanıcı bulunamadı.';
    } else if (errorMessage.includes('Account is locked') || errorMessage.includes('locked')) {
      return 'Hesabınız geçici olarak kilitlenmiş. Lütfen daha sonra tekrar deneyin.';
    } else if (errorMessage.includes('Account is disabled') || errorMessage.includes('disabled')) {
      return 'Hesabınız deaktive edilmiş. Destek ekibi ile iletişime geçin.';
    } else if (errorMessage.includes('Too many attempts') || errorMessage.includes('rate limit')) {
      return 'Çok fazla başarısız deneme. Lütfen 15 dakika sonra tekrar deneyin.';
    } else if (errorMessage.includes('Network Error') || errorMessage.includes('ERR_NETWORK')) {
      return 'Bağlantı hatası. İnternet bağlantınızı kontrol edin.';
    } else if (errorMessage.includes('timeout')) {
      return 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.';
    } else if (errorMessage.includes('500')) {
      return 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
    }
    
    return errorMessage;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!validateForm()) {
      toast.error('Lütfen tüm alanları doğru şekilde doldurun');
      return;
    }

    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      toast.success('Giriş başarılı! Hoş geldiniz! 🎉');
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      const userFriendlyMessage = getErrorMessage(error);
      toast.error(userFriendlyMessage);
      
      // Backend'den hata geldiğinde form alanlarını da hatalı olarak işaretle
      if (userFriendlyMessage.includes('şifre hatalı') || 
          userFriendlyMessage.includes('Invalid email or password') ||
          userFriendlyMessage.includes('Bad credentials')) {
        // Email ve şifre alanlarını hatalı olarak işaretle
        setTouched(prev => ({ ...prev, password: true, email: true }));
        setErrors({
          email: 'E-posta adresi veya şifre hatalı',
          password: 'E-posta adresi veya şifre hatalı'
        });
      } else if (userFriendlyMessage.includes('kullanıcı bulunamadı')) {
        // Sadece email alanını hatalı işaretle
        setTouched(prev => ({ ...prev, email: true }));
        setErrors({
          email: 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen dark:bg-gradient-dark light:bg-gradient-light bg-gradient-light relative overflow-hidden flex items-center justify-center">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/5 left-1/5 w-96 h-96 bg-primary-500 rounded-full opacity-15 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/5 right-1/5 w-96 h-96 bg-secondary-500 rounded-full opacity-15 blur-3xl animate-pulse animation-delay-1000"></div>
        <div className="absolute top-3/5 left-1/3 w-64 h-64 bg-accent-500 rounded-full opacity-10 blur-3xl animate-pulse animation-delay-2000"></div>
      </div>

      {/* Floating Particles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full opacity-30 animate-float"></div>
        <div className="absolute top-3/4 left-3/4 w-3 h-3 bg-primary-400 rounded-full opacity-40 animate-float animation-delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-secondary-400 rounded-full opacity-50 animate-float animation-delay-2000"></div>
      </div>

      {/* Login Form */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="glass p-8 lg:p-12 rounded-3xl border border-white border-opacity-20 shadow-glass backdrop-blur-lg animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-4xl lg:text-5xl font-black gradient-text mb-4">
              Tekrar Hoş Geldiniz
            </h1>
            <p className="text-gray-300 text-lg">
              Hesabınıza giriş yapın
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-white font-medium mb-2">
                <FaEnvelope className="inline mr-2" />
                E-posta Adresi
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="ornek@email.com"
                  required
                  className={`w-full px-4 py-4 rounded-xl glass border ${
                    touched.email && errors.email 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-white border-opacity-20 focus:ring-primary-500'
                  } text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300`}
                />
                {touched.email && errors.email && (
                  <FaExclamationTriangle className="absolute right-4 top-1/2 transform -translate-y-1/2 text-red-500" />
                )}
              </div>
              {touched.email && errors.email && (
                <div className="flex items-center mt-2 text-red-400 text-sm">
                  <FaExclamationTriangle className="mr-2 text-xs" />
                  {errors.email}
                </div>
              )}
            </div>

            <div>
              <label className="block text-white font-medium mb-2">
                <FaLock className="inline mr-2" />
                Şifre
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Şifrenizi girin"
                  required
                  className={`w-full px-4 py-4 pr-12 rounded-xl glass border ${
                    touched.password && errors.password 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-white border-opacity-20 focus:ring-primary-500'
                  } text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                {touched.password && errors.password && (
                  <FaExclamationTriangle className="absolute right-12 top-1/2 transform -translate-y-1/2 text-red-500" />
                )}
              </div>
              {touched.password && errors.password && (
                <div className="flex items-center mt-2 text-red-400 text-sm">
                  <FaExclamationTriangle className="mr-2 text-xs" />
                  {errors.password}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-primary-500 bg-transparent border border-white border-opacity-20 rounded focus:ring-primary-500 focus:ring-2"
                />
                <span className="ml-2 text-sm">Beni hatırla</span>
              </label>
              <Link 
                to="/forgot-password" 
                className="text-sm text-primary-400 hover:text-primary-300 transition-colors duration-200"
              >
                Şifremi unuttum
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading || Object.keys(errors).length > 0}
              className="w-full btn-gradient py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-3"></div>
                  Giriş yapılıyor...
                </div>
              ) : (
                'Giriş Yap'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white border-opacity-20 text-center">
            <p className="text-gray-300">
              Hesabınız yok mu?{' '}
              <Link 
                to="/register" 
                className="text-primary-400 hover:text-primary-300 font-semibold transition-colors duration-200 hover:underline"
              >
                Kayıt Ol
              </Link>
            </p>
          </div>

          {/* Social Login */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white border-opacity-20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-transparent text-gray-400">veya devam edin</span>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button className="w-full inline-flex justify-center py-3 px-4 rounded-xl border border-white border-opacity-20 glass text-sm font-medium text-white hover:bg-white hover:bg-opacity-10 transition-all duration-300">
                <span>Google</span>
              </button>
              <button className="w-full inline-flex justify-center py-3 px-4 rounded-xl border border-white border-opacity-20 glass text-sm font-medium text-white hover:bg-white hover:bg-opacity-10 transition-all duration-300">
                <span>Apple</span>
              </button>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            Endüstri standardı güvenlik protokolleri ile korunmaktadır
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 