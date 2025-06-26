// Frontend validation utility with Turkish messages
class Validator {
  
  // Email validation
  static validateEmail(email) {
    const errors = [];
    
    if (!email || email.trim() === '') {
      errors.push('E-posta adresi gereklidir');
      return { isValid: false, errors };
    }
    
    const emailTrimmed = email.trim();
    
    // Basic email format regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      errors.push('Geçerli bir e-posta adresi girin');
    }
    
    // Length check
    if (emailTrimmed.length > 100) {
      errors.push('E-posta adresi çok uzun (max 100 karakter)');
    }
    
    // Common domain typos
    const commonTypos = {
      'gmai.com': 'gmail.com',
      'gmial.com': 'gmail.com',
      'yahooo.com': 'yahoo.com',
      'hotmial.com': 'hotmail.com'
    };
    
    const domain = emailTrimmed.split('@')[1];
    if (domain && commonTypos[domain]) {
      errors.push(`"${commonTypos[domain]}" yazmak istediniz mi?`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitized: emailTrimmed.toLowerCase()
    };
  }
  
  // Password validation
  static validatePassword(password, isRegister = false) {
    const errors = [];
    
    if (!password) {
      errors.push('Şifre gereklidir');
      return { isValid: false, errors };
    }
    
    // For login, just check if not empty
    if (!isRegister) {
      return {
        isValid: password.length > 0,
        errors: password.length === 0 ? ['Şifre gereklidir'] : [],
        strength: 'unknown'
      };
    }
    
    // For register, check strength
    let strength = 0;
    const requirements = [];
    
    // Length check
    if (password.length < 6) {
      errors.push('Şifre en az 6 karakter olmalıdır');
      requirements.push({ text: 'En az 6 karakter', met: false });
    } else {
      requirements.push({ text: 'En az 6 karakter', met: true });
      strength++;
    }
    
    // Uppercase check
    if (!/[A-Z]/.test(password)) {
      requirements.push({ text: 'En az 1 büyük harf', met: false });
    } else {
      requirements.push({ text: 'En az 1 büyük harf', met: true });
      strength++;
    }
    
    // Number check
    if (!/[0-9]/.test(password)) {
      requirements.push({ text: 'En az 1 rakam', met: false });
    } else {
      requirements.push({ text: 'En az 1 rakam', met: true });
      strength++;
    }
    
    // Special character check
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      requirements.push({ text: 'En az 1 özel karakter (!@#$%^&*)', met: false });
    } else {
      requirements.push({ text: 'En az 1 özel karakter', met: true });
      strength++;
    }
    
    // Common passwords check
    const commonPasswords = [
      '12345678', 'password', 'qwerty123', 'admin123', 
      'password123', '123456789', 'qwertyuiop'
    ];
    
    if (commonPasswords.includes(password.toLowerCase())) {
      errors.push('Bu şifre çok yaygın kullanılıyor, daha güvenli bir şifre seçin');
    }
    
    // Strength levels
    let strengthText = 'Zayıf';
    let strengthColor = 'red';
    
    if (strength >= 2) {
      strengthText = 'Orta';
      strengthColor = 'orange';
    }
    if (strength >= 3) {
      strengthText = 'Güçlü';
      strengthColor = 'green';
    }
    
