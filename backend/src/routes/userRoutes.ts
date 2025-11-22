// userRoutes.ts - User routes
import { Router } from 'express';
import { UserController } from '../controllers/UserController';

const router = Router();

// Define routes
router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);

export default router;