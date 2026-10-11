import express from 'express';
import { academicController } from '../controllers/academicController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Timetables
router.get('/timetables', authenticateToken, academicController.getTimetables);
router.get('/timetables/section/:sectionId', authenticateToken, academicController.getTimetableBySection);
router.get('/timetables/:id', authenticateToken, academicController.getTimetableById);
router.post('/timetables/save', authenticateToken, requireRole(['Admin']), academicController.saveTimetable);
router.post('/timetables/validate', authenticateToken, requireRole(['Admin']), academicController.validateTimetableEntries);
router.post('/timetables/:id/publish', authenticateToken, requireRole(['Admin']), academicController.publishTimetable);
router.post('/timetables', authenticateToken, requireRole(['Admin', 'Teacher']), academicController.saveTimetable);
router.put('/timetables/:id', authenticateToken, requireRole(['Admin']), academicController.saveTimetable);
router.delete('/timetables/:id', authenticateToken, requireRole(['Admin']), academicController.deleteTimetable);

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