    return {
      isValid: strength >= 2 && errors.length === 0,
      errors,
      strength: strengthText,
      strengthColor,
      strengthScore: strength,
      requirements
    };
  }
  
  // Name validation
  static validateName(name, fieldName = 'İsim') {
    const errors = [];
    
    if (!name || name.trim() === '') {
      errors.push(`${fieldName} gereklidir`);
      return { isValid: false, errors };
    }
    
    const nameTrimmed = name.trim();
    
    // Length check
    if (nameTrimmed.length < 2) {
      errors.push(`${fieldName} en az 2 karakter olmalıdır`);
    }
    
    if (nameTrimmed.length > 50) {
      errors.push(`${fieldName} çok uzun (max 50 karakter)`);
    }
    
    // Character check (only letters and Turkish characters)
    const nameRegex = /^[a-zA-ZçÇğĞıİöÖşŞüÜ\s]+$/;
    if (!nameRegex.test(nameTrimmed)) {
      errors.push(`${fieldName} sadece harflerden oluşmalıdır`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitized: nameTrimmed
    };
  }
  
  // Quantity validation (for cart)
  static validateQuantity(quantity) {
    const errors = [];
    
    if (!quantity && quantity !== 0) {
      errors.push('Miktar gereklidir');
      return { isValid: false, errors };
    }
    
    const numQuantity = parseInt(quantity);
    
    if (isNaN(numQuantity)) {
      errors.push('Miktar bir sayı olmalıdır');
      return { isValid: false, errors };
    }
    
    if (numQuantity < 1) {
      errors.push('Miktar en az 1 olmalıdır');
    }
    
    if (numQuantity > 99) {
      errors.push('Miktar en fazla 99 olabilir');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitized: numQuantity
    };
  }
  
  // Search input sanitization (XSS protection)
  static sanitizeSearch(searchTerm) {
    if (!searchTerm) return '';
    
    // Remove HTML tags
    let sanitized = searchTerm.replace(/<[^>]*>/g, '');
    
    // Remove script tags and javascript
    sanitized = sanitized.replace(/javascript:/gi, '');
    sanitized = sanitized.replace(/on\w+=/gi, '');
    
    // Trim and limit length
    sanitized = sanitized.trim().substring(0, 100);
    
    return sanitized;
  }
  
  // Coupon code validation
  static validateCouponCode(code) {
    const errors = [];
    
    if (!code || code.trim() === '') {
      errors.push('Kupon kodu gereklidir');
      return { isValid: false, errors };
    }
    
    const codeTrimmed = code.trim().toUpperCase();
    
    // Length check
    if (codeTrimmed.length < 3) {
      errors.push('Kupon kodu en az 3 karakter olmalıdır');
    }
    
    if (codeTrimmed.length > 20) {
      errors.push('Kupon kodu çok uzun (max 20 karakter)');
    }
    
    // Format check (alphanumeric and some special chars)
    const couponRegex = /^[A-Z0-9\-_]+$/;
    if (!couponRegex.test(codeTrimmed)) {
      errors.push('Kupon kodu sadece büyük harf, rakam, - ve _ içerebilir');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitized: codeTrimmed
    };
  }
  
  // Phone number validation (Turkish format)
  static validatePhone(phone) {
    const errors = [];
    
    if (!phone || phone.trim() === '') {
      // Phone is optional in many cases
      return { isValid: true, errors: [], sanitized: '' };
    }
    
    // Remove all non-digit characters
    const phoneDigits = phone.replace(/\D/g, '');
    
    // Turkish phone number: 10 digits (5xxxxxxxxx) or 11 digits with country code (905xxxxxxxxx)
    if (phoneDigits.length === 10) {
      if (!phoneDigits.startsWith('5')) {
        errors.push('Telefon numarası 5 ile başlamalıdır');
      }
    } else if (phoneDigits.length === 11) {
      if (!phoneDigits.startsWith('905')) {
        errors.push('Telefon numarası 905 ile başlamalıdır');
      }
    } else if (phoneDigits.length === 13) {
      if (!phoneDigits.startsWith('90905')) {
        errors.push('Geçerli bir Türkiye telefon numarası girin');
      }
    } else {
      errors.push('Geçerli bir telefon numarası girin (05xxxxxxxxx)');
    }
    
    // Format for display
    let formatted = '';
    if (phoneDigits.length === 10) {
      formatted = `0${phoneDigits.substring(0, 3)} ${phoneDigits.substring(3, 6)} ${phoneDigits.substring(6, 8)} ${phoneDigits.substring(8)}`;
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      sanitized: phoneDigits,
      formatted
    };
  }
}

export default Validator; 