import express from 'express';
import { academicController } from '../controllers/academicController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Timetables
router.get('/timetables', authenticateToken, academicController.getTimetables);
router.post('/timetables', authenticateToken, requireRole(['Admin', 'Teacher']), academicController.addTimetableSlot);
router.delete('/timetables/:id', authenticateToken, requireRole(['Admin']), academicController.deleteTimetableSlot);

// Attendance
router.get('/attendance', authenticateToken, academicController.getAttendanceRecords);
router.post('/attendance', authenticateToken, requireRole(['Admin', 'Teacher']), academicController.markAttendance);

// Assignments
router.get('/assignments', authenticateToken, academicController.getAssignments);
router.post('/assignments', authenticateToken, requireRole(['Admin', 'Teacher']), academicController.addAssignment);
router.post('/submissions', authenticateToken, requireRole(['Student']), academicController.submitHomework);
router.put('/submissions/:id/review', authenticateToken, requireRole(['Admin', 'Teacher']), academicController.reviewSubmission);

// Exams & Results
router.get('/exams', authenticateToken, academicController.getExams);
router.post('/exams', authenticateToken, requireRole(['Admin', 'Teacher']), academicController.addExam);
router.post('/results', authenticateToken, requireRole(['Admin', 'Teacher']), academicController.saveResult);

export default router;
