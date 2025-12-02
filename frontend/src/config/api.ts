import { API_BASE_URL } from '../config/api';

// API Configuration
// This file centralizes the API URL configuration for the entire application

/**
 * Get the API base URL from environment variables
 * Falls back to localhost for development
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || '${API_BASE_URL}';

/**
 * API endpoint builder
 * Usage: apiUrl('/api/auth/login')
 */
export const apiUrl = (path: string): string => {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

/**
 * Common API endpoints
 */
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',
  },
  
  // Farmers
  FARMERS: {
    PROFILE: '/api/farmers/profile',
    LIST: '/api/mao/farmers',
  },
  
  // Harvests
  HARVESTS: {
    MAO_LIST: '/api/harvests/mao/harvests',
    MAO_STATISTICS: '/api/harvests/mao/harvests/statistics',
    ADMIN_LIST: '/api/harvests/admin/harvests/all',
    SUBMIT: '/api/harvests',
    VERIFY: (id: string) => `/api/harvests/mao/harvests/${id}/verify`,
    REJECT: (id: string) => `/api/harvests/mao/harvests/${id}/reject`,
    DELETE: (id: string) => `/api/harvests/${id}`,
    UPDATE: (id: string) => `/api/harvests/mao/harvests/${id}`,
  },
  
  // Inventory
  INVENTORY: {
    LIST: '/api/inventory/inventory',
    ADMIN_LIST: '/api/inventory/admin/inventory/all',
    STATISTICS: '/api/inventory/inventory/statistics',
    CREATE: '/api/inventory/inventory',
  },
  
  // Monitoring
  MONITORING: {
    LIST: '/api/mao/monitoring',
    CREATE: '/api/mao/monitoring',
    UPDATE: (id: string) => `/api/mao/monitoring/${id}`,
    DELETE: (id: string) => `/api/mao/monitoring/${id}`,
  },
  
  // Seedling Distribution
  SEEDLING: {
    FARMER_PLANTED: '/api/seedling-distribution/farmer/planted',
  },
} as const;

// Log the current API configuration (only in development)
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:', {
    baseUrl: API_BASE_URL,
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
  });
}
