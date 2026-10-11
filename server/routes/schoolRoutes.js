import express from 'express';
import { schoolController } from '../controllers/schoolController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// School Profile
router.get('/profile', schoolController.getSchoolProfile);
router.put('/profile', authenticateToken, requireRole(['Admin']), schoolController.updateSchoolProfile);

// Academic Years & Terms
router.get('/academic-years', schoolController.getAcademicYears);
router.post('/academic-years', authenticateToken, requireRole(['Admin']), schoolController.addAcademicYear);

// Classes & Sections
router.get('/classes', schoolController.getClasses);
router.post('/classes', authenticateToken, requireRole(['Admin']), schoolController.addClass);
router.put('/classes/:id', authenticateToken, requireRole(['Admin']), schoolController.updateClass);
router.delete('/classes/:id', authenticateToken, requireRole(['Admin']), schoolController.deleteClass);

router.get('/sections', schoolController.getSections);
router.post('/sections', authenticateToken, requireRole(['Admin']), schoolController.addSection);
router.put('/sections/:id', authenticateToken, requireRole(['Admin']), schoolController.updateSection);
router.delete('/sections/:id', authenticateToken, requireRole(['Admin']), schoolController.deleteSection);

// Subjects
router.get('/subjects', schoolController.getSubjects);
router.post('/subjects', authenticateToken, requireRole(['Admin']), schoolController.addSubject);
router.put('/subjects/:id', authenticateToken, requireRole(['Admin']), schoolController.updateSubject);
router.delete('/subjects/:id', authenticateToken, requireRole(['Admin']), schoolController.deleteSubject);

export default router;
