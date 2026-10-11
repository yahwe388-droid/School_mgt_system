import express from 'express';
import { db } from '../config/db.js';
import { authenticateToken, requireRole, requirePasswordChanged } from '../middleware/authMiddleware.js';
import { authorizeStudentAccess } from '../middleware/objectAuthMiddleware.js';
import { generateStudentReport } from '../utils/reportGenerator.js';
import { calculateAttendanceStats, calculateGrade } from '../utils/academicCalculations.js';

// ==========================================
// 1. TEACHER SPECIFIC ROUTES: /api/teacher/*
// ==========================================
export const teacherRouter = express.Router();
teacherRouter.use(authenticateToken);
teacherRouter.use(requireRole(['TEACHER', 'ADMIN']));
teacherRouter.use(requirePasswordChanged);

const getTeacherContext = (req) => {
  const user = req.user;
  const teacher = db.getTeachers().find(t => t.userId === user.id || (t.email && user.email && t.email.toLowerCase() === user.email.toLowerCase())) || {
    id: `TCH-${user.id}`,
    userId: user.id,
    name: user.name,
    email: user.email,
    department: user.department || 'General Faculty'
  };

  // Classes taught by this teacher through subjects or timetables
  const teacherSubjects = db.getSubjects().filter(s => s.teacherId === teacher.id);
  const teacherTimetables = db.getTimetables().filter(t => t.teacherId === teacher.id);
  const assignedClassIds = req.user.role === 'ADMIN' 
    ? db.getClasses().map(c => c.id)
    : [...new Set([...teacherSubjects.map(s => s.classId), ...teacherTimetables.map(t => t.classId)])].filter(Boolean);

  // Fallback to CLS-12 if newly created seed teacher
  if (assignedClassIds.length === 0 && db.getClasses().length > 0) {
    assignedClassIds.push(db.getClasses()[0].id);
  }

  const assignedClasses = db.getClasses().filter(c => assignedClassIds.includes(c.id));
  return { teacher, assignedClasses, assignedClassIds };
};

teacherRouter.get('/dashboard', (req, res) => {
  const { teacher, assignedClasses, assignedClassIds } = getTeacherContext(req);
  const students = db.getStudents().filter(s => assignedClassIds.includes(s.classId));
  const assignments = db.getAssignments().filter(a => a.teacherId === teacher.id || assignedClassIds.includes(a.classId));
  const timetables = db.getTimetables().filter(t => t.teacherId === teacher.id || assignedClassIds.includes(t.classId));
  const unreadMessages = db.getMessages(req.user.id).filter(m => !m.isRead && m.recipientId === req.user.id);

  res.status(200).json({
    success: true,
    teacher,
    metrics: {
      assignedClassesCount: assignedClasses.length,
      totalStudentsCount: students.length,
      assignmentsCount: assignments.length,
      scheduleSlotsToday: timetables.length,
      unreadMessagesCount: unreadMessages.length
    },
    assignedClasses,
    todaySchedule: timetables,
    recentAssignments: assignments.slice(0, 5),
    unreadMessages: unreadMessages.slice(0, 5)
  });
});

teacherRouter.get('/classes', (req, res) => {
  const { assignedClasses } = getTeacherContext(req);
  const enriched = assignedClasses.map(c => {
    const classStudents = db.getStudents().filter(s => s.classId === c.id);
    const classSubjects = db.getSubjects().filter(s => s.classId === c.id || s.department === c.department);
    return {
      ...c,
      studentCount: classStudents.length,
      subjects: classSubjects,
      students: classStudents
    };
  });
  res.status(200).json({ success: true, classes: enriched });
});

teacherRouter.get('/students', (req, res) => {
  const { assignedClassIds } = getTeacherContext(req);
  let students = db.getStudents().filter(s => assignedClassIds.includes(s.classId));
  
  if (req.query.search) {
    const q = req.query.search.toLowerCase().trim();
    students = students.filter(s => 
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.studentId && s.studentId.toLowerCase().includes(q)) ||
      (s.admissionNo && s.admissionNo.toLowerCase().includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q))
    );
  }

  if (req.query.classId) {
    students = students.filter(s => s.classId === req.query.classId);
  }

  res.status(200).json({ success: true, students });
});

