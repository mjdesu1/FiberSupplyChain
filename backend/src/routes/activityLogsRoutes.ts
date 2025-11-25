// routes/activityLogsRoutes.ts - Activity Logs routes for Super Admin
import { Router } from 'express';
import { ActivityLogsController } from '../controllers/ActivityLogsController';
import { authenticate, authorizeSuperAdmin } from '../middleware/auth';

const router = Router();

// All routes require authentication and super admin privileges
router.use(authenticate, authorizeSuperAdmin);

/**
 * @route   GET /api/activity-logs
 * @desc    Get all activity logs with filters and pagination
 * @access  Super Admin only
 */
router.get('/', ActivityLogsController.getActivityLogs);

/**
 * @route   GET /api/activity-logs/stats
 * @desc    Get activity statistics
 * @access  Super Admin only
 */
router.get('/stats', ActivityLogsController.getActivityStats);

/**
 * @route   GET /api/activity-logs/:id
 * @desc    Get activity log by ID
 * @access  Super Admin only
 */
router.get('/:id', ActivityLogsController.getActivityLogById);

/**
 * @route   GET /api/activity-logs/user/:userId
 * @desc    Get user activity history
 * @access  Super Admin only
 */
router.get('/user/:userId', ActivityLogsController.getUserActivityHistory);

/**
 * @route   DELETE /api/activity-logs
 * @desc    Delete activity logs (bulk delete with filters)
 * @access  Super Admin only
 */
router.delete('/', ActivityLogsController.deleteActivityLogs);

/**
 * @route   GET /api/activity-logs/blocked/ips
 * @desc    Get all blocked IP addresses
 * @access  Super Admin only
 */
router.get('/blocked/ips', ActivityLogsController.getBlockedIPs);

/**
 * @route   POST /api/activity-logs/blocked/ips
 * @desc    Block an IP address
 * @access  Super Admin only
 */
router.post('/blocked/ips', ActivityLogsController.blockIP);

/**
 * @route   PUT /api/activity-logs/blocked/ips/:blockId
 * @desc    Unblock an IP address
 * @access  Super Admin only
 */
router.put('/blocked/ips/:blockId', ActivityLogsController.unblockIP);

/**
 * @route   GET /api/activity-logs/blocked/macs
 * @desc    Get all blocked MAC addresses
 * @access  Super Admin only
 */
router.get('/blocked/macs', ActivityLogsController.getBlockedMACs);

/**
 * @route   POST /api/activity-logs/blocked/macs
 * @desc    Block a MAC address
 * @access  Super Admin only
 */
router.post('/blocked/macs', ActivityLogsController.blockMAC);

/**
 * @route   PUT /api/activity-logs/blocked/macs/:blockId
 * @desc    Unblock a MAC address
 * @access  Super Admin only
 */
router.put('/blocked/macs/:blockId', ActivityLogsController.unblockMAC);

export default router;
