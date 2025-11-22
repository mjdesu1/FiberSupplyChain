/**
 * Cookie Manager Utility
 * Handles cookie preferences and performance optimizations
 */

export interface CookiePreferences {
  essential: boolean;
  functional: boolean;
  analytics: boolean;
}

const COOKIE_CONSENT_KEY = 'cookieConsent';
const COOKIE_PREFERENCES_KEY = 'cookiePreferences';
const CACHE_PREFIX = 'abaca_cache_';

/**
 * Get saved cookie preferences from localStorage
 */
export const getCookiePreferences = (): CookiePreferences => {
  try {
    const saved = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    if (saved) {
      const preferences = JSON.parse(saved);
      return {
        essential: true, // Always true
        functional: preferences.functional || false,
        analytics: preferences.analytics || false,
      };
    }
  } catch (error) {
    console.error('Error loading cookie preferences:', error);
  }
  
  return {
    essential: true,
    functional: false,
    analytics: false,
  };
};

/**
 * Save cookie preferences to localStorage
 */
export const saveCookiePreferences = (preferences: CookiePreferences): void => {
  try {
    const consentLevel = preferences.functional && preferences.analytics ? 'all' : 
                        !preferences.functional && !preferences.analytics ? 'essential' : 'custom';
    
    localStorage.setItem(COOKIE_CONSENT_KEY, consentLevel);
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(preferences));
    
    // Apply performance optimizations based on preferences
    if (preferences.analytics) {
      enablePerformanceOptimizations();
    } else {
      disablePerformanceOptimizations();
    }
  } catch (error) {
    console.error('Error saving cookie preferences:', error);
  }
};

/**
 * Check if user has given cookie consent
 */
export const hasConsent = (): boolean => {
  return localStorage.getItem(COOKIE_CONSENT_KEY) !== null;
};

/**
 * Enable performance optimizations when analytics cookies are accepted
 */
const enablePerformanceOptimizations = (): void => {
  if (typeof window === 'undefined') return;
  
  // Enable DNS prefetching for external resources
  addResourceHint('dns-prefetch', '//fonts.googleapis.com');
  addResourceHint('dns-prefetch', '//www.youtube.com');
  
  // Enable preconnect for critical resources
  addResourceHint('preconnect', '//fonts.googleapis.com', true);
  
  // Enable service worker for caching (if available)
  if ('serviceWorker' in navigator) {
    // Service worker registration would go here
    console.log('Performance optimizations enabled');
  }
  
  // Set performance monitoring flag
  sessionStorage.setItem('performance_monitoring', 'enabled');
};

/**
 * Disable performance optimizations when analytics cookies are rejected
 */
const disablePerformanceOptimizations = (): void => {
  if (typeof window === 'undefined') return;
  
  // Remove resource hints
  const hints = document.querySelectorAll('link[data-cookie-hint]');
  hints.forEach(hint => hint.remove());
  
  // Clear analytics-related session storage
  sessionStorage.removeItem('performance_monitoring');
  
  // Remove analytics scripts
  const analyticsScripts = document.querySelectorAll('script[data-analytics]');
  analyticsScripts.forEach(script => script.remove());
  
  console.log('Performance optimizations disabled');
};

/**
 * Add resource hint to document head
 */
const addResourceHint = (rel: string, href: string, crossorigin: boolean = false): void => {
  // Check if hint already exists
  const existing = document.querySelector(`link[rel="${rel}"][href="${href}"]`);
  if (existing) return;
  
  const link = document.createElement('link');
  link.rel = rel;
  link.href = href;
  link.setAttribute('data-cookie-hint', 'true');
  
  if (crossorigin) {
    link.crossOrigin = 'anonymous';
  }
  
  document.head.appendChild(link);
};

/**
 * Cache data with expiration (only if functional cookies are enabled)
 */
export const cacheData = (key: string, data: any, expirationMinutes: number = 60): void => {
  const preferences = getCookiePreferences();
  if (!preferences.functional) return;
  
  try {
    const item = {
      data,
      expiration: Date.now() + (expirationMinutes * 60 * 1000),
    };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
  } catch (error) {
    console.error('Error caching data:', error);
  }
};

/**
 * Get cached data (only if functional cookies are enabled)
 */
export const getCachedData = (key: string): any | null => {
  const preferences = getCookiePreferences();
  if (!preferences.functional) return null;
  
  try {
    const cached = localStorage.getItem(CACHE_PREFIX + key);
    if (!cached) return null;
    
    const item = JSON.parse(cached);
    
    // Check if expired
    if (Date.now() > item.expiration) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    
    return item.data;
  } catch (error) {
    console.error('Error getting cached data:', error);
    return null;
  }
};

/**
 * Clear all cached data
 */
export const clearCache = (): void => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
};

/**
 * Track page view (only if analytics cookies are enabled)
 */
export const trackPageView = (pageName: string): void => {
  const preferences = getCookiePreferences();
  if (!preferences.analytics) return;
  
  try {
    // Log page view for analytics
    const pageViews = JSON.parse(sessionStorage.getItem('page_views') || '[]');
    pageViews.push({
      page: pageName,
      timestamp: Date.now(),
    });
    
    // Keep only last 50 page views to avoid memory issues
    if (pageViews.length > 50) {
      pageViews.shift();
    }
    
    sessionStorage.setItem('page_views', JSON.stringify(pageViews));
  } catch (error) {
    console.error('Error tracking page view:', error);
  }
};

/**
 * Get performance metrics (only if analytics cookies are enabled)
 */
export const getPerformanceMetrics = (): any => {
  const preferences = getCookiePreferences();
  if (!preferences.analytics) return null;
  
  if (typeof window === 'undefined' || !window.performance) return null;
  
  try {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    return {
      loadTime: navigation.loadEventEnd - navigation.fetchStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
      firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
      pageViews: JSON.parse(sessionStorage.getItem('page_views') || '[]').length,
    };
  } catch (error) {
    console.error('Error getting performance metrics:', error);
    return null;
  }
};

/**
 * Optimize images based on connection speed (only if analytics cookies are enabled)
 */
export const getOptimalImageQuality = (): 'low' | 'medium' | 'high' => {
  const preferences = getCookiePreferences();
  if (!preferences.analytics) return 'medium';
  
  if (typeof navigator === 'undefined') return 'medium';
  
  // Check connection type
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  if (!connection) return 'medium';
  
  // Adjust quality based on effective connection type
  switch (connection.effectiveType) {
    case 'slow-2g':
    case '2g':
      return 'low';
    case '3g':
      return 'medium';
    case '4g':
    default:
      return 'high';
  }
};

/**
 * Preload critical resources (only if analytics cookies are enabled)
 */
export const preloadCriticalResources = (resources: string[]): void => {
  const preferences = getCookiePreferences();
  if (!preferences.analytics) return;
  
  resources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    link.setAttribute('data-cookie-hint', 'true');
    
    // Determine resource type
    if (resource.endsWith('.css')) {
      link.as = 'style';
    } else if (resource.endsWith('.js')) {
      link.as = 'script';
    } else if (resource.match(/\.(jpg|jpeg|png|webp|gif)$/)) {
      link.as = 'image';
    }
    
    document.head.appendChild(link);
  });
};

export default {
  getCookiePreferences,
  saveCookiePreferences,
  hasConsent,
  cacheData,
  getCachedData,
  clearCache,
  trackPageView,
  getPerformanceMetrics,
  getOptimalImageQuality,
  preloadCriticalResources,
};