teacherRouter.get('/attendance', (req, res) => {
  const { assignedClassIds } = getTeacherContext(req);
  const classId = req.query.classId || assignedClassIds[0];
  const date = req.query.date || new Date().toISOString().split('T')[0];

  const classStudents = db.getStudents().filter(s => s.classId === classId);
  const allAttendance = db.getAttendance();
  const dateRecords = allAttendance.filter(a => a.date === date && a.classId === classId);

  const studentsWithStatus = classStudents.map(s => {
    const existing = dateRecords.find(r => r.studentId === s.id || r.studentId === s.studentId);
    return {
      studentId: s.id,
      admissionNo: s.studentId || s.admissionNo,
      name: s.name,
      status: existing ? existing.status : 'Present',
      remarks: existing ? existing.remarks : ''
    };
  });

  const stats = calculateAttendanceStats(dateRecords);

  res.status(200).json({
    success: true,
    classId,
    date,
    students: studentsWithStatus,
    stats
  });
});

teacherRouter.post('/attendance', (req, res) => {
  const { assignedClassIds, teacher } = getTeacherContext(req);
  const { classId, date, records } = req.body;

  if (!classId || !assignedClassIds.includes(classId)) {
    return res.status(403).json({ success: false, message: 'You are not authorized to mark attendance for this class.' });
  }

  if (!Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ success: false, message: 'Attendance records are required.' });
  }

  const saved = records.map(r => {
    return db.recordAttendance({
      date: date || new Date().toISOString().split('T')[0],
      studentId: r.studentId,
      studentName: r.name || r.studentName,
      classId,
      status: r.status || 'Present',
      remarks: r.remarks || `Recorded by ${teacher.name}`
    });
  });

  res.status(200).json({
    success: true,
    message: `Attendance recorded for ${saved.length} students on ${date}.`,
    records: saved
  });
});

teacherRouter.get('/assignments', (req, res) => {
  const { teacher, assignedClassIds } = getTeacherContext(req);
  const assignments = db.getAssignments().filter(a => a.teacherId === teacher.id || assignedClassIds.includes(a.classId));
  const submissions = db.getSubmissions();
  
  const enriched = assignments.map(a => {
    const subs = submissions.filter(s => s.assignmentId === a.id);
    return {
      ...a,
      submissionCount: subs.length,
      submissions: subs
    };
  });

  res.status(200).json({ success: true, assignments: enriched });
});

teacherRouter.post('/assignments', (req, res) => {
  const { teacher, assignedClassIds } = getTeacherContext(req);
  const { title, classId, subjectCode, dueDate, totalPoints, instructions } = req.body;

  if (!title || !classId) {
    return res.status(400).json({ success: false, message: 'Assignment title and Class ID are required.' });
  }

  if (!assignedClassIds.includes(classId)) {
    return res.status(403).json({ success: false, message: 'You can only publish assignments for your assigned classes.' });
  }

  const newAsn = db.addAssignment({
    title,
    classId,
    subjectCode: subjectCode || 'GEN-101',
    teacherId: teacher.id,
    dueDate: dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    totalPoints: Number(totalPoints) || 100,
    instructions: instructions || 'Please submit according to course guidelines.'
  });

  res.status(201).json({ success: true, message: 'Assignment published successfully.', assignment: newAsn });
});

teacherRouter.get('/grades', (req, res) => {
  const { assignedClassIds } = getTeacherContext(req);
  const students = db.getStudents().filter(s => assignedClassIds.includes(s.classId));
  const studentIds = students.map(s => s.id);
  const results = db.getResults().filter(r => studentIds.includes(r.studentId));

  res.status(200).json({ success: true, results, students });
});

