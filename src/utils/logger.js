// Logger utility for controlled logging
class Logger {
  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  // Debug logs - only in development, minimal info
  debug(message, data = null) {
    if (this.isDevelopment) {
      console.log('[DEBUG]', message, data ? this.sanitizeData(data) : '');
    }
  }

  // Info logs - only important API calls
  info(message, data = null) {
    if (this.isDevelopment) {
      console.info('[INFO]', message, data ? this.sanitizeData(data) : '');
    }
  }

  // Warning logs - in development only
  warn(message, data = null) {
    if (this.isDevelopment) {
      console.warn('[WARN]', message, data ? this.sanitizeData(data) : '');
    }
  }

  // Error logs - always show but sanitized
  error(message, error = null, context = {}) {
    const errorInfo = {
      message,
      timestamp: new Date().toISOString(),
      ...this.sanitizeData(context)
    };

    if (this.isDevelopment) {
      console.error('[ERROR]', errorInfo);
      if (error) {
        console.error('Error details:', error);
      }
    } else {
      // In production, only log critical errors without sensitive data
      console.error('[ERROR]', errorInfo.message);
      // TODO: Send to monitoring service
    }
  }

  // User action logs - only in development, no sensitive data
  userAction(action, data = {}) {
    if (this.isDevelopment) {
      const sanitized = this.sanitizeData(data);
      // Only log action type, not details
      console.log(`[USER] ${action}`, sanitized.productId ? { productId: sanitized.productId } : '');
    }
  }

  // Performance logs - only in development
  performance(label, timeMs) {
    if (this.isDevelopment) {
      console.log(`[PERF] ${label}: ${timeMs}ms`);
    }
  }

  // Sanitize sensitive data
  sanitizeData(data) {
    if (!data || typeof data !== 'object') return data;
    
    const sanitized = { ...data };
    
    // Remove sensitive fields
    const sensitiveFields = [
      'password', 'token', 'userId', 'email', 
      'couponCode', 'creditCard', 'ssn', 'phone'
    ];
    
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        if (this.isDevelopment) {
          // In development, show partial info
          sanitized[field] = this.maskSensitiveValue(sanitized[field]);
        } else {
          // In production, remove completely
          delete sanitized[field];
        }
      }
    });
    
    return sanitized;
  }

  // Mask sensitive values for development
  maskSensitiveValue(value) {
    if (typeof value === 'string') {
      if (value.length <= 3) return '***';
      return value.substring(0, 2) + '***' + value.substring(value.length - 1);
    }
    return '***';
  }
}

// Create singleton instance
const logger = new Logger();

export default logger; 