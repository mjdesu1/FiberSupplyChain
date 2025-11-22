// middleware/captchaMiddleware.ts - CAPTCHA verification middleware
import { Request, Response, NextFunction } from 'express';
import { verifyRecaptchaEnhanced, captchaSecurityManager } from '../utils/captchaEnhanced';
import { config } from '../config/env';

/**
 * Middleware to verify CAPTCHA token
 * Uses enhanced CAPTCHA verification with token reuse prevention and IP tracking
 */
export function verifyCaptchaMiddleware(
  version: 'v2' | 'v3' = 'v2',
  minScore: number = 0.5
) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Extract CAPTCHA token from request
      const token = req.body.recaptchaToken || req.body.captchaToken;

      // Get request metadata
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.get('user-agent') || 'unknown';
      const endpoint = req.originalUrl || req.url;

      // Check if token is provided
      if (!token) {
        res.status(400).json({
          error: 'reCAPTCHA verification is required. Please complete the "I\'m not a robot" challenge.',
          code: 'CAPTCHA_REQUIRED',
        });
        return;
      }

      // Verify CAPTCHA with enhanced security
      const isValid = await verifyRecaptchaEnhanced(
        token,
        ip,
        userAgent,
        endpoint,
        version,
        minScore
      );

      if (!isValid) {
        res.status(400).json({
          error: 'reCAPTCHA verification failed. Please try again.',
          code: 'CAPTCHA_FAILED',
        });
        return;
      }

      // CAPTCHA verified successfully
      next();
    } catch (error: any) {
      console.error('❌ Error in CAPTCHA middleware:', error);
      res.status(500).json({
        error: 'CAPTCHA verification error. Please try again.',
        code: 'CAPTCHA_ERROR',
      });
    }
  };
}

/**
 * Middleware to check IP reputation before processing request
 */
export function checkIPReputationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const ipCheck = captchaSecurityManager.checkIPReputation(ip);

  if (!ipCheck.allowed) {
    res.status(403).json({
      error: ipCheck.reason || 'Access denied due to suspicious activity.',
      code: 'IP_BLOCKED',
    });
    return;
  }

  next();
}

/**
 * Middleware to add honeypot field detection
 * Bots often fill all fields, including hidden ones
 */
export function honeypotMiddleware(fieldName: string = 'website') {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Check if honeypot field is filled
    if (req.body[fieldName]) {
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      console.warn(`🍯 Honeypot triggered by IP: ${ip}`);
      
      // Return success to avoid revealing the honeypot
      // But don't actually process the request
      res.status(200).json({
        message: 'Request processed successfully',
      });
      return;
    }

    next();
  };
}

/**
 * Middleware to detect suspiciously fast form submissions
 * Bots typically submit forms much faster than humans
 */
export function timingAttackMiddleware(minTimeMs: number = 3000) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const formStartTime = req.body.formStartTime;

    if (formStartTime) {
      const now = Date.now();
      const timeTaken = now - parseInt(formStartTime, 10);

      if (timeTaken < minTimeMs) {
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        console.warn(
          `⚠️ Suspiciously fast submission detected from ${ip}: ${timeTaken}ms`
        );
        
        // Optionally reject or flag for review
        // For now, just log and continue
      }
    }

    next();
  };
}

/**
 * Combined security middleware for authentication endpoints
 * Applies multiple security checks in sequence
 */
export function authSecurityMiddleware(
  captchaVersion: 'v2' | 'v3' = 'v2',
  minScore: number = 0.5
) {
  return [
    checkIPReputationMiddleware,
    honeypotMiddleware('website'),
    timingAttackMiddleware(3000),
    verifyCaptchaMiddleware(captchaVersion, minScore),
  ];
}

/**
 * Admin endpoint to get CAPTCHA security statistics
 */
export function getCaptchaStatistics(req: Request, res: Response): void {
  try {
    const stats = captchaSecurityManager.getIPStatistics();
    const blockedIPs = captchaSecurityManager.getBlockedIPs();
    const recentLogs = captchaSecurityManager.getAuditLogs(50);

    res.status(200).json({
      statistics: stats,
      blockedIPs,
      recentAttempts: recentLogs.length,
      recentLogs: recentLogs.slice(0, 10), // Only show last 10 in response
    });
  } catch (error: any) {
    console.error('❌ Error getting CAPTCHA statistics:', error);
    res.status(500).json({
      error: 'Failed to retrieve statistics',
    });
  }
}

/**
 * Admin endpoint to unblock an IP
 */
export function unblockIP(req: Request, res: Response): void {
  try {
    const { ip } = req.body;

    if (!ip) {
      res.status(400).json({ error: 'IP address is required' });
      return;
    }

    const success = captchaSecurityManager.unblockIP(ip);

    if (success) {
      res.status(200).json({
        message: `IP ${ip} has been unblocked`,
      });
    } else {
      res.status(404).json({
        error: `IP ${ip} is not blocked or not found`,
      });
    }
  } catch (error: any) {
    console.error('❌ Error unblocking IP:', error);
    res.status(500).json({
      error: 'Failed to unblock IP',
    });
  }
}

// Export CAPTCHA version configurations
export const captchaV2Middleware = verifyCaptchaMiddleware('v2', 0.5);
export const captchaV3Middleware = verifyCaptchaMiddleware('v3', 0.5);
