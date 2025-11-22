// associationSeedlingRoutes.ts - Association-based seedling distribution routes
import { Router } from 'express';
import { AssociationSeedlingController } from '../controllers/AssociationSeedlingController';
import { authenticate, authorizeMAO, authorizeCUSAFA, authorizeAssociation } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// =====================================================
// MAO ROUTES (MAO officers managing association distributions)
// =====================================================

// MAO: Get all association distributions
router.get('/mao/associations', authorizeMAO, AssociationSeedlingController.getAllAssociationDistributions);

// MAO: Create new distribution to association
router.post('/mao/distribute-to-association', authorizeMAO, AssociationSeedlingController.createAssociationDistribution);

// MAO: Update association distribution
router.put('/mao/associations/:id', authorizeMAO, AssociationSeedlingController.updateAssociationDistribution);

// MAO: Delete association distribution
router.delete('/mao/associations/:id', authorizeMAO, AssociationSeedlingController.deleteAssociationDistribution);

// MAO: Get distribution statistics
router.get('/mao/stats', authorizeMAO, AssociationSeedlingController.getDistributionStats);

// =====================================================
// ASSOCIATION ROUTES (Association officers managing farmer distributions)
// =====================================================

// Association: Get distributions received from MAO
router.get('/association/received', authorizeAssociation, AssociationSeedlingController.getAssociationReceivedDistributions);

// Association: Get farmers under association
router.get('/association/farmers', authorizeAssociation, AssociationSeedlingController.getAssociationFarmers);

// Association: Distribute seedlings to farmers
router.post('/association/distribute-to-farmers', authorizeAssociation, AssociationSeedlingController.distributeSeedlingsToFarmers);

// Association: Get farmer distributions made by association
router.get('/association/farmer-distributions', authorizeAssociation, AssociationSeedlingController.getAssociationFarmerDistributions);

// Association: Delete farmer distribution
router.delete('/association/farmer-distributions/:id', authorizeAssociation, AssociationSeedlingController.deleteFarmerDistribution);

// Association: Update received distribution (remarks, etc.)
router.put('/association/received/:id', authorizeAssociation, AssociationSeedlingController.updateAssociationReceivedDistribution);

// Association: Delete received distribution
router.delete('/association/received/:id', authorizeAssociation, AssociationSeedlingController.deleteAssociationReceivedDistribution);

// Association: Get distribution statistics
router.get('/association/stats', authorizeAssociation, AssociationSeedlingController.getDistributionStats);

// =====================================================
// FARMER ROUTES (Farmers viewing their received seedlings)
// =====================================================

// Farmer: Get seedlings received from association
router.get('/farmer/received', AssociationSeedlingController.getFarmerReceivedSeedlings);

// Farmer: Mark seedlings as planted
router.put('/farmer/:id/mark-planted', AssociationSeedlingController.markSeedlingsAsPlanted);

// =====================================================
// CUSAFA ROUTES (CUSAFA viewing all distribution data)
// =====================================================

// CUSAFA: Get comprehensive distribution data
router.get('/cusafa/all-distributions', authorizeCUSAFA, AssociationSeedlingController.getCUSAFADistributionData);

// CUSAFA: Get distribution statistics
router.get('/cusafa/stats', authorizeCUSAFA, AssociationSeedlingController.getDistributionStats);

export default router;