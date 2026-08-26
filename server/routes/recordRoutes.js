import express from 'express';
import { recordController } from '../controllers/recordController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Phase 2 Dashboard Metrics
router.get('/summary', recordController.getPhase2Summary);

// Student CRUD
router.get('/students', authenticateToken, recordController.getStudents);
router.post('/students', authenticateToken, requireRole(['Admin']), recordController.addStudent);
router.put('/students/:id', authenticateToken, requireRole(['Admin']), recordController.updateStudent);
router.delete('/students/:id', authenticateToken, requireRole(['Admin']), recordController.deleteStudent);

// Teacher CRUD
router.get('/teachers', authenticateToken, recordController.getTeachers);
router.post('/teachers', authenticateToken, requireRole(['Admin']), recordController.addTeacher);
router.put('/teachers/:id', authenticateToken, requireRole(['Admin']), recordController.updateTeacher);
router.delete('/teachers/:id', authenticateToken, requireRole(['Admin']), recordController.deleteTeacher);

// Parent CRUD
router.get('/parents', authenticateToken, recordController.getParents);
router.post('/parents', authenticateToken, requireRole(['Admin']), recordController.addParent);
router.put('/parents/:id', authenticateToken, requireRole(['Admin']), recordController.updateParent);
router.delete('/parents/:id', authenticateToken, requireRole(['Admin']), recordController.deleteParent);

export default router;
