import { Router } from 'express';
import { CUSAFAInventoryController } from '../controllers/CUSAFAInventoryController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Add verified harvest to inventory - Farmers can add their own, MAO can add any
router.post('/add/:harvestId', authenticate, CUSAFAInventoryController.addToInventory);

// Get all inventory - All authenticated users can view
router.get('/', authenticate, CUSAFAInventoryController.getInventory);

// Get inventory statistics - All authenticated users can view
router.get('/stats', authenticate, CUSAFAInventoryController.getInventoryStats);

// Update and delete not needed - status is in harvests table

export default router;
