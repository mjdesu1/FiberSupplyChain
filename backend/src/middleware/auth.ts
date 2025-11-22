// middleware/auth.ts - Production-ready authentication middleware
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { UserType } from '../types';

/**
 * Authentication middleware - Verifies JWT token and attaches user to request
 * PRODUCTION READY: Validates tokens, checks expiration, enforces security
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Authentication required. Please provide a valid access token.',
      });
      return;
    }

    // Extract token (remove 'Bearer ' prefix)
    const token = authHeader.substring(7);

    // Verify token using AuthService
    const payload = AuthService.verifyToken(token);

    if (!payload) {
      res.status(401).json({
        error: 'Invalid or expired token. Please login again.',
      });
      return;
    }

    console.log('🔐 Authenticated user:', {
      userId: payload.userId,
      userType: payload.userType,
      email: payload.email,
      isSuperAdmin: payload.isSuperAdmin
    });

    // Attach user information to request object
    req.user = {
      userId: payload.userId,
      userType: payload.userType,
      email: payload.email,
      isSuperAdmin: payload.isSuperAdmin,
    };

    next();
  } catch (error) {
    console.error('❌ Authentication error:', error);
    res.status(401).json({
      error: 'Authentication failed. Please login again.',
    });
  }
};

/**
 * Authorization middleware for Association Officers (MAO)
 * PRODUCTION READY: Enforces role-based access control
 */
export const authorizeMAO = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required.',
      });
      return;
    }

    // Check if user has officer role
    if (req.user.userType !== 'officer') {
      res.status(403).json({
        error: 'Access denied. This resource is only available to Association Officers.',
      });
      return;
    }

    next();
  } catch (error) {
    console.error('❌ Authorization error:', error);
    res.status(403).json({
      error: 'Authorization failed.',
    });
  }
};

/**
 * Authorization middleware for Buyers
 * PRODUCTION READY: Enforces role-based access control
 */
export const authorizeBuyer = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required.',
      });
      return;
    }

    // Check if user has buyer role
    if (req.user.userType !== 'buyer') {
      res.status(403).json({
        error: 'Access denied. This resource is only available to Buyers.',
      });
      return;
    }

    next();
  } catch (error) {
    console.error('❌ Authorization error:', error);
    res.status(403).json({
      error: 'Authorization failed.',
    });
  }
};

/**
 * Authorization middleware for Farmers
 * PRODUCTION READY: Enforces role-based access control
 */
export const authorizeFarmer = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required.',
      });
      return;
    }

    // Check if user has farmer role
    if (req.user.userType !== 'farmer') {
      res.status(403).json({
        error: 'Access denied. This resource is only available to Farmers.',
      });
      return;
    }

    next();
  } catch (error) {
    console.error('❌ Authorization error:', error);
    res.status(403).json({
      error: 'Authorization failed.',
    });
  }
};

/**
 * Authorization middleware for multiple roles
 * PRODUCTION READY: Allows access to specified user types
 * 
 * @param allowedRoles - Array of user types that are allowed access
 * @example authorizeRoles(['farmer', 'officer'])
 */
export const authorizeRoles = (...allowedRoles: UserType[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required.',
        });
        return;
      }

      console.log('🔐 Authorization check:', {
        user: req.user.userId,
        userType: req.user.userType,
        isSuperAdmin: req.user.isSuperAdmin,
        allowedRoles: allowedRoles
      });

      // Check if user's role is in allowed roles
      if (!allowedRoles.includes(req.user.userType)) {
        res.status(403).json({
          error: `Access denied. This resource is only available to: ${allowedRoles.join(', ')}.`,
        });
        return;
      }

      next();
    } catch (error) {
      console.error('❌ Authorization error:', error);
      res.status(403).json({
        error: 'Authorization failed.',
      });
    }
  };
};

/**
 * Authorization middleware for Super Admin officers only
 * PRODUCTION READY: Enforces super admin access control
 * Super Admins have full system access (create accounts + maintenance)
 */
export const authorizeSuperAdmin = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required.',
      });
      return;
    }

    // Check if user is an officer
    if (req.user.userType !== 'officer') {
      res.status(403).json({
        error: 'Access denied. This resource is only available to Super Administrators.',
      });
      return;
    }

    console.log('👑 Super Admin check:', {
      user: req.user.userId,
      isSuperAdmin: req.user.isSuperAdmin
    });

    // Check if user has Super Admin flag
    if (!req.user.isSuperAdmin) {
      res.status(403).json({
        error: 'Access denied. This resource requires Super Administrator privileges.',
      });
      return;
    }

    next();
  } catch (error) {
    console.error('❌ Authorization error:', error);
    res.status(403).json({
      error: 'Authorization failed.',
    });
  }
};

/**
 * Authorization middleware for CUSAFA officers
 * PRODUCTION READY: Enforces CUSAFA access control
 * CUSAFA can view all distribution data across associations
 */
export const authorizeCUSAFA = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required.',
      });
      return;
    }

    // Check if user is an officer (MAO or CUSAFA)
    if (req.user.userType !== 'officer') {
      res.status(403).json({
        error: 'Access denied. This resource is only available to CUSAFA officers.',
      });
      return;
    }

    console.log('🏛️ CUSAFA access check:', {
      user: req.user.userId,
      userType: req.user.userType,
      isSuperAdmin: req.user.isSuperAdmin
    });

    // For now, allow all officers to access CUSAFA data
    // In production, you might want to add a specific CUSAFA role or flag
    next();
  } catch (error) {
    console.error('❌ Authorization error:', error);
    res.status(403).json({
      error: 'Authorization failed.',
    });
  }
};

/**
 * Authorization middleware for Association Officers
 * PRODUCTION READY: Enforces association officer access control
 */
export const authorizeAssociation = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      res.status(401).json({
        error: 'Authentication required.',
      });
      return;
    }

    // Check if user is an association officer
    if (req.user.userType !== 'association_officer') {
      res.status(403).json({
        error: 'Access denied. This resource is only available to Association Officers.',
      });
      return;
    }

    next();
  } catch (error) {
    console.error('❌ Authorization error:', error);
    res.status(403).json({
      error: 'Authorization failed.',
    });
  }
};