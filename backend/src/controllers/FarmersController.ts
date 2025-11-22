// FarmersController.ts - Farmers controller
import { Request, Response } from 'express';
import { FarmersService } from '../services/FarmersService';
import { supabase } from '../config/supabase';

export class FarmersController {
  // Get farmer profile
  static async getFarmerProfile(req: Request, res: Response) {
    try {
      const farmerProfile = await FarmersService.getFarmerProfile();
      res.status(200).json(farmerProfile);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch farmer profile' });
    }
  }

  // Get farmer listings
  static async getFarmerListings(req: Request, res: Response) {
    try {
      const listings = await FarmersService.getFarmerListings();
      res.status(200).json(listings);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch farmer listings' });
    }
  }

  // Update farmer profile (farmer updates their own profile)
  static async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const {
        full_name,
        contact_number,
        address,
        sex,
        age,
        barangay,
        municipality,
        association_name,
        profilePhoto
      } = req.body;

      console.log('📝 Farmer updating profile:', {
        userId,
        full_name,
        contact_number,
        address
      });

      // Update farmer profile
      const { data, error } = await supabase
        .from('farmers')
        .update({
          full_name,
          contact_number,
          address,
          sex,
          age: age ? parseInt(age) : null,
          barangay,
          municipality,
          association_name,
          profile_photo: profilePhoto || null,
          updated_at: new Date().toISOString()
        })
        .eq('farmer_id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating farmer profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
        return;
      }

      console.log('✅ Farmer profile updated:', {
        full_name: data.full_name,
        contact_number: data.contact_number,
        address: data.address
      });

      res.status(200).json({
        message: 'Profile updated successfully',
        farmer: data
      });
    } catch (error) {
      console.error('Error in updateProfile:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }

  // Get farmer's own monitoring records
  static async getMyMonitoringRecords(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Fetch monitoring records for this farmer
      const { data, error } = await supabase
        .from('monitoring_records')
        .select('*')
        .eq('farmer_id', userId)
        .order('date_of_visit', { ascending: false });

      if (error) {
        console.error('Error fetching farmer monitoring records:', error);
        res.status(500).json({ error: 'Failed to fetch monitoring records' });
        return;
      }

      res.status(200).json({ records: data || [] });
    } catch (error) {
      console.error('Error in getMyMonitoringRecords:', error);
      res.status(500).json({ error: 'Failed to fetch monitoring records' });
    }
  }
}