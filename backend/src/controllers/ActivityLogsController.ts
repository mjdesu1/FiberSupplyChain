// controllers/ActivityLogsController.ts - Activity Logs Management for Super Admin
import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export class ActivityLogsController {
  /**
   * Get all activity logs with filters and pagination
   * Super Admin only
   */
  static async getActivityLogs(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 50,
        userType,
        actionType,
        userId,
        startDate,
        endDate,
        ipAddress,
        search,
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);

      // Build query
      let query = supabase
        .from('activity_logs')
        .select('*', { count: 'exact' });

      // Apply filters
      if (userType) {
        query = query.eq('user_type', userType);
      }
      if (actionType) {
        query = query.eq('action_type', actionType);
      }
      if (userId) {
        query = query.eq('user_id', userId);
      }
      if (ipAddress) {
        query = query.eq('ip_address', ipAddress);
      }
      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }
      if (search) {
        query = query.or(`user_email.ilike.%${search}%,user_name.ilike.%${search}%,description.ilike.%${search}%`);
      }

      // Apply pagination and ordering
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + Number(limit) - 1);

      if (error) throw error;

      res.json({
        logs: data || [],
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: count || 0,
          totalPages: Math.ceil((count || 0) / Number(limit)),
        },
      });
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      res.status(500).json({
        error: 'Failed to fetch activity logs',
      });
    }
  }

  /**
   * Get activity log by ID
   * Super Admin only
   */
  static async getActivityLogById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('log_id', id)
        .single();

      if (error) throw error;

      if (!data) {
        res.status(404).json({ error: 'Activity log not found' });
        return;
      }

      res.json(data);
    } catch (error) {
      console.error('Error fetching activity log:', error);
      res.status(500).json({
        error: 'Failed to fetch activity log',
      });
    }
  }

  /**
   * Get activity statistics
   * Super Admin only
   */
  static async getActivityStats(req: Request, res: Response): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      // Build base query
      let query = supabase.from('activity_logs').select('*');

      if (startDate) {
        query = query.gte('created_at', startDate);
      }
      if (endDate) {
        query = query.lte('created_at', endDate);
      }

      const { data: logs, error } = await query;

      if (error) throw error;

      // Calculate statistics
      const stats = {
        totalLogs: logs?.length || 0,
        byUserType: {} as Record<string, number>,
        byActionType: {} as Record<string, number>,
        successRate: 0,
        uniqueUsers: new Set(),
        uniqueIPs: new Set(),
        recentActivity: logs?.slice(0, 10) || [],
      };

      logs?.forEach((log) => {
        // Count by user type
        if (log.user_type) {
          stats.byUserType[log.user_type] = (stats.byUserType[log.user_type] || 0) + 1;
        }

        // Count by action type
        if (log.action_type) {
          stats.byActionType[log.action_type] = (stats.byActionType[log.action_type] || 0) + 1;
        }

        // Track unique users and IPs
        if (log.user_id) stats.uniqueUsers.add(log.user_id);
        if (log.ip_address) stats.uniqueIPs.add(log.ip_address);
      });

      // Calculate success rate
      const successfulLogs = logs?.filter((log) => log.success).length || 0;
      stats.successRate = logs?.length ? (successfulLogs / logs.length) * 100 : 0;

      res.json({
        ...stats,
        uniqueUsers: stats.uniqueUsers.size,
        uniqueIPs: stats.uniqueIPs.size,
      });
    } catch (error) {
      console.error('Error fetching activity stats:', error);
      res.status(500).json({
        error: 'Failed to fetch activity statistics',
      });
    }
  }

  /**
   * Get user activity history
   * Super Admin only
   */
  static async getUserActivityHistory(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { limit = 100 } = req.query;

      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(Number(limit));

      if (error) throw error;

      res.json({
        userId,
        logs: data || [],
      });
    } catch (error) {
      console.error('Error fetching user activity history:', error);
      res.status(500).json({
        error: 'Failed to fetch user activity history',
      });
    }
  }

  /**
   * Get blocked IPs
   * Super Admin only
   */
  static async getBlockedIPs(req: Request, res: Response): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('blocked_ips')
        .select(`
          *,
          blocker:organization!blocked_ips_blocked_by_fkey(full_name, email),
          unblocker:organization!blocked_ips_unblocked_by_fkey(full_name, email)
        `)
        .order('blocked_at', { ascending: false });

      if (error) throw error;

      res.json({
        blockedIPs: data || [],
      });
    } catch (error) {
      console.error('Error fetching blocked IPs:', error);
      res.status(500).json({
        error: 'Failed to fetch blocked IPs',
      });
    }
  }

  /**
   * Block an IP address
   * Super Admin only
   */
  static async blockIP(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { ipAddress, reason, expiresAt, isPermanent, notes } = req.body;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      if (!ipAddress || !reason) {
        res.status(400).json({ error: 'IP address and reason are required' });
        return;
      }

      // Check if IP is already blocked
      const { data: existing } = await supabase
        .from('blocked_ips')
        .select('*')
        .eq('ip_address', ipAddress)
        .eq('is_active', true)
        .single();

      if (existing) {
        res.status(400).json({ error: 'IP address is already blocked' });
        return;
      }

      const { data, error } = await supabase
        .from('blocked_ips')
        .insert({
          ip_address: ipAddress,
          reason,
          blocked_by: userId,
          expires_at: expiresAt || null,
          is_permanent: isPermanent || false,
          notes: notes || null,
        })
        .select()
        .single();

      if (error) throw error;

      console.log(`🚫 IP ${ipAddress} blocked by user ${userId}`);

      res.json({
        success: true,
        message: 'IP address blocked successfully',
        block: data,
      });
    } catch (error) {
      console.error('Error blocking IP:', error);
      res.status(500).json({
        error: 'Failed to block IP address',
      });
    }
  }

  /**
   * Unblock an IP address
   * Super Admin only
   */
  static async unblockIP(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { blockId } = req.params;
      const { reason } = req.body;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { data, error } = await supabase
        .from('blocked_ips')
        .update({
          is_active: false,
          unblocked_by: userId,
          unblocked_at: new Date().toISOString(),
          unblock_reason: reason || 'Unblocked by admin',
        })
        .eq('block_id', blockId)
        .select()
        .single();

      if (error) throw error;

      console.log(`✅ IP block ${blockId} removed by user ${userId}`);

      res.json({
        success: true,
        message: 'IP address unblocked successfully',
        block: data,
      });
    } catch (error) {
      console.error('Error unblocking IP:', error);
      res.status(500).json({
        error: 'Failed to unblock IP address',
      });
    }
  }

  /**
   * Get blocked MAC addresses
   * Super Admin only
   */
  static async getBlockedMACs(req: Request, res: Response): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('blocked_macs')
        .select(`
          *,
          blocker:organization!blocked_macs_blocked_by_fkey(full_name, email),
          unblocker:organization!blocked_macs_unblocked_by_fkey(full_name, email)
        `)
        .order('blocked_at', { ascending: false });

      if (error) throw error;

      res.json({
        blockedMACs: data || [],
      });
    } catch (error) {
      console.error('Error fetching blocked MACs:', error);
      res.status(500).json({
        error: 'Failed to fetch blocked MAC addresses',
      });
    }
  }

  /**
   * Block a MAC address
   * Super Admin only
   */
  static async blockMAC(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { macAddress, reason, expiresAt, isPermanent, notes } = req.body;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      if (!macAddress || !reason) {
        res.status(400).json({ error: 'MAC address and reason are required' });
        return;
      }

      // Check if MAC is already blocked
      const { data: existing } = await supabase
        .from('blocked_macs')
        .select('*')
        .eq('mac_address', macAddress)
        .eq('is_active', true)
        .single();

      if (existing) {
        res.status(400).json({ error: 'MAC address is already blocked' });
        return;
      }

      const { data, error } = await supabase
        .from('blocked_macs')
        .insert({
          mac_address: macAddress,
          reason,
          blocked_by: userId,
          expires_at: expiresAt || null,
          is_permanent: isPermanent || false,
          notes: notes || null,
        })
        .select()
        .single();

      if (error) throw error;

      console.log(`🚫 MAC ${macAddress} blocked by user ${userId}`);

      res.json({
        success: true,
        message: 'MAC address blocked successfully',
        block: data,
      });
    } catch (error) {
      console.error('Error blocking MAC:', error);
      res.status(500).json({
        error: 'Failed to block MAC address',
      });
    }
  }

  /**
   * Unblock a MAC address
   * Super Admin only
   */
  static async unblockMAC(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const { blockId } = req.params;
      const { reason } = req.body;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const { data, error } = await supabase
        .from('blocked_macs')
        .update({
          is_active: false,
          unblocked_by: userId,
          unblocked_at: new Date().toISOString(),
          unblock_reason: reason || 'Unblocked by admin',
        })
        .eq('block_id', blockId)
        .select()
        .single();

      if (error) throw error;

      console.log(`✅ MAC block ${blockId} removed by user ${userId}`);

      res.json({
        success: true,
        message: 'MAC address unblocked successfully',
        block: data,
      });
    } catch (error) {
      console.error('Error unblocking MAC:', error);
      res.status(500).json({
        error: 'Failed to unblock MAC address',
      });
    }
  }

  /**
   * Delete activity logs (bulk delete with filters)
   * Super Admin only - Use with caution
   */
  static async deleteActivityLogs(req: Request, res: Response): Promise<void> {
    try {
      const { olderThan, userType, actionType } = req.body;

      if (!olderThan) {
        res.status(400).json({ error: 'olderThan date is required for bulk delete' });
        return;
      }

      let query = supabase
        .from('activity_logs')
        .delete()
        .lt('created_at', olderThan);

      if (userType) {
        query = query.eq('user_type', userType);
      }
      if (actionType) {
        query = query.eq('action_type', actionType);
      }

      const { error, count } = await query;

      if (error) throw error;

      console.log(`🗑️ Deleted ${count} activity logs older than ${olderThan}`);

      res.json({
        success: true,
        message: `Deleted ${count} activity logs`,
        deletedCount: count,
      });
    } catch (error) {
      console.error('Error deleting activity logs:', error);
      res.status(500).json({
        error: 'Failed to delete activity logs',
      });
    }
  }
}
