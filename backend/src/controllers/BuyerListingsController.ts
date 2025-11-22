import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export class BuyerListingsController {
  /**
   * Create new price listing with multi-type support
   */
  static async createListing(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const listingData = req.body;

      if (!userId) {
        res.status(401).json({ error: 'User ID not found' });
        return;
      }

      // Validate at least one class is enabled
      if (!listingData.class_a_enabled && !listingData.class_b_enabled && !listingData.class_c_enabled) {
        res.status(400).json({ error: 'At least one abaca class must be enabled' });
        return;
      }

      const { data, error } = await supabase
        .from('buyer_listings')
        .insert({
          buyer_id: userId,
          company_name: listingData.company_name,
          contact_person: listingData.contact_person,
          phone: listingData.phone,
          email: listingData.email,
          location: listingData.location,
          municipality: listingData.municipality,
          barangay: listingData.barangay,
          
          // Class A pricing
          class_a_enabled: listingData.class_a_enabled || false,
          class_a_price: listingData.class_a_enabled ? parseFloat(listingData.class_a_price) : null,
          class_a_image: listingData.class_a_enabled ? listingData.class_a_image : null,
          
          // Class B pricing
          class_b_enabled: listingData.class_b_enabled || false,
          class_b_price: listingData.class_b_enabled ? parseFloat(listingData.class_b_price) : null,
          class_b_image: listingData.class_b_enabled ? listingData.class_b_image : null,
          
          // Class C pricing
          class_c_enabled: listingData.class_c_enabled || false,
          class_c_price: listingData.class_c_enabled ? parseFloat(listingData.class_c_price) : null,
          class_c_image: listingData.class_c_enabled ? listingData.class_c_image : null,
          
          payment_terms: listingData.payment_terms,
          requirements: listingData.requirements,
          availability: listingData.availability,
          valid_until: new Date(new Date().setFullYear(new Date().getFullYear() + 10)).toISOString().split('T')[0] // Auto-set to 10 years from now
        })
        .select()
        .single();

      if (error) throw error;

      res.status(201).json({
        message: 'Price listing created successfully',
        listing: data
      });
    } catch (error) {
      console.error('Error creating listing:', error);
      res.status(500).json({ error: 'Failed to create listing' });
    }
  }

  /**
   * Get buyer's own listings
   */
  static async getMyListings(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({ error: 'User ID not found' });
        return;
      }

      const { data, error } = await supabase
        .from('buyer_listings')
        .select('*')
        .eq('buyer_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.status(200).json({ listings: data });
    } catch (error) {
      console.error('Error fetching listings:', error);
      res.status(500).json({ error: 'Failed to fetch listings' });
    }
  }

  /**
   * Get all active listings (for farmers/MAO/associations/CUSAFA)
   */
  static async getAllListings(req: Request, res: Response) {
    try {
      const { type, municipality, availability } = req.query;

      let query = supabase
        .from('buyer_listings')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply filters
      if (type && type !== 'all') {
        // Filter by enabled class (class_a, class_b, or class_c)
        if (type === 'class_a') {
          query = query.eq('class_a_enabled', true);
        } else if (type === 'class_b') {
          query = query.eq('class_b_enabled', true);
        } else if (type === 'class_c') {
          query = query.eq('class_c_enabled', true);
        }
      }
      if (municipality && municipality !== 'all') {
        query = query.eq('municipality', municipality);
      }
      if (availability && availability !== 'all') {
        query = query.eq('availability', availability);
      }

      const { data, error } = await query;

      if (error) throw error;

      res.status(200).json({ listings: data });
    } catch (error) {
      console.error('Error fetching all listings:', error);
      res.status(500).json({ error: 'Failed to fetch listings' });
    }
  }

  /**
   * Update listing
   */
  static async updateListing(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const { listingId } = req.params;
      const updateData = req.body;

      if (!userId) {
        res.status(401).json({ error: 'User ID not found' });
        return;
      }

      // Verify ownership
      const { data: existing, error: fetchError } = await supabase
        .from('buyer_listings')
        .select('buyer_id')
        .eq('listing_id', listingId)
        .single();

      if (fetchError || !existing) {
        res.status(404).json({ error: 'Listing not found' });
        return;
      }

      if (existing.buyer_id !== userId) {
        res.status(403).json({ error: 'Not authorized to update this listing' });
        return;
      }

      const { data, error } = await supabase
        .from('buyer_listings')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('listing_id', listingId)
        .select()
        .single();

      if (error) throw error;

      res.status(200).json({
        message: 'Listing updated successfully',
        listing: data
      });
    } catch (error) {
      console.error('Error updating listing:', error);
      res.status(500).json({ error: 'Failed to update listing' });
    }
  }

  /**
   * Delete listing
   */
  static async deleteListing(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const { listingId } = req.params;

      if (!userId) {
        res.status(401).json({ error: 'User ID not found' });
        return;
      }

      // Verify ownership
      const { data: existing, error: fetchError } = await supabase
        .from('buyer_listings')
        .select('buyer_id')
        .eq('listing_id', listingId)
        .single();

      if (fetchError || !existing) {
        res.status(404).json({ error: 'Listing not found' });
        return;
      }

      if (existing.buyer_id !== userId) {
        res.status(403).json({ error: 'Not authorized to delete this listing' });
        return;
      }

      const { error } = await supabase
        .from('buyer_listings')
        .delete()
        .eq('listing_id', listingId);

      if (error) throw error;

      res.status(200).json({ message: 'Listing deleted successfully' });
    } catch (error) {
      console.error('Error deleting listing:', error);
      res.status(500).json({ error: 'Failed to delete listing' });
    }
  }
}
