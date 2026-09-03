import express from 'express';
import { adminController } from '../controllers/adminController.js';
import { authenticateToken, requireRole, requirePasswordChanged } from '../middleware/authMiddleware.js';

const router = express.Router();

// Enforce authentication, ADMIN role, and completed initial password change
router.use(authenticateToken);
router.use(requireRole(['ADMIN']));
router.use(requirePasswordChanged);

// Admin User Management Routes
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.patch('/users/:id/status', adminController.toggleUserStatus);
router.post('/users/:id/reset-password', adminController.resetPassword);

// Admin Metrics & Audit Logs
router.get('/metrics', adminController.getMetrics);
router.get('/auth-logs', adminController.getAuthLogs);

// School Settings
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

export default router;
