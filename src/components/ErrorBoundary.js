import React from 'react';
import logger from '../utils/logger';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Error durumunda state'i güncelle
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Error'ı log'la
    logger.error('React Error Boundary caught an error', error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true
    });

    // State'i güncelle
    this.setState({
      error,
      errorInfo
    });

    // Production'da monitoring service'e gönder
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to Sentry, LogRocket, etc.
    }
  }

  handleReload = () => {
    // Sayfayı yeniden yükle
    window.location.reload();
  }

  handleGoHome = () => {
    // Ana sayfaya yönlendir
    window.location.href = '/';
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen dark:bg-gradient-dark light:bg-gradient-light bg-gradient-light flex items-center justify-center px-4">
          <div className="max-w-md mx-auto text-center">
            {/* Error Icon */}
            <div className="mb-8">
              <div className="mx-auto w-24 h-24 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                <svg className="w-12 h-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>

            {/* Error Message */}
            <h1 className="text-3xl font-bold dark:text-white light:text-gray-900 text-gray-900 mb-4">
              Oops! Bir şeyler ters gitti
            </h1>
            
            <p className="dark:text-gray-300 light:text-gray-600 text-gray-600 mb-8">
              Beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin.
            </p>

            {/* Action Buttons */}
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <button
                onClick={this.handleReload}
                className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
              >
                Sayfayı Yenile
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="w-full sm:w-auto px-6 py-3 border border-gray-300 dark:border-gray-600 dark:text-gray-300 light:text-gray-700 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                Ana Sayfa
              </button>
            </div>

            {/* Development Error Details */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-8 text-left">
                <summary className="cursor-pointer text-sm font-semibold dark:text-gray-400 light:text-gray-600 text-gray-600 mb-2">
                  Geliştirici Detayları (Sadece Development)
                </summary>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-xs overflow-auto">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error.toString()}
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap mt-1">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    // Hata yoksa children'ı render et
    return this.props.children;
  }
}

export default ErrorBoundary; 