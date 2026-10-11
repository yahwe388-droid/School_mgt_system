import { db } from '../config/db.js';
import { checkTimetableConflict, calculateGrade, calculateAttendanceStats } from '../utils/academicCalculations.js';

export const academicController = {
  // Timetables
  getTimetables: (req, res) => {
    const { classId, sectionId, academicYearId, termId, status } = req.query;

    if (sectionId) {
      const master = db.findTimetableMaster(classId, sectionId, academicYearId, termId);
      if (master) {
        return res.status(200).json({
          success: true,
          timetable: master,
          timetables: master.entries || [],
          masters: [master]
        });
      }
      return res.status(200).json({
        success: true,
        timetable: null,
        timetables: [],
        masters: []
      });
    }

    let masters = db.getTimetableMasters ? db.getTimetableMasters() : [];
    if (classId) masters = masters.filter((m) => m.classId === classId);
    if (academicYearId) masters = masters.filter((m) => m.academicYearId === academicYearId);
    if (termId) masters = masters.filter((m) => m.termId === termId);
    if (status) masters = masters.filter((m) => m.status === status);

    let slots = db.getTimetables();
    if (classId) slots = slots.filter((s) => s.classId === classId);
    if (sectionId) slots = slots.filter((s) => s.sectionId === sectionId);

    res.status(200).json({
      success: true,
      timetables: slots,
      masters
    });
  },

  getTimetableBySection: (req, res) => {
    const { sectionId } = req.params;
    const { classId, academicYearId, termId } = req.query;
    const master = db.findTimetableMaster(classId, sectionId, academicYearId, termId);
    if (!master) {
      return res.status(200).json({ success: true, timetable: null });
    }
    res.status(200).json({ success: true, timetable: master });
  },

  getTimetableById: (req, res) => {
    const master = db.getTimetableMasterById(req.params.id);
    if (!master) {
      return res.status(404).json({ success: false, message: 'Timetable not found' });
    }
    res.status(200).json({ success: true, timetable: master });
  },

  saveTimetable: (req, res) => {
    const { id, classId, sectionId, academicYearId, termId, status, periods, entries } = req.body;

    // If it is a legacy single-slot payload:
    if (!entries && req.body.day && req.body.period) {
      return academicController.addTimetableSlot(req, res);
    }

    if (!classId || !sectionId) {
      return res.status(400).json({ success: false, message: 'Class/Grade and Section are required.' });
    }

    const cls = db.getClasses().find((c) => c.id === classId);
    const sec = db.getSections().find((s) => s.id === sectionId);
    if (!cls || !sec) {
      return res.status(404).json({ success: false, message: 'Specified Class or Section does not exist.' });
    }

    // Check duplicate schedule for this section in the same academic period
    const existingMaster = db.findTimetableMaster(classId, sectionId, academicYearId, termId);
    if (existingMaster && existingMaster.id !== id) {
      return res.status(409).json({
        success: false,
        message: `A timetable already exists for ${cls.title} — ${sec.title} for this academic term.`,
        existingId: existingMaster.id
      });
    }

    const entriesList = Array.isArray(entries) ? entries : [];

    // 1. Validate internal conflicts within this timetable
    for (let i = 0; i < entriesList.length; i++) {
      const e1 = entriesList[i];
      for (let j = i + 1; j < entriesList.length; j++) {
        const e2 = entriesList[j];
        if (e1.day === e2.day) {
          const conflict = checkTimetableConflict([{ ...e2, sectionId, classId }], { ...e1, sectionId, classId });
          if (conflict.hasConflict) {
            return res.status(409).json({
              success: false,
              message: `Internal conflict: ${conflict.reason} on ${e1.day}.`,
              conflict: conflict.conflictingSlot
            });
          }
        }
      }
    }

    // 2. Validate external conflicts against other saved timetables
    const otherSlots = db.getTimetables().filter((s) => s.timetableId !== id && s.sectionId !== sectionId);

    for (const entry of entriesList) {
      const slotToCheck = {
        ...entry,
        classId,
        sectionId,
        className: cls.title,
        sectionName: sec.title
      };
      const conflict = checkTimetableConflict(otherSlots, slotToCheck);
      if (conflict.hasConflict) {
        return res.status(409).json({
          success: false,
          message: conflict.reason,
          conflict: conflict.conflictingSlot
        });
      }
    }

    const masterData = {
      classId,
      sectionId,
      academicYearId: academicYearId || 'AY-2025',
      termId: termId || 'TRM-01',
      status: status || 'Draft',
      periods,
      entries: entriesList
    };
    if (id && id !== 'undefined' && id !== 'null') {
      masterData.id = id;
    }

    const saved = db.saveTimetableMaster(masterData);

    if (db.logAdminAction && req.user) {
      db.logAdminAction({
        action: id ? 'UPDATE_TIMETABLE' : 'CREATE_TIMETABLE',
        target: saved.id,
        details: `${cls.title} - ${sec.title} (${saved.status})`,
        userId: req.user.id
      });
    }

    res.status(200).json({
      success: true,
      message: saved.status === 'Published' ? 'Timetable published successfully' : 'Timetable draft saved successfully',
      timetable: saved
    });
  },

  publishTimetable: (req, res) => {
    const master = db.getTimetableMasterById(req.params.id);
    if (!master) {
      return res.status(404).json({ success: false, message: 'Timetable not found.' });
    }

    if (!master.entries || master.entries.length === 0) {
      return res.status(400).json({ success: false, message: 'Cannot publish an empty timetable. Please add at least one lesson before publishing.' });
    }

    const otherSlots = db.getTimetables().filter((s) => s.timetableId !== master.id && s.sectionId !== master.sectionId);
    for (const entry of master.entries) {
      const conflict = checkTimetableConflict(otherSlots, {
        ...entry,
        classId: master.classId,
        sectionId: master.sectionId
      });
      if (conflict.hasConflict) {
        return res.status(409).json({
          success: false,
          message: `Cannot publish due to schedule conflict: ${conflict.reason}`,
          conflict: conflict.conflictingSlot
        });
      }
    }

    master.status = 'Published';
    const saved = db.saveTimetableMaster(master);

    if (db.logAdminAction && req.user) {
      db.logAdminAction({
        action: 'PUBLISH_TIMETABLE',
        target: saved.id,
        userId: req.user.id
      });
    }

    res.status(200).json({
      success: true,
      message: 'Timetable published successfully! It is now live in student, teacher, and parent portals.',
      timetable: saved
    });
  },

  deleteTimetable: (req, res) => {
    const { id } = req.params;
    const master = db.getTimetableMasterById ? db.getTimetableMasterById(id) : null;
    if (master) {
      db.deleteTimetableMaster(id);
      if (db.logAdminAction && req.user) {
        db.logAdminAction({
          action: 'DELETE_TIMETABLE',
          target: id,
          userId: req.user.id
        });
      }
      return res.status(200).json({ success: true, message: 'Timetable deleted successfully.' });
    }

    // Fallback delete single slot
    db.deleteTimetable(id);
    res.status(200).json({ success: true, message: 'Timetable slot deleted.' });
  },

  validateTimetableEntries: (req, res) => {
    const { id, classId, sectionId, entries } = req.body;
    const entriesList = Array.isArray(entries) ? entries : [];

    // Internal conflict check
    for (let i = 0; i < entriesList.length; i++) {
      const e1 = entriesList[i];
      for (let j = i + 1; j < entriesList.length; j++) {
        const e2 = entriesList[j];
        if (e1.day === e2.day) {
          const conflict = checkTimetableConflict([{ ...e2, sectionId, classId }], { ...e1, sectionId, classId });
          if (conflict.hasConflict) {
            return res.status(200).json({
              success: false,
              hasConflict: true,
              message: `Internal conflict: ${conflict.reason} on ${e1.day}.`,
              conflict: conflict.conflictingSlot
            });
          }
        }
      }
    }

    // External conflict check
    const otherSlots = db.getTimetables().filter((s) => s.timetableId !== id && s.sectionId !== sectionId);
    for (const entry of entriesList) {
      const conflict = checkTimetableConflict(otherSlots, {
        ...entry,
        classId,
        sectionId
      });
      if (conflict.hasConflict) {
        return res.status(200).json({
          success: false,
          hasConflict: true,
          message: conflict.reason,
          conflict: conflict.conflictingSlot
        });
      }
    }

    res.status(200).json({ success: true, hasConflict: false, message: 'Schedule validated with no conflicts detected.' });
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
