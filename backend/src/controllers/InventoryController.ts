// InventoryController.ts - Inventory management controller for MAO
import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export class InventoryController {
  // =====================================================
  // INVENTORY MANAGEMENT (MAO)
  // =====================================================

  // Add verified harvest to inventory
  static async addToInventory(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const {
        harvest_id,
        stock_weight_kg,
        fiber_grade,
        fiber_quality_rating,
        storage_location,
        warehouse_section,
        storage_condition,
        storage_temperature_celsius,
        storage_humidity_percent,
        quality_check_date,
        quality_checked_by,
        quality_notes,
        expiry_date,
        unit_price_per_kg,
        remarks,
        photo_urls
      } = req.body;

      // Verify harvest exists and is verified
      const { data: harvest, error: harvestError } = await supabase
        .from('harvests')
        .select('status, dry_fiber_output_kg')
        .eq('harvest_id', harvest_id)
        .single();

      if (harvestError || !harvest) {
        res.status(404).json({ error: 'Harvest not found' });
        return;
      }

      if (harvest.status !== 'Verified') {
        res.status(400).json({ error: 'Only verified harvests can be added to inventory' });
        return;
      }

      // Check if harvest already in inventory
      const { data: existing } = await supabase
        .from('inventory')
        .select('inventory_id')
        .eq('harvest_id', harvest_id)
        .single();

      if (existing) {
        res.status(400).json({ error: 'Harvest already in inventory' });
        return;
      }

      // Get MAO name
      const { data: user, error: userError } = await supabase
        .from('organization')
        .select('full_name')
        .eq('officer_id', userId)
        .single();

      if (userError || !user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Calculate total value
      const total_value = unit_price_per_kg ? stock_weight_kg * unit_price_per_kg : null;

      // Insert into inventory
      const { data: inventory, error: inventoryError } = await supabase
        .from('inventory')
        .insert({
          mao_id: userId,
          mao_name: user.full_name,
          harvest_id,
          stock_weight_kg,
          current_stock_kg: stock_weight_kg,
          fiber_grade,
          fiber_quality_rating,
          storage_location,
          warehouse_section,
          storage_condition,
          storage_temperature_celsius,
          storage_humidity_percent,
          quality_check_date,
          quality_checked_by,
          quality_notes,
          expiry_date,
          unit_price_per_kg,
          total_value,
          remarks,
          photo_urls,
          status: 'Stocked'
        })
        .select()
        .single();

      if (inventoryError) {
        console.error('❌ Error adding to inventory:', inventoryError);
        res.status(500).json({ error: 'Failed to add to inventory' });
        return;
      }

      console.log('✅ Added to inventory:', inventory.inventory_id);
      res.status(201).json({
        message: 'Added to inventory successfully',
        inventory
      });
    } catch (error) {
      console.error('Error in addToInventory:', error);
      res.status(500).json({ error: 'Failed to add to inventory' });
    }
  }

  // Get all inventory items (MAO sees own, Super Admin sees all)
  static async getAllInventory(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const isSuperAdmin = req.user?.isSuperAdmin;
      const { status, storage_location, fiber_grade, limit = 50, offset = 0 } = req.query;

      let query = supabase
        .from('inventory')
        .select(`
          *,
          harvests:harvest_id (
            farmer_name,
            municipality,
            barangay,
            harvest_date,
            abaca_variety
          )
        `)
        .order('created_at', { ascending: false });

      // Regular MAO sees only their own inventory
      if (!isSuperAdmin) {
        query = query.eq('mao_id', userId);
      }
      // Super Admin sees all

      if (status) {
        query = query.eq('status', status);
      }
      if (storage_location) {
        query = query.eq('storage_location', storage_location);
      }
      if (fiber_grade) {
        query = query.eq('fiber_grade', fiber_grade);
      }

      query = query.range(Number(offset), Number(offset) + Number(limit) - 1);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching inventory:', error);
        res.status(500).json({ error: 'Failed to fetch inventory' });
        return;
      }

      res.status(200).json({ inventory: data || [] });
    } catch (error) {
      console.error('Error in getAllInventory:', error);
      res.status(500).json({ error: 'Failed to fetch inventory' });
    }
  }

  // Get all inventory for Super Admin (sees everything)
  static async getAllInventoryForSuperAdmin(req: Request, res: Response) {
    try {
      const isSuperAdmin = req.user?.isSuperAdmin;

      if (!isSuperAdmin) {
        res.status(403).json({ error: 'Access denied. Super Admin only.' });
        return;
      }

      const { status, storage_location, fiber_grade, limit = 100, offset = 0 } = req.query;

      let query = supabase
        .from('inventory')
        .select(`
          *,
          harvests:harvest_id (
            farmer_name,
            municipality,
            barangay,
            harvest_date,
            abaca_variety
          )
        `)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }
      if (storage_location) {
        query = query.eq('storage_location', storage_location);
      }
      if (fiber_grade) {
        query = query.eq('fiber_grade', fiber_grade);
      }

      query = query.range(Number(offset), Number(offset) + Number(limit) - 1);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching all inventory for super admin:', error);
        res.status(500).json({ error: 'Failed to fetch inventory' });
        return;
      }

      res.status(200).json({ inventory: data || [] });
    } catch (error) {
      console.error('Error in getAllInventoryForSuperAdmin:', error);
      res.status(500).json({ error: 'Failed to fetch inventory' });
    }
  }

  // Get single inventory item
  static async getInventoryById(req: Request, res: Response) {
    try {
      const { inventoryId } = req.params;

      const { data, error } = await supabase
        .from('inventory')
        .select(`
          *,
          harvests:harvest_id (
            *
          ),
          inventory_distributions (
            *
          )
        `)
        .eq('inventory_id', inventoryId)
        .single();

      if (error || !data) {
        res.status(404).json({ error: 'Inventory item not found' });
        return;
      }

      res.status(200).json({ inventory: data });
    } catch (error) {
      console.error('Error in getInventoryById:', error);
      res.status(500).json({ error: 'Failed to fetch inventory item' });
    }
  }

  // Update inventory item
  static async updateInventory(req: Request, res: Response) {
    try {
      const { inventoryId } = req.params;

      const {
        fiber_quality_rating,
        storage_location,
        warehouse_section,
        storage_condition,
        storage_temperature_celsius,
        storage_humidity_percent,
        quality_check_date,
        quality_checked_by,
        quality_notes,
        expiry_date,
        unit_price_per_kg,
        status,
        remarks,
        photo_urls
      } = req.body;

      // Get current inventory
      const { data: current, error: currentError } = await supabase
        .from('inventory')
        .select('stock_weight_kg')
        .eq('inventory_id', inventoryId)
        .single();

      if (currentError || !current) {
        res.status(404).json({ error: 'Inventory item not found' });
        return;
      }

      // Calculate new total value if price changed
      const total_value = unit_price_per_kg ? current.stock_weight_kg * unit_price_per_kg : null;

      const { data, error } = await supabase
        .from('inventory')
        .update({
          fiber_quality_rating,
          storage_location,
          warehouse_section,
          storage_condition,
          storage_temperature_celsius,
          storage_humidity_percent,
          quality_check_date,
          quality_checked_by,
          quality_notes,
          expiry_date,
          unit_price_per_kg,
          total_value,
          status,
          remarks,
          photo_urls
        })
        .eq('inventory_id', inventoryId)
        .select()
        .single();

      if (error) {
        console.error('Error updating inventory:', error);
        res.status(500).json({ error: 'Failed to update inventory' });
        return;
      }

      res.status(200).json({
        message: 'Inventory updated successfully',
        inventory: data
      });
    } catch (error) {
      console.error('Error in updateInventory:', error);
      res.status(500).json({ error: 'Failed to update inventory' });
    }
  }

  // Delete inventory item (only if no distributions)
  static async deleteInventory(req: Request, res: Response) {
    try {
      const { inventoryId } = req.params;

      // Check if there are any distributions
      const { data: distributions } = await supabase
        .from('inventory_distributions')
        .select('distribution_id')
        .eq('inventory_id', inventoryId)
        .limit(1);

      if (distributions && distributions.length > 0) {
        res.status(400).json({ error: 'Cannot delete inventory with existing distributions' });
        return;
      }

      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('inventory_id', inventoryId);

      if (error) {
        console.error('Error deleting inventory:', error);
        res.status(500).json({ error: 'Failed to delete inventory' });
        return;
      }

      res.status(200).json({ message: 'Inventory deleted successfully' });
    } catch (error) {
      console.error('Error in deleteInventory:', error);
      res.status(500).json({ error: 'Failed to delete inventory' });
    }
  }

  // Get inventory statistics
  static async getInventoryStatistics(req: Request, res: Response) {
    try {
      const { data, error } = await supabase
        .from('inventory_statistics')
        .select('*')
        .single();

      if (error) {
        console.error('Error fetching inventory statistics:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
        return;
      }

      res.status(200).json({ statistics: data });
    } catch (error) {
      console.error('Error in getInventoryStatistics:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  }

  // =====================================================
  // DISTRIBUTION MANAGEMENT
  // =====================================================

  // Create distribution
  static async createDistribution(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const {
        inventory_id,
        distribution_date,
        distributed_to,
        recipient_type,
        distributed_weight_kg,
        price_per_kg,
        transport_method,
        destination,
        delivery_receipt_number,
        invoice_number,
        remarks
      } = req.body;

      // Check inventory availability
      const { data: inventory, error: inventoryError } = await supabase
        .from('inventory')
        .select('current_stock_kg, status')
        .eq('inventory_id', inventory_id)
        .single();

      if (inventoryError || !inventory) {
        res.status(404).json({ error: 'Inventory item not found' });
        return;
      }

      if (inventory.current_stock_kg < distributed_weight_kg) {
        res.status(400).json({ 
          error: 'Insufficient stock',
          available: inventory.current_stock_kg,
          requested: distributed_weight_kg
        });
        return;
      }

      // Get distributor name
      const { data: user, error: userError } = await supabase
        .from('organization')
        .select('full_name')
        .eq('officer_id', userId)
        .single();

      if (userError || !user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Calculate total amount
      const total_amount = price_per_kg ? distributed_weight_kg * price_per_kg : null;

      // Create distribution
      const { data: distribution, error: distributionError } = await supabase
        .from('inventory_distributions')
        .insert({
          inventory_id,
          distribution_date: distribution_date || new Date().toISOString().split('T')[0],
          distributed_to,
          recipient_type,
          distributed_weight_kg,
          price_per_kg,
          total_amount,
          distributed_by: userId,
          distributor_name: user.full_name,
          transport_method,
          destination,
          delivery_receipt_number,
          invoice_number,
          remarks
        })
        .select()
        .single();

      if (distributionError) {
        console.error('❌ Error creating distribution:', distributionError);
        res.status(500).json({ error: 'Failed to create distribution' });
        return;
      }

      console.log('✅ Distribution created:', distribution.distribution_id);
      res.status(201).json({
        message: 'Distribution created successfully',
        distribution
      });
    } catch (error) {
      console.error('Error in createDistribution:', error);
      res.status(500).json({ error: 'Failed to create distribution' });
    }
  }

  // Get all distributions
  static async getAllDistributions(req: Request, res: Response) {
    try {
      const { inventory_id, recipient_type, limit = 50, offset = 0 } = req.query;

      let query = supabase
        .from('inventory_distributions')
        .select(`
          *,
          inventory:inventory_id (
            fiber_grade,
            storage_location,
            harvests:harvest_id (
              farmer_name,
              municipality
            )
          )
        `)
        .order('distribution_date', { ascending: false });

      if (inventory_id) {
        query = query.eq('inventory_id', inventory_id);
      }
      if (recipient_type) {
        query = query.eq('recipient_type', recipient_type);
      }

      query = query.range(Number(offset), Number(offset) + Number(limit) - 1);

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching distributions:', error);
        res.status(500).json({ error: 'Failed to fetch distributions' });
        return;
      }

      res.status(200).json({ distributions: data || [] });
    } catch (error) {
      console.error('Error in getAllDistributions:', error);
      res.status(500).json({ error: 'Failed to fetch distributions' });
    }
  }

  // Get distribution by ID
  static async getDistributionById(req: Request, res: Response) {
    try {
      const { distributionId } = req.params;

      const { data, error } = await supabase
        .from('inventory_distributions')
        .select(`
          *,
          inventory:inventory_id (
            *,
            harvests:harvest_id (
              *
            )
          )
        `)
        .eq('distribution_id', distributionId)
        .single();

      if (error || !data) {
        res.status(404).json({ error: 'Distribution not found' });
        return;
      }

      res.status(200).json({ distribution: data });
    } catch (error) {
      console.error('Error in getDistributionById:', error);
      res.status(500).json({ error: 'Failed to fetch distribution' });
    }
  }

  // Get distributions for specific inventory
  static async getInventoryDistributions(req: Request, res: Response) {
    try {
      const { inventoryId } = req.params;

      const { data, error } = await supabase
        .from('inventory_distributions')
        .select('*')
        .eq('inventory_id', inventoryId)
        .order('distribution_date', { ascending: false });

      if (error) {
        console.error('Error fetching inventory distributions:', error);
        res.status(500).json({ error: 'Failed to fetch distributions' });
        return;
      }

      res.status(200).json({ distributions: data || [] });
    } catch (error) {
      console.error('Error in getInventoryDistributions:', error);
      res.status(500).json({ error: 'Failed to fetch distributions' });
    }
  }

  // Get distribution statistics
  static async getDistributionStatistics(req: Request, res: Response) {
    try {
      const { data, error } = await supabase
        .from('inventory_distributions')
        .select('distributed_weight_kg, total_amount, recipient_type, distribution_date');

      if (error) {
        console.error('Error fetching distribution stats:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
        return;
      }

      const stats = {
        total_distributions: data.length,
        total_weight_distributed_kg: data.reduce((sum, d) => sum + (d.distributed_weight_kg || 0), 0),
        total_revenue: data.reduce((sum, d) => sum + (d.total_amount || 0), 0),
        by_recipient_type: {} as Record<string, number>,
        distributions_last_30_days: data.filter(d => {
          const date = new Date(d.distribution_date);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return date >= thirtyDaysAgo;
        }).length
      };

      // Group by recipient type
      data.forEach(d => {
        if (d.recipient_type) {
          stats.by_recipient_type[d.recipient_type] = 
            (stats.by_recipient_type[d.recipient_type] || 0) + (d.distributed_weight_kg || 0);
        }
      });

      res.status(200).json({ statistics: stats });
    } catch (error) {
      console.error('Error in getDistributionStatistics:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  }

  // =====================================================
  // DASHBOARD / REPORTS
  // =====================================================

  // Get MAO dashboard summary
  static async getDashboardSummary(req: Request, res: Response) {
    try {
      // Get inventory stats
      const { data: invStats } = await supabase
        .from('inventory_statistics')
        .select('*')
        .single();

      // Get harvest stats
      const { data: harvestStats } = await supabase
        .from('harvest_statistics')
        .select('*')
        .single();

      // Get recent distributions
      const { data: recentDistributions } = await supabase
        .from('inventory_distributions')
        .select('distributed_weight_kg, total_amount')
        .gte('distribution_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      const distributionTotal = recentDistributions?.reduce((sum, d) => sum + (d.distributed_weight_kg || 0), 0) || 0;
      const revenueTotal = recentDistributions?.reduce((sum, d) => sum + (d.total_amount || 0), 0) || 0;

      res.status(200).json({
        inventory: invStats,
        harvests: harvestStats,
        distributions_last_30_days: {
          count: recentDistributions?.length || 0,
          total_weight_kg: distributionTotal,
          total_revenue: revenueTotal
        }
      });
    } catch (error) {
      console.error('Error in getDashboardSummary:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard summary' });
    }
  }
}
