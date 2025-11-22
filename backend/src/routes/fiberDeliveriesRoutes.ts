import express from 'express';
import { FiberDeliveriesController } from '../controllers/FiberDeliveriesController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create new delivery
router.post('/create', FiberDeliveriesController.createDelivery);

// Get farmer's deliveries
router.get('/farmer/my-deliveries', FiberDeliveriesController.getFarmerDeliveries);

// Get buyer's deliveries
router.get('/buyer/incoming-deliveries', FiberDeliveriesController.getBuyerDeliveries);

// Get CUSAFA deliveries (all deliveries)
router.get('/cusafa/all-deliveries', FiberDeliveriesController.getCUSAFADeliveries);

// CUSAFA updates delivery status
router.put('/cusafa/:deliveryId/status', FiberDeliveriesController.cusafaUpdateStatus);

// Get delivery statistics
router.get('/stats', FiberDeliveriesController.getDeliveryStats);

// Get delivery details
router.get('/:deliveryId', FiberDeliveriesController.getDeliveryDetails);

// Update delivery status
router.put('/:deliveryId/status', FiberDeliveriesController.updateDeliveryStatus);

// Update payment status
router.put('/:deliveryId/payment', FiberDeliveriesController.updatePaymentStatus);

// Upload delivery proof
router.put('/:deliveryId/proof', FiberDeliveriesController.uploadDeliveryProof);

// Cancel delivery
router.delete('/:deliveryId/cancel', FiberDeliveriesController.cancelDelivery);

export default router;
