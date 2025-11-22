import express from 'express';
import { ArticlesController } from '../controllers/ArticlesController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', ArticlesController.getAllArticles);
router.get('/:id', ArticlesController.getArticleById);

// Protected routes (super admin only)
router.post('/', authenticate, ArticlesController.createArticle);
router.put('/:id', authenticate, ArticlesController.updateArticle);
router.delete('/:id', authenticate, ArticlesController.deleteArticle);

export default router;
