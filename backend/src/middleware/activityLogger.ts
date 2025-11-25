// middleware/activityLogger.ts - Activity logging middleware
import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

/**
 * Get MAC address from request headers
 * Note: MAC address is typically not available in HTTP requests
 * This is a placeholder - you may need to implement client-side collection
 */
const getMacAddress = (req: Request): string | null => {
  // Check custom header if client sends it
  const macHeader = req.headers['x-mac-address'] as string;
  return macHeader || null;
};

/**
 * Get IP address from request
 * Handles proxies and load balancers
 */
const getIpAddress = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'] as string;
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
};

/**
 * Check if IP is blocked
 */
export const checkBlockedIp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ipAddress = getIpAddress(req);

    // Check if IP is blocked
    const { data: blockedIp, error } = await supabase
      .from('blocked_ips')
      .select('*')
      .eq('ip_address', ipAddress)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking blocked IP:', error);
      next();
      return;
    }

    if (blockedIp) {
      // Check if block has expired
      if (blockedIp.expires_at && new Date(blockedIp.expires_at) < new Date()) {
        // Expire the block
        await supabase
          .from('blocked_ips')
          .update({ is_active: false })
          .eq('block_id', blockedIp.block_id);
        next();
        return;
      }

      res.status(403).json({
        error: 'Access Denied',
        message: 'Your IP address has been blocked. Please contact the administrator.',
        reason: blockedIp.reason,
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Error in checkBlockedIp middleware:', error);
    next();
  }
};

/**
 * Check if MAC address is blocked
 */
export const checkBlockedMac = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const macAddress = getMacAddress(req);

    if (!macAddress) {
      next();
      return;
    }

    // Check if MAC is blocked
    const { data: blockedMac, error } = await supabase
      .from('blocked_macs')
      .select('*')
      .eq('mac_address', macAddress)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking blocked MAC:', error);
      next();
      return;
    }

    if (blockedMac) {
      // Check if block has expired
      if (blockedMac.expires_at && new Date(blockedMac.expires_at) < new Date()) {
        // Expire the block
        await supabase
          .from('blocked_macs')
          .update({ is_active: false })
          .eq('block_id', blockedMac.block_id);
        next();
        return;
      }

      res.status(403).json({
        error: 'Access Denied',
        message: 'Your device has been blocked. Please contact the administrator.',
        reason: blockedMac.reason,
      });
      return;
    }

    next();
  } catch (error) {
    console.error('Error in checkBlockedMac middleware:', error);
    next();
  }
};

/**
 * Log user activity
 * This middleware logs all authenticated user actions
 */
export const logActivity = (actionType: 'auth' | 'create' | 'read' | 'update' | 'delete' | 'system') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const originalSend = res.json.bind(res);

    // Override res.json to capture response
    res.json = function (data: any): Response {
      // Log the activity after response is sent
      setImmediate(async () => {
        try {
          const user = req.user;
          const ipAddress = getIpAddress(req);
          const macAddress = getMacAddress(req);

          // Determine action description
          let action = `${req.method} ${req.path}`;
          let description = `User performed ${req.method} request on ${req.path}`;

          // Extract resource information
          const pathParts = req.path.split('/').filter(Boolean);
          const resource = pathParts[0] || 'unknown';
          const resourceId = pathParts[1] && pathParts[1].match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) 
            ? pathParts[1] 
            : null;

          // Get user details
          let userName = 'Anonymous';
          let userEmail = 'unknown';

          if (user) {
            // Fetch user details based on user type
            if (user.userType === 'officer') {
              const { data: officer } = await supabase
                .from('organization')
                .select('full_name, email')
                .eq('officer_id', user.userId)
                .single();
              if (officer) {
                userName = officer.full_name;
                userEmail = officer.email;
              }
            } else if (user.userType === 'farmer') {
              const { data: farmer } = await supabase
                .from('farmers')
                .select('full_name, email')
                .eq('farmer_id', user.userId)
                .single();
              if (farmer) {
                userName = farmer.full_name;
                userEmail = farmer.email;
              }
            } else if (user.userType === 'buyer') {
              const { data: buyer } = await supabase
                .from('buyers')
                .select('business_name, email')
                .eq('buyer_id', user.userId)
                .single();
              if (buyer) {
                userName = buyer.business_name;
                userEmail = buyer.email;
              }
            } else if (user.userType === 'association_officer') {
              const { data: assocOfficer } = await supabase
                .from('association_officers')
                .select('full_name, email')
                .eq('officer_id', user.userId)
                .single();
              if (assocOfficer) {
                userName = assocOfficer.full_name;
                userEmail = assocOfficer.email;
              }
            }
          }

          // Insert activity log
          await supabase.from('activity_logs').insert({
            user_id: user?.userId || null,
            user_type: user?.userType || null,
            user_email: userEmail,
            user_name: userName,
            action,
            action_type: actionType,
            resource,
            resource_id: resourceId,
            description,
            ip_address: ipAddress,
            mac_address: macAddress,
            user_agent: req.headers['user-agent'] || null,
            request_method: req.method,
            request_path: req.path,
            status_code: res.statusCode,
            success: res.statusCode >= 200 && res.statusCode < 400,
            metadata: {
              body: req.body,
              query: req.query,
              params: req.params,
            },
          });
        } catch (error) {
          console.error('Error logging activity:', error);
        }
      });

      return originalSend(data);
    };

    next();
  };
};

/**
 * Log authentication attempts
 */
export const logAuthAttempt = async (
  email: string,
  userType: string,
  success: boolean,
  req: Request,
  errorMessage?: string
): Promise<void> => {
  try {
    const ipAddress = getIpAddress(req);
    const macAddress = getMacAddress(req);

    await supabase.from('activity_logs').insert({
      user_email: email,
      user_type: userType,
      action: success ? 'Login Success' : 'Login Failed',
      action_type: 'auth',
      description: success 
        ? `User ${email} logged in successfully` 
        : `Failed login attempt for ${email}`,
      ip_address: ipAddress,
      mac_address: macAddress,
      user_agent: req.headers['user-agent'] || null,
      request_method: req.method,
      request_path: req.path,
      status_code: success ? 200 : 401,
      success,
      error_message: errorMessage || null,
    });
  } catch (error) {
    console.error('Error logging auth attempt:', error);
  }
};
