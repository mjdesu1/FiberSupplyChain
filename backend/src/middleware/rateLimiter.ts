// middleware/rateLimiter.ts - Rate limiting middleware for security
import { Request, Response, NextFunction } from 'express';

/**
 * Simple in-memory rate limiter
 * For production, consider using Redis for distributed systems
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
}

class RateLimiter {
  private requests: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Check if request should be rate limited
   * @param key - Unique identifier (usually IP address)
   * @param maxRequests - Maximum requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns true if request should be allowed, false if rate limited
   */
  checkLimit(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const entry = this.requests.get(key);

    // No previous requests from this key
    if (!entry) {
      this.requests.set(key, {
        count: 1,
        resetTime: now + windowMs,
        blocked: false,
      });
      return true;
    }

    // Check if blocked
    if (entry.blocked && now < entry.resetTime) {
      console.warn(`⚠️ Rate limit blocked: ${key}`);
      return false;
    }

    // Reset time has passed
    if (now >= entry.resetTime) {
      this.requests.set(key, {
        count: 1,
        resetTime: now + windowMs,
        blocked: false,
      });
      return true;
    }

    // Increment count
    entry.count++;

    // Check if limit exceeded
    if (entry.count > maxRequests) {
      entry.blocked = true;
      console.warn(`⚠️ Rate limit exceeded for ${key}: ${entry.count} requests`);
      return false;
    }

    return true;
  }

  /**
   * Get remaining requests for a key
   */
  getRemaining(key: string, maxRequests: number): number {
    const entry = this.requests.get(key);
    if (!entry) return maxRequests;
    return Math.max(0, maxRequests - entry.count);
  }

  /**
   * Get reset time for a key
   */
  getResetTime(key: string): number | null {
    const entry = this.requests.get(key);
    return entry ? entry.resetTime : null;
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.requests.forEach((entry, key) => {
      if (now >= entry.resetTime) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.requests.delete(key));
    
    if (keysToDelete.length > 0) {
      console.log(`🧹 Cleaned up ${keysToDelete.length} expired rate limit entries`);
    }
  }

  /**
   * Clear all rate limit data (for testing)
   */
  clear(): void {
    this.requests.clear();
  }

  /**
   * Destroy the rate limiter and cleanup interval
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.requests.clear();
  }
}

// Create global rate limiter instance
const globalRateLimiter = new RateLimiter();

/**
 * Create a rate limiting middleware
 * @param options - Rate limit configuration
 */
export function createRateLimiter(options: {
  windowMs: number; // Time window in milliseconds
  max: number; // Maximum requests per window
  message?: string; // Custom error message
  keyGenerator?: (req: Request) => string; // Custom key generator
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
}) {
  const {
    windowMs,
    max,
    message = 'Too many requests. Please try again later.',
    keyGenerator = (req: Request) => req.ip || 'unknown',
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = keyGenerator(req);
    const allowed = globalRateLimiter.checkLimit(key, max, windowMs);

    // Add rate limit headers
    const remaining = globalRateLimiter.getRemaining(key, max);
    const resetTime = globalRateLimiter.getResetTime(key);

    res.setHeader('X-RateLimit-Limit', max.toString());
    res.setHeader('X-RateLimit-Remaining', remaining.toString());
    
    if (resetTime) {
      res.setHeader('X-RateLimit-Reset', Math.ceil(resetTime / 1000).toString());
    }

    if (!allowed) {
      res.status(429).json({
        error: message,
        retryAfter: resetTime ? Math.ceil((resetTime - Date.now()) / 1000) : windowMs / 1000,
      });
      return;
    }

    // Handle skip options
    if (skipSuccessfulRequests || skipFailedRequests) {
      const originalSend = res.send;
      res.send = function (data: any) {
        const statusCode = res.statusCode;
        
        // Skip counting based on status code
        if (
          (skipSuccessfulRequests && statusCode >= 200 && statusCode < 300) ||
          (skipFailedRequests && statusCode >= 400)
        ) {
          // Decrement the count since we're skipping this request
          const entry = globalRateLimiter['requests'].get(key);
          if (entry) {
            entry.count = Math.max(0, entry.count - 1);
          }
        }
        
        return originalSend.call(this, data);
      };
    }

    next();
  };
}

/**
 * Pre-configured rate limiters for common use cases
 */

// Strict rate limiter for authentication endpoints
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Increased from 5 to 50 requests per 15 minutes
  message: 'Too many authentication attempts. Please try again in 15 minutes.',
  skipSuccessfulRequests: true, // Only count failed attempts
});

// CAPTCHA verification rate limiter
export const captchaRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Increased from 10 to 50 CAPTCHA attempts per 15 minutes
  message: 'Too many CAPTCHA verification attempts. Please try again later.',
});

// Registration rate limiter
export const registrationRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // Increased from 3 to 30 registration attempts per hour
  message: 'Too many registration attempts. Please try again in an hour.',
});

// Login rate limiter
export const loginRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Increased from 5 to 50 login attempts per 15 minutes
  message: 'Too many login attempts. Please try again in 15 minutes.',
  skipSuccessfulRequests: true, // Only count failed login attempts
});

// General API rate limiter
export const apiRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many requests. Please slow down.',
});

// Export the rate limiter instance for testing
export { globalRateLimiter };
