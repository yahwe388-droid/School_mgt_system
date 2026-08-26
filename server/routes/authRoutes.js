import express from 'express';
import { authController } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', authController.login);
router.get('/me', authenticateToken, authController.getMe);
router.post('/logout', authenticateToken, authController.logout);

export default router;
