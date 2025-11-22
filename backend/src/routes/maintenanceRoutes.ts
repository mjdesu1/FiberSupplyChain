// routes/maintenanceRoutes.ts - Maintenance mode routes
import { Router } from 'express';
import { MaintenanceController } from '../controllers/MaintenanceController';
import { authenticate, authorizeSuperAdmin } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/maintenance/status
 * @desc    Get current maintenance mode status
 * @access  Public
 */
router.get('/status', MaintenanceController.getMaintenanceStatus);

/**
 * @route   POST /api/maintenance/toggle
 * @desc    Toggle maintenance mode ON/OFF
 * @access  Super Admin officers only
 */
router.post('/toggle', authenticate, authorizeSuperAdmin, MaintenanceController.toggleMaintenanceMode);

/**
 * @route   GET /api/maintenance/logs
 * @desc    Get maintenance mode change logs
 * @access  Super Admin officers only
 */
router.get('/logs', authenticate, authorizeSuperAdmin, MaintenanceController.getMaintenanceLogs);

export default router;
