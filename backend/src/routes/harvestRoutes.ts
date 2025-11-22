// harvestRoutes.ts - Routes for harvest management
import { Router } from 'express';
import { HarvestController } from '../controllers/HarvestController';
import { authenticate, authorizeRoles } from '../middleware/auth';

const router = Router();

// =====================================================
// FARMER ROUTES - Harvest Submissions
// =====================================================

// Create new harvest
router.post(
  '/farmer/harvests',
  authenticate,
  authorizeRoles('farmer'),
  HarvestController.createHarvest
);

// Get farmer's own harvests
router.get(
  '/farmer/harvests',
  authenticate,
  authorizeRoles('farmer'),
  HarvestController.getMyHarvests
);

// Get farmer's harvest statistics
router.get(
  '/farmer/harvests/statistics',
  authenticate,
  authorizeRoles('farmer'),
  HarvestController.getMyHarvestStats
);

// Get single harvest (farmer's own)
router.get(
  '/farmer/harvests/:harvestId',
  authenticate,
  authorizeRoles('farmer'),
  HarvestController.getHarvestById
);

// Update harvest (only if pending)
router.put(
  '/farmer/harvests/:harvestId',
  authenticate,
  authorizeRoles('farmer'),
  HarvestController.updateHarvest
);

// Delete harvest (only if pending)
router.delete(
  '/farmer/harvests/:harvestId',
  authenticate,
  authorizeRoles('farmer'),
  HarvestController.deleteHarvest
);

// =====================================================
// MAO/ADMIN ROUTES - Harvest Verification & Management
// =====================================================

// Get all harvests (MAO sees own, Super Admin sees all)
router.get(
  '/mao/harvests',
  authenticate,
  authorizeRoles('officer'),
  HarvestController.getAllHarvests
);

// Get all harvests for Super Admin (sees everything)
router.get(
  '/admin/harvests/all',
  authenticate,
  authorizeRoles('officer'), // Super Admin is also officer type
  HarvestController.getAllHarvestsForSuperAdmin
);

// Get harvest statistics
router.get(
  '/mao/harvests/statistics',
  authenticate,
  authorizeRoles('officer'),
  HarvestController.getHarvestStatistics
);

// Get farmer harvest summary
router.get(
  '/mao/harvests/farmers/summary',
  authenticate,
  authorizeRoles('officer'),
  HarvestController.getFarmerHarvestSummary
);

// Verify harvest
router.post(
  '/mao/harvests/:harvestId/verify',
  authenticate,
  authorizeRoles('officer'),
  HarvestController.verifyHarvest
);

// Reject harvest
router.post(
  '/mao/harvests/:harvestId/reject',
  authenticate,
  authorizeRoles('officer'),
  HarvestController.rejectHarvest
);

export default router;