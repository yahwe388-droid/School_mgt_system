import express from 'express';
import { communicationController } from '../controllers/communicationController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Announcements
router.get('/announcements', authenticateToken, communicationController.getAnnouncements);
router.post('/announcements', authenticateToken, requireRole(['Admin', 'Teacher']), communicationController.addAnnouncement);

// Notifications
router.get('/notifications', authenticateToken, communicationController.getNotifications);
router.post('/notifications/:id/read', authenticateToken, communicationController.markNotificationRead);

// Reports & Analytics
router.get('/reports/student/:studentId', authenticateToken, communicationController.getStudentReportCard);
router.get('/analytics', authenticateToken, communicationController.getAnalytics);

export default router;
