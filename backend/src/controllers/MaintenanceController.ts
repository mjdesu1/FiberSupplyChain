// controllers/MaintenanceController.ts - Maintenance mode management
import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export class MaintenanceController {
  /**
   * Get current maintenance mode status
   * Public endpoint - anyone can check if system is under maintenance
   */
  static async getMaintenanceStatus(req: Request, res: Response): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_value, updated_at, updated_by')
        .eq('setting_key', 'maintenance_mode')
        .single();

      if (error) throw error;

      const isMaintenanceMode = data.setting_value === 'true';

      res.json({
        maintenanceMode: isMaintenanceMode,
        updatedAt: data.updated_at,
        updatedBy: data.updated_by,
      });
    } catch (error) {
      console.error('Error getting maintenance status:', error);
      res.status(500).json({
        error: 'Failed to get maintenance status',
      });
    }
  }

  /**
   * Toggle maintenance mode ON/OFF
   * MAO officers only
   */
  static async toggleMaintenanceMode(req: Request, res: Response): Promise<void> {
    try {
      const { enabled, reason } = req.body;
      const userId = req.user?.userId;
      const ipAddress = req.ip;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      // Update maintenance mode setting
      const { error: updateError } = await supabase
        .from('system_settings')
        .update({
          setting_value: enabled ? 'true' : 'false',
          updated_by: userId,
          updated_at: new Date().toISOString(),
        })
        .eq('setting_key', 'maintenance_mode');

      if (updateError) throw updateError;

      // Log the maintenance mode change
      await supabase.from('maintenance_logs').insert({
        action: enabled ? 'enabled' : 'disabled',
        enabled_by: userId,
        reason: reason || null,
        ip_address: ipAddress,
      });

      console.log(
        `🔧 Maintenance mode ${enabled ? 'ENABLED' : 'DISABLED'} by user ${userId}`
      );

      res.json({
        success: true,
        maintenanceMode: enabled,
        message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'} successfully`,
      });
    } catch (error) {
      console.error('Error toggling maintenance mode:', error);
      res.status(500).json({
        error: 'Failed to toggle maintenance mode',
      });
    }
  }

  /**
   * Get maintenance mode logs
   * MAO officers only
   */
  static async getMaintenanceLogs(req: Request, res: Response): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('maintenance_logs')
        .select(`
          log_id,
          action,
          reason,
          ip_address,
          created_at,
          enabled_by,
          organization!maintenance_logs_enabled_by_fkey (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      res.json({
        logs: data,
      });
    } catch (error) {
      console.error('Error getting maintenance logs:', error);
      res.status(500).json({
        error: 'Failed to get maintenance logs',
      });
    }
  }
}