teacherRouter.post('/grades', (req, res) => {
  const { assignedClassIds } = getTeacherContext(req);
  const { studentId, examId, subjectCode, marksObtained, totalMarks } = req.body;

  const student = db.getStudents().find(s => s.id === studentId || s.studentId === studentId);
  if (!student || !assignedClassIds.includes(student.classId)) {
    return res.status(403).json({ success: false, message: 'You are not authorized to grade this student.' });
  }

  const marks = Number(marksObtained);
  const total = Number(totalMarks) || 100;
  const gradeInfo = calculateGrade(marks, total);

  const saved = db.saveResult({
    examId: examId || `EXM-${Date.now()}`,
    studentId: student.id,
    studentName: student.name,
    subjectCode: subjectCode || 'CS-401',
    marksObtained: marks,
    totalMarks: total,
    percentage: Math.round((marks / total) * 100),
    letterGrade: gradeInfo.letter,
    gpa: gradeInfo.gpa,
    remarks: gradeInfo.remark
  });

  res.status(200).json({ success: true, message: 'Grade recorded successfully.', result: saved });
});

teacherRouter.get('/schedule', (req, res) => {
  const { teacher } = getTeacherContext(req);
  const allMasters = db.getTimetableMasters ? db.getTimetableMasters() : [];
  const scheduleSlots = [];

  allMasters.forEach((tm) => {
    if (Array.isArray(tm.entries)) {
      tm.entries.forEach((entry) => {
        const isAssigned = (entry.teacherId && entry.teacherId === teacher.id) ||
          (entry.teacherName && teacher.name && entry.teacherName.trim().toLowerCase() === teacher.name.trim().toLowerCase());
        if (isAssigned) {
          const cls = db.getClasses().find((c) => c.id === tm.classId);
          const sec = db.getSections().find((s) => s.id === tm.sectionId);
          const sub = db.getSubjects().find((s) => s.id === entry.subjectId);
          scheduleSlots.push({
            ...entry,
            timetableId: tm.id,
            classId: tm.classId,
            className: cls ? cls.title : tm.classId,
            classCode: cls ? cls.code : '',
            sectionId: tm.sectionId,
            sectionName: sec ? sec.title : (tm.sectionId || ''),
            subjectCode: entry.subjectCode || (sub ? sub.code : ''),
            subjectTitle: entry.subjectTitle || (sub ? sub.title : ''),
            academicYearId: tm.academicYearId,
            termId: tm.termId,
            status: tm.status
          });
        }
      });
    }
  });

  db.getTimetables().forEach((slot) => {
    const isAssigned = (slot.teacherId && slot.teacherId === teacher.id) ||
      (slot.teacherName && teacher.name && slot.teacherName.trim().toLowerCase() === teacher.name.trim().toLowerCase());
    if (isAssigned && !scheduleSlots.some((s) => s.id === slot.id)) {
      const cls = db.getClasses().find((c) => c.id === slot.classId);
      const sec = db.getSections().find((s) => s.id === slot.sectionId);
      scheduleSlots.push({
        ...slot,
        className: cls ? cls.title : slot.classId,
        sectionName: sec ? sec.title : (slot.sectionId || '')
      });
    }
  });

  const dayOrder = { Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6, Sunday: 7 };
  scheduleSlots.sort((a, b) => (dayOrder[a.day] || 99) - (dayOrder[b.day] || 99) || (a.period || 0) - (b.period || 0));

  res.status(200).json({
    success: true,
    teacher,
    timetable: scheduleSlots,
    totalAssignedHours: scheduleSlots.length
  });
});

teacherRouter.get('/messages', (req, res) => {
  const messages = db.getMessages(req.user.id);
  res.status(200).json({ success: true, messages });
});

teacherRouter.post('/messages', (req, res) => {
  const { recipientId, subject, content } = req.body;
  if (!recipientId || !content) {
    return res.status(400).json({ success: false, message: 'Recipient and message content are required.' });
  }

  const recipient = db.findUserById(recipientId) || db.getStudents().find(s => s.id === recipientId || s.userId === recipientId);
  const newMsg = db.sendMessage({
    senderId: req.user.id,
    senderName: req.user.name,
    senderRole: req.user.role,
    recipientId: recipient?.userId || recipient?.id || recipientId,
    recipientName: recipient?.name || 'User',
    recipientRole: recipient?.role || 'STUDENT',
    subject: subject || 'Academic Communication',
    content
  });

  res.status(201).json({ success: true, message: 'Message transmitted successfully.', data: newMsg });
});

