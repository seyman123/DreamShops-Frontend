import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaExclamationTriangle, FaEye, FaEyeSlash, FaCheck, FaTimes } from 'react-icons/fa';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';
import Validator from '../utils/validation';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState(null);
  const navigate = useNavigate();

  // Enhanced validation using utility
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'firstName':
        const firstNameResult = Validator.validateName(value, 'Ad');
        if (!firstNameResult.isValid) {
          newErrors.firstName = firstNameResult.errors[0];
        } else {
          delete newErrors.firstName;
        }
        break;
      case 'lastName':
        const lastNameResult = Validator.validateName(value, 'Soyad');
        if (!lastNameResult.isValid) {
          newErrors.lastName = lastNameResult.errors[0];
        } else {
          delete newErrors.lastName;
        }
        break;
      case 'email':
        const emailResult = Validator.validateEmail(value);
        if (!emailResult.isValid) {
          newErrors.email = emailResult.errors[0];
        } else {
          delete newErrors.email;
        }
        break;
      case 'password':
        const passwordResult = Validator.validatePassword(value, true);
        setPasswordValidation(passwordResult);
        if (!passwordResult.isValid) {
          newErrors.password = passwordResult.errors[0];
        } else {
          delete newErrors.password;
        }
        // Also re-validate confirm password if it exists
        if (formData.confirmPassword) {
          if (value !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Şifreler eşleşmiyor';
          } else {
            delete newErrors.confirmPassword;
          }
        }
        break;
      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = 'Şifre doğrulama gerekli';
        } else if (value !== formData.password) {
          newErrors.confirmPassword = 'Şifreler eşleşmiyor';
        } else {
          delete newErrors.confirmPassword;
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
    
    // Also validate confirmPassword if password changes
    if (name === 'password' && touched.confirmPassword) {
      validateField('confirmPassword', formData.confirmPassword);
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
    const firstNameValid = validateField('firstName', formData.firstName);
    const lastNameValid = validateField('lastName', formData.lastName);
    const emailValid = validateField('email', formData.email);
    const passwordValid = validateField('password', formData.password);
    const confirmPasswordValid = validateField('confirmPassword', formData.confirmPassword);
    
    setTouched({ 
      firstName: true, 
      lastName: true, 
      email: true, 
      password: true, 
      confirmPassword: true 
    });
    
    return firstNameValid && lastNameValid && emailValid && passwordValid && confirmPasswordValid;
  };

  const getErrorMessage = (error) => {
    const errorMessage = error.message || error.toString();
    
    // Backend'den gelen hata mesajlarını Türkçe'ye çevir
    if (errorMessage.includes('already exists') || errorMessage.includes('already registered')) {
      return 'Bu e-posta adresi ile zaten kayıtlı bir hesap var.';
    } else if (errorMessage.includes('Invalid email')) {
      return 'Geçersiz e-posta adresi formatı.';
    } else if (errorMessage.includes('Password too weak')) {
      return 'Şifre çok zayıf. Daha güçlü bir şifre seçin.';
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
    
    if (!validateForm()) {
      toast.error('Lütfen tüm alanları doğru şekilde doldurun');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await authAPI.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      });
      
      toast.success('Kayıt başarılı! Giriş yapabilirsiniz. 🎉');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      const userFriendlyMessage = getErrorMessage(error);
      toast.error(userFriendlyMessage);
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

      {/* Register Form */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="glass p-8 lg:p-12 rounded-3xl border border-white border-opacity-20 shadow-glass backdrop-blur-lg animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-4xl lg:text-5xl font-black gradient-text mb-4">
              Hesap Oluştur
            </h1>
            <p className="text-gray-300 text-lg">
              Topluluğumuza bugün katılın
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white font-medium mb-2">
                  <FaUser className="inline mr-2" />
                  Ad
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Adınızı girin"
                    required
                    className={`w-full px-4 py-4 rounded-xl glass border ${
                      touched.firstName && errors.firstName 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-white border-opacity-20 focus:ring-primary-500'
                    } text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300`}
                  />
                  {touched.firstName && errors.firstName && (
                    <FaExclamationTriangle className="absolute right-4 top-1/2 transform -translate-y-1/2 text-red-500" />
                  )}
                </div>
                {touched.firstName && errors.firstName && (
                  <div className="flex items-center mt-2 text-red-400 text-sm">
                    <FaExclamationTriangle className="mr-2 text-xs" />
                    {errors.firstName}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-white font-medium mb-2">
                  <FaUser className="inline mr-2" />
                  Soyad
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Soyadınızı girin"
                    required
                    className={`w-full px-4 py-4 rounded-xl glass border ${
                      touched.lastName && errors.lastName 
                        ? 'border-red-500 focus:ring-red-500' 
                        : 'border-white border-opacity-20 focus:ring-primary-500'
                    } text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300`}
                  />
                  {touched.lastName && errors.lastName && (
                    <FaExclamationTriangle className="absolute right-4 top-1/2 transform -translate-y-1/2 text-red-500" />
                  )}
                </div>
                {touched.lastName && errors.lastName && (
                  <div className="flex items-center mt-2 text-red-400 text-sm">
                    <FaExclamationTriangle className="mr-2 text-xs" />
                    {errors.lastName}
                  </div>
                )}
              </div>
            </div>

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
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Güçlü bir şifre seçin"
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

            <div>
              <label className="block text-white font-medium mb-2">
                <FaLock className="inline mr-2" />
                Şifre Doğrulama
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Şifrenizi tekrar girin"
                  required
                  className={`w-full px-4 py-4 pr-12 rounded-xl glass border ${
                    touched.confirmPassword && errors.confirmPassword 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-white border-opacity-20 focus:ring-primary-500'
                  } text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                {touched.confirmPassword && errors.confirmPassword && (
                  <FaExclamationTriangle className="absolute right-12 top-1/2 transform -translate-y-1/2 text-red-500" />
                )}
              </div>
              {touched.confirmPassword && errors.confirmPassword && (
                <div className="flex items-center mt-2 text-red-400 text-sm">
                  <FaExclamationTriangle className="mr-2 text-xs" />
                  {errors.confirmPassword}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || Object.keys(errors).length > 0}
              className="w-full btn-gradient py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-3"></div>
                  Hesap oluşturuluyor...
                </div>
              ) : (
                'Kayıt Ol'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white border-opacity-20 text-center">
            <p className="text-gray-300">
              Zaten hesabınız var mı?{' '}
              <Link 
                to="/login" 
                className="text-primary-400 hover:text-primary-300 font-semibold transition-colors duration-200 hover:underline"
              >
                Giriş Yap
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            Kayıt olarak{' '}
            <Link to="/terms" className="text-primary-400 hover:text-primary-300 transition-colors duration-200">
              Kullanım Şartları
            </Link>
            {' '}ve{' '}
            <Link to="/privacy" className="text-primary-400 hover:text-primary-300 transition-colors duration-200">
              Gizlilik Politikası
            </Link>
            'nı kabul etmiş olursunuz.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register; 