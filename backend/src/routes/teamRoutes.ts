import express from 'express';
import { TeamController } from '../controllers/TeamController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', TeamController.getAllTeamMembers);
router.get('/:id', TeamController.getTeamMemberById);

// Protected routes (super admin only)
router.post('/', authenticate, TeamController.createTeamMember);
router.put('/:id', authenticate, TeamController.updateTeamMember);
router.delete('/:id', authenticate, TeamController.deleteTeamMember);

export default router;