teacherRouter.put('/messages/:id/read', (req, res) => {
  const read = db.markMessageAsRead(req.params.id, req.user.id);
  res.status(200).json({ success: true, message: 'Marked as read', messageRecord: read });
});

teacherRouter.get('/profile', (req, res) => {
  const { teacher } = getTeacherContext(req);
  res.status(200).json({ success: true, profile: { ...req.user, teacher } });
});

teacherRouter.put('/profile', (req, res) => {
  // Disallow role tampering
  const { phone, department, qualification } = req.body;
  const updatedUser = db.updateUser(req.user.id, { phone });
  const { teacher } = getTeacherContext(req);
  if (teacher && teacher.id) {
    db.updateTeacher(teacher.id, { phone, department, qualification });
  }
  res.status(200).json({ success: true, message: 'Faculty profile updated.', profile: updatedUser });
});

// ==========================================
// 2. STUDENT SPECIFIC ROUTES: /api/student/*
// ==========================================
export const studentRouter = express.Router();
studentRouter.use(authenticateToken);
studentRouter.use(requireRole(['STUDENT', 'ADMIN']));
studentRouter.use(requirePasswordChanged);

const getStudentContext = (req) => {
  const user = req.user;
  const student = db.getStudents().find(s => s.userId === user.id || s.studentId === user.studentId || (s.email && user.email && s.email.toLowerCase() === user.email.toLowerCase())) || {
    id: 'STU-1001',
    studentId: user.studentId || user.username,
    name: user.name,
    classId: 'CLS-12',
    grade: user.grade || 'Senior',
    email: user.email
  };
  return { student };
};

studentRouter.get('/dashboard', (req, res) => {
  const { student } = getStudentContext(req);
  const attendance = db.getAttendance().filter(a => a.studentId === student.id || a.studentId === student.studentId);
  const results = db.getResults().filter(r => r.studentId === student.id || r.studentId === student.studentId);
  const assignments = db.getAssignments().filter(a => a.classId === student.classId);
  const courses = db.getSubjects().filter(s => s.classId === student.classId || s.department === student.department);
  const announcements = db.getAnnouncements().slice(0, 3);
  const attendanceStats = calculateAttendanceStats(attendance, student.id);

  res.status(200).json({
    success: true,
    student,
    metrics: {
      coursesCount: courses.length || 4,
      attendancePercentage: attendanceStats.percentage || 100,
      assignmentsCount: assignments.length,
      averageGrade: results.length > 0 ? (results.reduce((acc, r) => acc + (r.percentage || 0), 0) / results.length).toFixed(1) + '%' : 'N/A'
    },
    attendanceStats,
    recentGrades: results.slice(0, 5),
    upcomingAssignments: assignments.slice(0, 5),
    announcements
  });
});

studentRouter.get('/courses', (req, res) => {
  const { student } = getStudentContext(req);
  const courses = db.getSubjects().map(sub => {
    const teacher = db.getTeachers().find(t => t.id === sub.teacherId);
    const schedule = db.getTimetables().find(tt => tt.subjectId === sub.id && tt.classId === student.classId);
    return {
      ...sub,
      teacherName: teacher ? teacher.name : 'Faculty Instructor',
      schedule: schedule ? `${schedule.day} ${schedule.timeSlot} (${schedule.room})` : 'Mon / Wed 10:00 AM'
    };
  });
  res.status(200).json({ success: true, courses });
});

studentRouter.get('/assignments', (req, res) => {
  const { student } = getStudentContext(req);
  const assignments = db.getAssignments().filter(a => !a.classId || a.classId === student.classId);
  const submissions = db.getSubmissions().filter(s => s.studentId === student.id || s.studentId === student.studentId);

  const enriched = assignments.map(a => {
    const mySub = submissions.find(s => s.assignmentId === a.id);
    return {
      ...a,
      submission: mySub || null,
      isSubmitted: !!mySub,
      submissionStatus: mySub ? mySub.status : 'Pending'
    };
  });

  res.status(200).json({ success: true, assignments: enriched });
});

