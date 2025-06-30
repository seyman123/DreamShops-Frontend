// Performance Test Utility for E-commerce Frontend
class PerformanceTest {
    constructor() {
        this.metrics = {
            renderTimes: [],
            apiCalls: [],
            memoryUsage: [],
            bundleSize: null
        };
        
        this.observers = {
            render: null,
            memory: null
        };
        
        this.startTime = performance.now();
        console.log('Performance monitoring initialized');
    }

    // UI Render Optimization Helpers
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    // Async data processing to prevent UI blocking
    async processDataInChunks(data, processor, chunkSize = 10) {
        const startTime = performance.now();
        const results = [];
        
        for (let i = 0; i < data.length; i += chunkSize) {
            const chunk = data.slice(i, i + chunkSize);
            const processedChunk = await new Promise(resolve => {
                setTimeout(() => {
                    resolve(chunk.map(processor));
                }, 0); // Yield to browser
            });
            results.push(...processedChunk);
            
            // Update progress for large datasets
            if (data.length > 50) {
                console.log(`Processed ${Math.min(i + chunkSize, data.length)}/${data.length} items`);
            }
        }
        
        const endTime = performance.now();
        console.log(`Chunk processing completed in ${endTime - startTime}ms`);
        return results;
    }

    // Intersection Observer for lazy loading
    createIntersectionObserver(callback, options = {}) {
        const defaultOptions = {
            root: null,
            rootMargin: '50px',
            threshold: 0.1
        };
        
        return new IntersectionObserver(callback, { ...defaultOptions, ...options });
    }

    // Test render performance
    testRenderPerformance(componentName, renderFunction) {
        const startTime = performance.now();
        const result = renderFunction();
        const endTime = performance.now();
        
        const renderTime = endTime - startTime;
        this.metrics.renderTimes.push({
            component: componentName,
            time: renderTime,
            timestamp: Date.now()
        });
        
        console.log(`${componentName} render: ${renderTime.toFixed(3)}ms`);
        return result;
    }

    // Test API call performance
    testApiCall(apiName, apiFunction) {
        const startTime = performance.now();
        
        return apiFunction().then(result => {
            const endTime = performance.now();
            const apiTime = endTime - startTime;
            
            this.metrics.apiCalls.push({
                api: apiName,
                time: apiTime,
                timestamp: Date.now(),
                success: true
            });
            
            console.log(`${apiName} API: ${apiTime.toFixed(3)}ms`);
            return result;
        }).catch(error => {
            const endTime = performance.now();
            const apiTime = endTime - startTime;
            
            this.metrics.apiCalls.push({
                api: apiName,
                time: apiTime,
                timestamp: Date.now(),
                success: false,
                error: error.message
            });
            
            console.error(`${apiName} API failed: ${apiTime.toFixed(3)}ms`, error);
            throw error;
        });
    }

    // Memory monitoring
    startMemoryMonitoring() {
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                this.metrics.memoryUsage.push({
                    used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
                    total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
                    limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
                    timestamp: Date.now()
                });
                
                // Log if memory usage is high
                const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
                if (usedMB > 100) {
                    console.warn(`High memory usage: ${usedMB}MB`);
                }
            }, 5000); // Check every 5 seconds
        }
    }

    // Bundle size analysis (requires webpack-bundle-analyzer)
    analyzeBundleSize() {
        if (process.env.NODE_ENV === 'production') {
            console.log('Run "npm run analyze" to analyze bundle size');
        } else {
            console.log('Bundle analysis available in production build');
        }
    }

    // Get performance report
    getPerformanceReport() {
        const currentTime = performance.now();
        const totalTime = currentTime - this.startTime;
        
        const avgRenderTime = this.metrics.renderTimes.length > 0 
            ? this.metrics.renderTimes.reduce((sum, metric) => sum + metric.time, 0) / this.metrics.renderTimes.length
            : 0;
            
        const avgApiTime = this.metrics.apiCalls.length > 0
            ? this.metrics.apiCalls.reduce((sum, metric) => sum + metric.time, 0) / this.metrics.apiCalls.length
            : 0;
            
        const currentMemory = 'memory' in performance 
            ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)
            : 'N/A';

        return {
            totalRuntime: `${totalTime.toFixed(2)}ms`,
            avgRenderTime: `${avgRenderTime.toFixed(2)}ms`,
            avgApiTime: `${avgApiTime.toFixed(2)}ms`,
            currentMemory: `${currentMemory}MB`,
            renderCalls: this.metrics.renderTimes.length,
            apiCalls: this.metrics.apiCalls.length,
            successfulApis: this.metrics.apiCalls.filter(call => call.success).length,
            recommendations: this.getRecommendations()
        };
    }

    // Get performance recommendations
    getRecommendations() {
        const recommendations = [];
        
        if (this.metrics.renderTimes.some(metric => metric.time > 16)) {
            recommendations.push('Some renders are >16ms. Consider memoization or code splitting.');
        }
        
        if (this.metrics.apiCalls.some(metric => metric.time > 1000)) {
            recommendations.push('Some API calls are >1s. Consider caching or optimization.');
        }
        
        if ('memory' in performance && performance.memory.usedJSHeapSize > 100 * 1024 * 1024) {
            recommendations.push('High memory usage detected. Check for memory leaks.');
        }
        
        if (recommendations.length === 0) {
            recommendations.push('Performance looks good!');
        }
        
        return recommendations;
    }

    // Cleanup
    cleanup() {
        if (this.observers.render) {
            this.observers.render.disconnect();
        }
        if (this.observers.memory) {
            clearInterval(this.observers.memory);
        }
        console.log('Performance monitoring cleaned up');
    }
}

// Global instance
window.perfTest = new PerformanceTest();

// Start monitoring
window.perfTest.startMemoryMonitoring();

// Log performance report every 30 seconds in development
if (process.env.NODE_ENV === 'development') {
    setInterval(() => {
        console.log('Performance Report:', window.perfTest.getPerformanceReport());
    }, 30000);
}

export default window.perfTest; 