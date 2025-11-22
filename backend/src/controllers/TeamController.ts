import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export class TeamController {
  // Get all team members (public)
  static async getAllTeamMembers(req: Request, res: Response) {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching team members:', error);
        res.status(500).json({ error: 'Failed to fetch team members' });
        return;
      }

      res.status(200).json({ team: data || [] });
    } catch (error) {
      console.error('Error in getAllTeamMembers:', error);
      res.status(500).json({ error: 'Failed to fetch team members' });
    }
  }

  // Get single team member by ID (public)
  static async getTeamMemberById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('member_id', id)
        .single();

      if (error) {
        console.error('Error fetching team member:', error);
        res.status(404).json({ error: 'Team member not found' });
        return;
      }

      res.status(200).json(data);
    } catch (error) {
      console.error('Error in getTeamMemberById:', error);
      res.status(500).json({ error: 'Failed to fetch team member' });
    }
  }

  // Create new team member (super admin only)
  static async createTeamMember(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const isSuperAdmin = req.user?.isSuperAdmin;

      if (!isSuperAdmin) {
        res.status(403).json({ error: 'Only super admins can add team members' });
        return;
      }

      const {
        full_name,
        position,
        photo_url,
        bio,
        email,
        phone,
        display_order
      } = req.body;

      // Validate required fields
      if (!full_name || !position) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const { data, error } = await supabase
        .from('team_members')
        .insert({
          full_name,
          position,
          photo_url,
          bio,
          email,
          phone,
          display_order: display_order || 0,
          created_by: userId
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating team member:', error);
        res.status(500).json({ error: 'Failed to create team member' });
        return;
      }

      res.status(201).json({ message: 'Team member added successfully', member: data });
    } catch (error) {
      console.error('Error in createTeamMember:', error);
      res.status(500).json({ error: 'Failed to create team member' });
    }
  }

  // Update team member (super admin only)
  static async updateTeamMember(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const isSuperAdmin = req.user?.isSuperAdmin;

      if (!isSuperAdmin) {
        res.status(403).json({ error: 'Only super admins can update team members' });
        return;
      }

      const {
        full_name,
        position,
        photo_url,
        bio,
        email,
        phone,
        display_order,
        is_active
      } = req.body;

      const { data, error } = await supabase
        .from('team_members')
        .update({
          full_name,
          position,
          photo_url,
          bio,
          email,
          phone,
          display_order,
          is_active,
          updated_at: new Date().toISOString()
        })
        .eq('member_id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating team member:', error);
        res.status(500).json({ error: 'Failed to update team member' });
        return;
      }

      res.status(200).json({ message: 'Team member updated successfully', member: data });
    } catch (error) {
      console.error('Error in updateTeamMember:', error);
      res.status(500).json({ error: 'Failed to update team member' });
    }
  }

  // Delete team member (super admin only)
  static async deleteTeamMember(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const isSuperAdmin = req.user?.isSuperAdmin;

      if (!isSuperAdmin) {
        res.status(403).json({ error: 'Only super admins can delete team members' });
        return;
      }

      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('member_id', id);

      if (error) {
        console.error('Error deleting team member:', error);
        res.status(500).json({ error: 'Failed to delete team member' });
        return;
      }

      res.status(200).json({ message: 'Team member deleted successfully' });
    } catch (error) {
      console.error('Error in deleteTeamMember:', error);
      res.status(500).json({ error: 'Failed to delete team member' });
    }
  }
}
