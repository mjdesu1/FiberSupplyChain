// seedlingRoutes.ts - Seedling management routes
import { Router } from 'express';
import { SeedlingController } from '../controllers/SeedlingController';
import { authenticate, authorizeMAO } from '../middleware/auth';

const router = Router();

// All seedling routes require authentication
router.use(authenticate);

// MAO routes (require MAO authorization)
router.get('/all', authorizeMAO, SeedlingController.getAllSeedlings);
router.get('/stats', authorizeMAO, SeedlingController.getSeedlingStats);
router.get('/:id', authorizeMAO, SeedlingController.getSeedling);
router.post('/', authorizeMAO, SeedlingController.createSeedling);
router.put('/:id', authorizeMAO, SeedlingController.updateSeedling);
router.delete('/:id', authorizeMAO, SeedlingController.deleteSeedling);

// Farmer routes (farmers can view their own seedlings)
router.get('/farmer/my-seedlings', SeedlingController.getFarmerSeedlings);
router.put('/farmer/:id/mark-planted', SeedlingController.markAsPlanted);

export default router;
