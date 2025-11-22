// inventoryRoutes.ts - Routes for inventory management
import { Router } from 'express';
import { InventoryController } from '../controllers/InventoryController';
import { authenticate, authorizeRoles } from '../middleware/auth';

const router = Router();

// =====================================================
// INVENTORY MANAGEMENT ROUTES (MAO)
// =====================================================

// Add verified harvest to inventory
router.post(
  '/inventory',
  authenticate,
  authorizeRoles('officer'),
  InventoryController.addToInventory
);

// Get all inventory items (MAO sees own, Super Admin sees all)
router.get(
  '/inventory',
  authenticate,
  authorizeRoles('officer'),
  InventoryController.getAllInventory
);

// Get all inventory for Super Admin
router.get(
  '/admin/inventory/all',
  authenticate,
  authorizeRoles('officer'),
  InventoryController.getAllInventoryForSuperAdmin
);

// Get inventory statistics
router.get(
  '/inventory/statistics',
  authenticate,
  authorizeRoles('officer'),
  InventoryController.getInventoryStatistics
);

// Get dashboard summary
router.get(
  '/inventory/dashboard',
  authenticate,
  authorizeRoles('officer'),
  InventoryController.getDashboardSummary
);

// Get single inventory item
router.get(
  '/inventory/:inventoryId',
  authenticate,
  authorizeRoles('officer'),
  InventoryController.getInventoryById
);

// Update inventory item
router.put(
  '/inventory/:inventoryId',
  authenticate,
  authorizeRoles('officer'),
  InventoryController.updateInventory
);

// Delete inventory item
router.delete(
  '/inventory/:inventoryId',
  authenticate,
  authorizeRoles('officer'),
  InventoryController.deleteInventory
);

// =====================================================
// DISTRIBUTION MANAGEMENT ROUTES (MAO)
// =====================================================

// Create distribution
router.post(
  '/distributions',
  authenticate,
  authorizeRoles('officer'),
  InventoryController.createDistribution
);

// Get all distributions
router.get(
  '/distributions',
  authenticate,
  authorizeRoles('officer'),
  InventoryController.getAllDistributions
);

// Get distribution statistics
router.get(
  '/distributions/statistics',
  authenticate,
  authorizeRoles('officer'),
  InventoryController.getDistributionStatistics
);

// Get single distribution
router.get(
  '/distributions/:distributionId',
  authenticate,
  authorizeRoles('officer'),
  InventoryController.getDistributionById
);

// Get distributions for specific inventory
router.get(
  '/inventory/:inventoryId/distributions',
  authenticate,
  authorizeRoles('officer'),
  InventoryController.getInventoryDistributions
);

export default router;
