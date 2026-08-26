import { db } from '../config/db.js';
import { checkTimetableConflict, calculateGrade, calculateAttendanceStats } from '../utils/academicCalculations.js';

export const academicController = {
  // Timetables
  getTimetables: (req, res) => {
    res.status(200).json({ success: true, timetables: db.getTimetables() });
  },

  addTimetableSlot: (req, res) => {
    const conflictCheck = checkTimetableConflict(db.getTimetables(), req.body);
    if (conflictCheck.hasConflict) {
      return res.status(409).json({
        success: false,
        message: conflictCheck.reason,
        conflict: conflictCheck.conflictingSlot
      });
    }

    const newSlot = db.addTimetable(req.body);
    res.status(201).json({ success: true, message: 'Timetable slot scheduled successfully', slot: newSlot });
  },

  deleteTimetableSlot: (req, res) => {
    db.deleteTimetable(req.params.id);
    res.status(200).json({ success: true, message: 'Timetable slot deleted' });
  },

  // Attendance
  getAttendanceRecords: (req, res) => {
    const records = db.getAttendance();
    const stats = calculateAttendanceStats(records);
    res.status(200).json({ success: true, attendance: records, stats });
  },

  markAttendance: (req, res) => {
    const rec = db.recordAttendance(req.body);
    res.status(200).json({ success: true, message: 'Attendance recorded', record: rec });
  },

  // Assignments & Submissions
  getAssignments: (req, res) => {
    res.status(200).json({
      success: true,
      assignments: db.getAssignments(),
      submissions: db.getSubmissions()
    });
  },

  addAssignment: (req, res) => {
    const newAsn = db.addAssignment(req.body);
    res.status(201).json({ success: true, message: 'Assignment published', assignment: newAsn });
  },

  submitHomework: (req, res) => {
    const sub = db.submitHomework(req.body);
    res.status(201).json({ success: true, message: 'Homework submitted', submission: sub });
  },

  reviewSubmission: (req, res) => {
    const { score, feedback } = req.body;
    const reviewed = db.reviewSubmission(req.params.id, score, feedback);
    res.status(200).json({ success: true, message: 'Submission reviewed', submission: reviewed });
  },

  // Exams & Results
  getExams: (req, res) => {
    res.status(200).json({
      success: true,
      exams: db.getExams(),
      results: db.getResults()
    });
  },

  addExam: (req, res) => {
    const newExm = db.addExam(req.body);
    res.status(201).json({ success: true, message: 'Exam scheduled', exam: newExm });
  },

  saveResult: (req, res) => {
    const { examId, studentId, studentName, subjectCode, marksObtained, totalMarks } = req.body;
    const gradeInfo = calculateGrade(marksObtained, totalMarks);

    const resultData = {
      examId,
      studentId,
      studentName,
      subjectCode,
      marksObtained,
      totalMarks,
      percentage: Math.round((marksObtained / totalMarks) * 100),
      letterGrade: gradeInfo.letter,
      gpa: gradeInfo.gpa,
      remarks: gradeInfo.remark
    };

    const saved = db.saveResult(resultData);
    res.status(200).json({ success: true, message: 'Result recorded', result: saved });
  }
};
