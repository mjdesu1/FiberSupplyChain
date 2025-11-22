import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export class CUSAFAInventoryController {
  /**
   * Add verified harvest to CUSAFA inventory
   */
  static async addToInventory(req: Request, res: Response) {
    try {
      const { harvestId } = req.params;
      const { notes, location, shelfNumber } = req.body;
      const userId = req.user?.userId;
      const userType = req.user?.userType;

      if (!userId) {
        res.status(401).json({ error: 'User ID not found' });
        return;
      }

      // Get harvest details
      const { data: harvest, error: harvestError } = await supabase
        .from('harvests')
        .select(`
          harvest_id,
          farmer_id,
          abaca_variety,
          dry_fiber_output_kg,
          harvest_date,
          fiber_grade,
          status
        `)
        .eq('harvest_id', harvestId)
        .single();

      if (harvestError || !harvest) {
        console.error('Harvest lookup error:', harvestError);
        res.status(404).json({ error: 'Harvest not found' });
        return;
      }

      // If user is a farmer, check if it's their own harvest
      if (userType === 'farmer' && harvest.farmer_id !== userId) {
        res.status(403).json({ error: 'You can only add your own harvests to inventory' });
        return;
      }

      // Check if harvest is verified
      if (harvest.status !== 'Verified') {
        res.status(400).json({ error: 'Only verified harvests can be added to inventory' });
        return;
      }

      // Check if already in inventory (check harvest status)
      if (harvest.status === 'In Inventory') {
        res.status(400).json({ error: 'Harvest already in inventory' });
        return;
      }

      // Update harvest status to "In Inventory"
      const { data, error } = await supabase
        .from('harvests')
        .update({ 
          status: 'In Inventory',
          remarks: notes || null
        })
        .eq('harvest_id', harvestId)
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({
        message: 'Harvest added to CUSAFA inventory successfully',
        inventory: data
      });
    } catch (error) {
      console.error('Error adding to inventory:', error);
      res.status(500).json({ error: 'Failed to add to inventory' });
    }
  }

  /**
   * Get all CUSAFA inventory (from harvests table)
   */
  static async getInventory(req: Request, res: Response) {
    try {
      const { variety, farmer_id, date_from, date_to } = req.query;

      let query = supabase
        .from('harvests')
        .select(`
          harvest_id,
          farmer_id,
          farmer_name,
          abaca_variety,
          dry_fiber_output_kg,
          harvest_date,
          fiber_grade,
          status,
          municipality,
          barangay,
          remarks,
          created_at,
          farmers:farmer_id (
            farmer_id,
            full_name,
            email,
            municipality,
            barangay,
            association_name
          )
        `)
        .eq('status', 'In Inventory')
        .order('created_at', { ascending: false });

      // Apply filters
      if (variety) {
        query = query.eq('abaca_variety', variety);
      }
      if (farmer_id) {
        query = query.eq('farmer_id', farmer_id);
      }
      if (date_from) {
        query = query.gte('harvest_date', date_from);
      }
      if (date_to) {
        query = query.lte('harvest_date', date_to);
      }

      const { data, error } = await query;

      if (error) throw error;

      res.status(200).json({ inventory: data });
    } catch (error) {
      console.error('Error fetching inventory:', error);
      res.status(500).json({ error: 'Failed to fetch inventory' });
    }
  }

  /**
   * Get inventory statistics (from harvests table)
   */
  static async getInventoryStats(req: Request, res: Response) {
    try {
      const { data: inventory, error } = await supabase
        .from('harvests')
        .select('dry_fiber_output_kg, abaca_variety')
        .eq('status', 'In Inventory');

      if (error) throw error;

      const stats = {
        totalQuantity: inventory?.reduce((sum, item) => sum + parseFloat(item.dry_fiber_output_kg || '0'), 0) || 0,
        inStock: inventory?.reduce((sum, item) => sum + parseFloat(item.dry_fiber_output_kg || '0'), 0) || 0,
        totalItems: inventory?.length || 0,
        byVariety: inventory?.reduce((acc: any, item) => {
          acc[item.abaca_variety] = (acc[item.abaca_variety] || 0) + parseFloat(item.dry_fiber_output_kg || '0');
          return acc;
        }, {}) || {}
      };

      res.status(200).json({ stats });
    } catch (error) {
      console.error('Error fetching inventory stats:', error);
      res.status(500).json({ error: 'Failed to fetch inventory stats' });
    }
  }

  /**
   * Update inventory item
   */
  static async updateInventory(req: Request, res: Response) {
    try {
      const { inventoryId } = req.params;
      const { status, location, shelfNumber, notes } = req.body;

      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (status) updateData.status = status;
      if (location) updateData.location = location;
      if (shelfNumber !== undefined) updateData.shelf_number = shelfNumber;
      if (notes !== undefined) updateData.notes = notes;

      const { data, error } = await supabase
        .from('cusafa_inventory')
        .update(updateData)
        .eq('inventory_id', inventoryId)
        .select()
        .single();

      if (error) throw error;

      res.status(200).json({
        message: 'Inventory updated successfully',
        inventory: data
      });
    } catch (error) {
      console.error('Error updating inventory:', error);
      res.status(500).json({ error: 'Failed to update inventory' });
    }
  }

  /**
   * Delete inventory item
   */
  static async deleteInventory(req: Request, res: Response) {
    try {
      const { inventoryId } = req.params;

      const { error } = await supabase
        .from('cusafa_inventory')
        .delete()
        .eq('inventory_id', inventoryId);

      if (error) throw error;

      res.status(200).json({ message: 'Inventory item deleted successfully' });
    } catch (error) {
      console.error('Error deleting inventory:', error);
      res.status(500).json({ error: 'Failed to delete inventory' });
    }
  }
}
