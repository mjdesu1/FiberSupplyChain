// config/env.ts - Environment configuration
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseKey: process.env.SUPABASE_KEY || '',
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // JWT Configuration
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30m', // Access token expiry (30 minutes)
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d', // Refresh token expiry
  
  // reCAPTCHA Configuration
  recaptchaSecretKey: process.env.RECAPTCHA_SECRET_KEY || '',
  recaptchaSiteKey: process.env.RECAPTCHA_SITE_KEY || '',
  recaptchaVersion: (process.env.RECAPTCHA_VERSION || 'v3') as 'v2' | 'v3',
  // Auto-adjust score based on environment: 0.1 for dev, 0.5 for production
  recaptchaMinScore: parseFloat(
    process.env.RECAPTCHA_MIN_SCORE || 
    (process.env.NODE_ENV === 'production' ? '0.5' : '0.1')
  ),
  
  // hCaptcha Configuration (alternative)
  hcaptchaSecretKey: process.env.HCAPTCHA_SECRET_KEY || '',
  hcaptchaSiteKey: process.env.HCAPTCHA_SITE_KEY || '',
};

export const isDevelopment = config.nodeEnv === 'development';
export const isProduction = config.nodeEnv === 'production';