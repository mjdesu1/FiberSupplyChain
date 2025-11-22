/**
 * Centralized Token Management
 * Single source of truth for all authentication tokens
 */

const TOKEN_KEY = 'token';
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';
const USER_TYPE_KEY = 'userType';

/**
 * Save authentication tokens to localStorage
 */
export const saveAuthTokens = (accessToken: string, refreshToken: string) => {
  try {
    // Save both 'token' and 'accessToken' for compatibility
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    console.log('✅ Tokens saved successfully');
  } catch (error) {
    console.error('❌ Error saving tokens:', error);
  }
};

/**
 * Get the current authentication token
 * Returns the token or null if not found
 */
export const getAuthToken = (): string | null => {
  try {
    // Try 'token' first, fallback to 'accessToken'
    const token = localStorage.getItem(TOKEN_KEY) || localStorage.getItem(ACCESS_TOKEN_KEY);
    return token;
  } catch (error) {
    console.error('❌ Error getting token:', error);
    return null;
  }
};

/**
 * Get refresh token
 */
export const getRefreshToken = (): string | null => {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('❌ Error getting refresh token:', error);
    return null;
  }
};

/**
 * Save user data to localStorage
 */
export const saveUserData = (user: any, userType: string) => {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(USER_TYPE_KEY, userType);
    console.log('✅ User data saved successfully');
  } catch (error) {
    console.error('❌ Error saving user data:', error);
  }
};

/**
 * Get user data from localStorage
 */
export const getUserData = (): any | null => {
  try {
    const userData = localStorage.getItem(USER_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('❌ Error getting user data:', error);
    return null;
  }
};

/**
 * Get user type
 */
export const getUserType = (): string | null => {
  try {
    return localStorage.getItem(USER_TYPE_KEY);
  } catch (error) {
    console.error('❌ Error getting user type:', error);
    return null;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  return !!token;
};

/**
 * Clear all authentication data (logout)
 */
export const clearAuthData = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(USER_TYPE_KEY);
    console.log('✅ Auth data cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing auth data:', error);
  }
};

/**
 * Get authorization header for API requests
 */
export const getAuthHeader = (): { Authorization: string } | {} => {
  const token = getAuthToken();
  if (!token) {
    console.warn('⚠️ No auth token found');
    return {};
  }
  return {
    Authorization: `Bearer ${token}`
  };
};

/**
 * Check if token is expired (basic check)
 * Returns true if token appears to be expired
 */
export const isTokenExpired = (): boolean => {
  const token = getAuthToken();
  if (!token) return true;

  try {
    // Decode JWT token (basic decode, not verification)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    
    return currentTime >= expirationTime;
  } catch (error) {
    console.error('❌ Error checking token expiration:', error);
    return true; // Assume expired if we can't check
  }
};

/**
 * Complete login - save all auth data
 */
export const completeLogin = (
  accessToken: string,
  refreshToken: string,
  user: any,
  userType: string
) => {
  saveAuthTokens(accessToken, refreshToken);
  saveUserData(user, userType);
  console.log('✅ Login completed successfully');
};

/**
 * Complete logout - clear all auth data
 */
export const completeLogout = () => {
  clearAuthData();
  console.log('✅ Logout completed successfully');
};

/**
 * Validate stored authentication data
 * Ensures token and userType are consistent
 */
export const validateAuthData = (): { isValid: boolean; userType: string | null } => {
  try {
    const token = getAuthToken();
    const userType = getUserType();
    const userData = getUserData();

    if (!token || !userType || !userData) {
      console.warn('⚠️ Incomplete auth data found, clearing...');
      clearAuthData();
      return { isValid: false, userType: null };
    }

    // Decode token to verify userType matches
    const payload = JSON.parse(atob(token.split('.')[1]));
    const tokenUserType = payload.userType;

    if (tokenUserType !== userType) {
      console.error('❌ Token userType mismatch! Token:', tokenUserType, 'Stored:', userType);
      clearAuthData();
      return { isValid: false, userType: null };
    }

    // Check if token is expired
    if (isTokenExpired()) {
      console.warn('⚠️ Token expired, clearing auth data...');
      clearAuthData();
      return { isValid: false, userType: null };
    }

    console.log('✅ Auth data validation successful:', { userType: tokenUserType });
    return { isValid: true, userType: tokenUserType };
  } catch (error) {
    console.error('❌ Error validating auth data:', error);
    clearAuthData();
    return { isValid: false, userType: null };
  }
};

export default {
  saveAuthTokens,
  getAuthToken,
  getRefreshToken,
  saveUserData,
  getUserData,
  getUserType,
  isAuthenticated,
  clearAuthData,
  getAuthHeader,
  isTokenExpired,
  completeLogin,
  completeLogout
};
