// buyersRoutes.ts - Buyers routes
import { Router } from 'express';
import { BuyersController } from '../controllers/BuyersController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Get buyer profile (own or by ID)
router.get('/profile', authenticate, BuyersController.getBuyerProfile);
router.get('/profile/:buyerId', authenticate, BuyersController.getBuyerProfile);

// Update buyer profile and pricing
router.put('/update-profile', authenticate, BuyersController.updateBuyerProfile);

// Get all buyers (for farmers/MAO/associations)
router.get('/all', authenticate, BuyersController.getAllBuyers);

// Get buyer transactions
router.get('/transactions', authenticate, BuyersController.getBuyerTransactions);

export default router;