import { Router } from 'express';
import { BuyerListingsController } from '../controllers/BuyerListingsController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Create new listing
router.post('/create', authenticate, BuyerListingsController.createListing);

// Get buyer's own listings
router.get('/', authenticate, BuyerListingsController.getMyListings);

// Get all active listings (for farmers/MAO/associations)
router.get('/all', authenticate, BuyerListingsController.getAllListings);

// Update listing
router.put('/:listingId', authenticate, BuyerListingsController.updateListing);

// Delete listing
router.delete('/:listingId', authenticate, BuyerListingsController.deleteListing);

export default router;