studentRouter.post('/assignments/:id/submit', (req, res) => {
  const { student } = getStudentContext(req);
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ success: false, message: 'Submission content or link is required.' });
  }

  const sub = db.submitHomework({
    assignmentId: req.params.id,
    studentId: student.id,
    studentName: student.name,
    content
  });

  res.status(201).json({ success: true, message: 'Homework submitted successfully.', submission: sub });
});

studentRouter.get('/grades', (req, res) => {
  const { student } = getStudentContext(req);
  const results = db.getResults().filter(r => r.studentId === student.id || r.studentId === student.studentId);
  res.status(200).json({ success: true, results });
});

studentRouter.get('/attendance', (req, res) => {
  const { student } = getStudentContext(req);
  const attendance = db.getAttendance().filter(a => a.studentId === student.id || a.studentId === student.studentId);
  const stats = calculateAttendanceStats(attendance, student.id);
  res.status(200).json({ success: true, attendance, stats });
});

studentRouter.get('/schedule', (req, res) => {
  const { student } = getStudentContext(req);
  const cls = db.getClasses().find((c) => c.id === student.classId);
  const sec = db.getSections().find((s) => s.id === student.sectionId);

  const allMasters = db.getTimetableMasters ? db.getTimetableMasters() : [];
  const publishedMaster = allMasters.find((tm) => {
    const matchSection = student.sectionId ? tm.sectionId === student.sectionId : true;
    const matchClass = student.classId ? tm.classId === student.classId : true;
    return matchSection && matchClass && tm.status === 'Published';
  });

  const academicProfile = db.getSchoolProfile();

  if (!publishedMaster) {
    return res.status(200).json({
      success: true,
      isPublished: false,
      timetable: null,
      entries: [],
      studentInfo: {
        id: student.id,
        name: student.name,
        admissionNo: student.studentId || student.admissionNo,
        classId: student.classId,
        className: cls ? cls.title : (student.grade || 'Senior'),
        sectionId: student.sectionId,
        sectionName: sec ? sec.title : 'General Section',
        academicYear: academicProfile.activeAcademicYear,
        term: academicProfile.activeTerm
      },
      message: 'No published timetable is currently available for your section.'
    });
  }

  res.status(200).json({
    success: true,
    isPublished: true,
    timetable: publishedMaster,
    entries: publishedMaster.entries || [],
    periods: publishedMaster.periods || [],
    studentInfo: {
      id: student.id,
      name: student.name,
      admissionNo: student.studentId || student.admissionNo,
      classId: student.classId,
      className: cls ? cls.title : (student.grade || 'Senior'),
      sectionId: student.sectionId,
      sectionName: sec ? sec.title : 'General Section',
      academicYear: publishedMaster.academicYearId,
      term: publishedMaster.termId
    }
  });
});

studentRouter.get('/messages', (req, res) => {
  const messages = db.getMessages(req.user.id);
  res.status(200).json({ success: true, messages });
});

studentRouter.post('/messages', (req, res) => {
  const { recipientId, subject, content } = req.body;
  if (!content) {
    return res.status(400).json({ success: false, message: 'Message content is required.' });
  }

  const recipient = db.findUserById(recipientId) || db.getTeachers()[0];
  const newMsg = db.sendMessage({
    senderId: req.user.id,
    senderName: req.user.name,
    senderRole: 'STUDENT',
    recipientId: recipient?.userId || recipient?.id || 'USR-002',
    recipientName: recipient?.name || 'Instructor',
    recipientRole: recipient?.role || 'TEACHER',
    subject: subject || 'Student Inquiry',
    content
  });

  res.status(201).json({ success: true, message: 'Message sent to faculty.', data: newMsg });
});

studentRouter.put('/messages/:id/read', (req, res) => {
  const read = db.markMessageAsRead(req.params.id, req.user.id);
  res.status(200).json({ success: true, message: 'Marked as read', messageRecord: read });
});

studentRouter.get('/profile', (req, res) => {
  const { student } = getStudentContext(req);
  res.status(200).json({ success: true, profile: { ...req.user, student } });
});

studentRouter.put('/profile', (req, res) => {
  // Strictly prevent role or student ID escalation
  const { phone } = req.body;
  const updatedUser = db.updateUser(req.user.id, { phone });
  res.status(200).json({ success: true, message: 'Student profile updated.', profile: updatedUser });
});

// ==========================================
// 3. PARENT SPECIFIC ROUTES: /api/parent/*
// ==========================================
export const parentRouter = express.Router();
parentRouter.use(authenticateToken);
parentRouter.use(requireRole(['PARENT', 'ADMIN']));
parentRouter.use(requirePasswordChanged);

const getParentContext = (req) => {
  const user = req.user;
  const parent = db.getParents().find(p => p.userId === user.id || (p.email && user.email && p.email.toLowerCase() === user.email.toLowerCase())) || {
    id: `PRN-${user.id}`,
    name: user.name,
    studentIds: ['STU-1001']
  };
  const linkedStudentIds = parent.studentIds || user.children || ['STU-1001'];
  const children = db.getStudents().filter(s => linkedStudentIds.includes(s.id) || linkedStudentIds.includes(s.studentId));
  return { parent, children, linkedStudentIds };
};

parentRouter.get('/dashboard', (req, res) => {
  const { parent, children, linkedStudentIds } = getParentContext(req);
  const primaryChild = children[0] || db.getStudents()[0];
  
  const allResults = db.getResults().filter(r => linkedStudentIds.includes(r.studentId));
  const allAttendance = db.getAttendance().filter(a => linkedStudentIds.includes(a.studentId));
  const childAssignments = db.getAssignments().filter(a => children.some(c => c.classId === a.classId));
  const unreadMessages = db.getMessages(req.user.id).filter(m => !m.isRead && m.recipientId === req.user.id);

  res.status(200).json({
    success: true,
    parent,
    children,
    metrics: {
      childrenCount: children.length,
      recentGradesCount: allResults.length,
      upcomingAssignmentsCount: childAssignments.length,
      unreadMessagesCount: unreadMessages.length
    },
    recentGrades: allResults.slice(0, 5),
    recentAttendance: allAttendance.slice(0, 5),
    upcomingAssignments: childAssignments.slice(0, 5)
  });
});

parentRouter.get('/children', (req, res) => {
  const { children } = getParentContext(req);
  const enriched = children.map(c => {
    const att = db.getAttendance().filter(a => a.studentId === c.id);
    const resList = db.getResults().filter(r => r.studentId === c.id);
    return {
      ...c,
      attendanceStats: calculateAttendanceStats(att, c.id),
      grades: resList
    };
  });
  res.status(200).json({ success: true, children: enriched });
});

parentRouter.get('/attendance', (req, res) => {
  const { linkedStudentIds, children } = getParentContext(req);
  const targetId = req.query.studentId || linkedStudentIds[0];

  if (!linkedStudentIds.includes(targetId) && !children.some(c => c.studentId === targetId)) {
    return res.status(403).json({ success: false, message: 'You are not authorized to view attendance for this student.' });
  }

  const attendance = db.getAttendance().filter(a => a.studentId === targetId || children.some(c => c.id === targetId && a.studentId === c.id));
  const stats = calculateAttendanceStats(attendance, targetId);

  res.status(200).json({ success: true, attendance, stats, studentId: targetId });
});

parentRouter.get('/grades', (req, res) => {
  const { linkedStudentIds, children } = getParentContext(req);
  const targetId = req.query.studentId;

  if (targetId && !linkedStudentIds.includes(targetId) && !children.some(c => c.studentId === targetId)) {
    return res.status(403).json({ success: false, message: 'You are not authorized to view grades for this student.' });
  }

  const results = targetId
    ? db.getResults().filter(r => r.studentId === targetId || children.some(c => c.id === targetId && r.studentId === c.id))
    : db.getResults().filter(r => linkedStudentIds.includes(r.studentId) || children.some(c => r.studentId === c.id));

  res.status(200).json({ success: true, results });
});

parentRouter.get('/assignments', (req, res) => {
  const { children } = getParentContext(req);
  const classIds = children.map(c => c.classId);
  const assignments = db.getAssignments().filter(a => classIds.includes(a.classId));
  res.status(200).json({ success: true, assignments });
});

parentRouter.get('/schedule', (req, res) => {
  const { parent, children, linkedStudentIds } = getParentContext(req);
  const targetStudentId = req.query.studentId || linkedStudentIds[0];

  const isLinked = linkedStudentIds.includes(targetStudentId) || children.some((c) => c.id === targetStudentId || c.studentId === targetStudentId);
  if (!isLinked) {
    return res.status(403).json({
      success: false,
      message: 'You are not authorized to view the timetable for this student.'
    });
  }

  const targetStudent = children.find((c) => c.id === targetStudentId || c.studentId === targetStudentId) || db.getStudents().find((s) => s.id === targetStudentId);
  if (!targetStudent) {
    return res.status(404).json({ success: false, message: 'Student record not found.' });
  }

  const cls = db.getClasses().find((c) => c.id === targetStudent.classId);
  const sec = db.getSections().find((s) => s.id === targetStudent.sectionId);

  const allMasters = db.getTimetableMasters ? db.getTimetableMasters() : [];
  const publishedMaster = allMasters.find((tm) => {
    const matchSection = targetStudent.sectionId ? tm.sectionId === targetStudent.sectionId : true;
    const matchClass = targetStudent.classId ? tm.classId === targetStudent.classId : true;
    return matchSection && matchClass && tm.status === 'Published';
  });

  const academicProfile = db.getSchoolProfile();

  res.status(200).json({
    success: true,
    isPublished: !!publishedMaster,
    timetable: publishedMaster || null,
    entries: publishedMaster?.entries || [],
    periods: publishedMaster?.periods || [],
    children: children.map((c) => ({
      id: c.id,
      name: c.name,
      studentId: c.studentId,
      classId: c.classId,
      sectionId: c.sectionId
    })),
    selectedChild: {
      id: targetStudent.id,
      name: targetStudent.name,
      admissionNo: targetStudent.studentId || targetStudent.admissionNo,
      classId: targetStudent.classId,
      className: cls ? cls.title : targetStudent.classId,
      sectionId: targetStudent.sectionId,
      sectionName: sec ? sec.title : 'General Section',
      academicYear: publishedMaster?.academicYearId || academicProfile.activeAcademicYear,
      term: publishedMaster?.termId || academicProfile.activeTerm
    },
    message: publishedMaster ? 'Published timetable retrieved.' : 'No published timetable is currently available for this student.'
  });
});

parentRouter.get('/messages', (req, res) => {
  const messages = db.getMessages(req.user.id);
  res.status(200).json({ success: true, messages });
});

parentRouter.post('/messages', (req, res) => {
  const { recipientId, subject, content } = req.body;
  if (!content) {
    return res.status(400).json({ success: false, message: 'Message content is required.' });
  }

  const recipient = db.findUserById(recipientId) || db.getTeachers()[0];
  const newMsg = db.sendMessage({
    senderId: req.user.id,
    senderName: req.user.name,
    senderRole: 'PARENT',
    recipientId: recipient?.userId || recipient?.id || 'USR-002',
    recipientName: recipient?.name || 'Faculty Member',
    recipientRole: recipient?.role || 'TEACHER',
    subject: subject || 'Parent Communication',
    content
  });

  res.status(201).json({ success: true, message: 'Message sent successfully.', data: newMsg });
});

parentRouter.put('/messages/:id/read', (req, res) => {
  const read = db.markMessageAsRead(req.params.id, req.user.id);
  res.status(200).json({ success: true, message: 'Marked as read', messageRecord: read });
});

parentRouter.get('/profile', (req, res) => {
  const { parent, children } = getParentContext(req);
  res.status(200).json({ success: true, profile: { ...req.user, parent, children } });
});

parentRouter.put('/profile', (req, res) => {
  const { phone, address } = req.body;
  const updatedUser = db.updateUser(req.user.id, { phone });
  const { parent } = getParentContext(req);
  if (parent && parent.id) {
    db.updateParent(parent.id, { phone, address });
  }
  res.status(200).json({ success: true, message: 'Parent profile updated.', profile: updatedUser });
});

