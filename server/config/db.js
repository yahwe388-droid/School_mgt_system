import bcrypt from 'bcryptjs';

const salt = bcrypt.genSaltSync(10);

export const initialUsers = [
  {
    id: "USR-001",
    name: "System Administrator",
    email: "admin@school.com",
    passwordHash: bcrypt.hashSync("admin123", salt),
    role: "Admin",
    department: "Administration",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250",
    createdAt: "2026-01-01T00:00:00.000Z"
  },
  {
    id: "USR-002",
    name: "Dr. Robert Vance",
    email: "teacher@school.com",
    passwordHash: bcrypt.hashSync("teacher123", salt),
    role: "Teacher",
    department: "Computer Science",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
    createdAt: "2026-01-02T00:00:00.000Z"
  },
  {
    id: "USR-003",
    name: "Alex Morgan",
    email: "student@school.com",
    passwordHash: bcrypt.hashSync("student123", salt),
    role: "Student",
    department: "Computer Science",
    grade: "Senior",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250",
    createdAt: "2026-01-03T00:00:00.000Z"
  },
  {
    id: "USR-004",
    name: "David Morgan",
    email: "parent@school.com",
    passwordHash: bcrypt.hashSync("parent123", salt),
    role: "Parent",
    children: ["STU-1001"],
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
    createdAt: "2026-01-04T00:00:00.000Z"
  }
];

export const initialSchoolProfile = {
  name: "Greenwood International Academy",
  motto: "Excellence in Knowledge & Character",
  address: "100 Education Way, Innovation City",
  phone: "+1 (555) 234-5678",
  email: "info@greenwood.edu",
  website: "https://greenwood.edu",
  activeAcademicYear: "AY 2025-2026",
  activeTerm: "Fall Term 2026"
};

export const initialAcademicYears = [
  { id: "AY-2025", title: "AY 2025-2026", startDate: "2025-09-01", endDate: "2026-06-30", status: "Active" },
  { id: "AY-2026", title: "AY 2026-2027", startDate: "2026-09-01", endDate: "2027-06-30", status: "Upcoming" }
];

export const initialTerms = [
  { id: "TRM-01", academicYearId: "AY-2025", title: "Fall Term 2026", startDate: "2026-09-01", endDate: "2026-12-20", status: "Active" },
  { id: "TRM-02", academicYearId: "AY-2025", title: "Spring Term 2027", startDate: "2027-01-10", endDate: "2027-05-30", status: "Upcoming" }
];

export const initialClasses = [
  { id: "CLS-09", title: "Grade 9 (Freshman)", code: "G9", level: 9 },
  { id: "CLS-10", title: "Grade 10 (Sophomore)", code: "G10", level: 10 },
  { id: "CLS-11", title: "Grade 11 (Junior)", code: "G11", level: 11 },
  { id: "CLS-12", title: "Grade 12 (Senior)", code: "G12", level: 12 }
];

export const initialSections = [
  { id: "SEC-A", classId: "CLS-12", title: "Section A", room: "Room 301", capacity: 35 },
  { id: "SEC-B", classId: "CLS-12", title: "Section B", room: "Room 302", capacity: 35 },
  { id: "SEC-C", classId: "CLS-11", title: "Section A", room: "Room 201", capacity: 35 }
];

export const initialSubjects = [
  { id: "SUB-101", code: "CS-401", title: "Advanced Data Structures & Algorithms", department: "Computer Science", credits: 4, teacherId: "TCH-201" },
  { id: "SUB-102", code: "MATH-301", title: "Calculus & Linear Algebra", department: "Mathematics", credits: 3, teacherId: "TCH-201" },
  { id: "SUB-103", code: "ENG-201", title: "World Literature & Composition", department: "English", credits: 3, teacherId: "" },
  { id: "SUB-104", code: "PHY-202", title: "General Physics & Mechanics", department: "Science", credits: 4, teacherId: "" }
];

export const initialStudents = [
  {
    id: "STU-1001",
    userId: "USR-003",
    admissionNo: "ADM-2026-001",
    name: "Alex Morgan",
    email: "student@school.com",
    classId: "CLS-12",
    sectionId: "SEC-A",
    parentId: "PRN-301",
    grade: "Senior",
    gpa: 3.85,
    status: "Active"
  },
  {
    id: "STU-1002",
    userId: "",
    admissionNo: "ADM-2026-002",
    name: "Sophia Chen",
    email: "sophia.chen@school.com",
    classId: "CLS-11",
    sectionId: "SEC-C",
    parentId: "PRN-301",
    grade: "Junior",
    gpa: 3.92,
    status: "Active"
  }
];

export const initialTeachers = [
  {
    id: "TCH-201",
    userId: "USR-002",
    employeeId: "EMP-2026-101",
    name: "Dr. Robert Vance",
    email: "teacher@school.com",
    department: "Computer Science",
    qualification: "Ph.D. in Computer Science",
    phone: "+1 (555) 987-6543",
    status: "Active"
  }
];

export const initialParents = [
  {
    id: "PRN-301",
    userId: "USR-004",
    name: "David Morgan",
    email: "parent@school.com",
    phone: "+1 (555) 456-7890",
    occupation: "Software Architect",
    address: "742 Evergreen Terrace",
    studentIds: ["STU-1001", "STU-1002"]
  }
];

export const initialTimetables = [
  { id: "TT-001", classId: "CLS-12", subjectId: "SUB-101", subjectCode: "CS-401", teacherId: "TCH-201", teacherName: "Dr. Robert Vance", day: "Monday", period: 1, timeSlot: "09:00 - 10:00 AM", room: "Lab 301" },
  { id: "TT-002", classId: "CLS-12", subjectId: "SUB-102", subjectCode: "MATH-301", teacherId: "TCH-201", teacherName: "Dr. Robert Vance", day: "Monday", period: 2, timeSlot: "10:15 - 11:15 AM", room: "Room 301" },
  { id: "TT-003", classId: "CLS-12", subjectId: "SUB-103", subjectCode: "ENG-201", teacherId: "", teacherName: "Unassigned", day: "Tuesday", period: 1, timeSlot: "09:00 - 10:00 AM", room: "Room 302" },
  { id: "TT-004", classId: "CLS-12", subjectId: "SUB-104", subjectCode: "PHY-202", teacherId: "", teacherName: "Unassigned", day: "Wednesday", period: 3, timeSlot: "11:30 - 12:30 PM", room: "Physics Lab" }
];

export const initialAttendanceRecords = [
  { id: "ATT-001", date: "2026-08-26", studentId: "STU-1001", studentName: "Alex Morgan", classId: "CLS-12", status: "Present", remarks: "On time" },
  { id: "ATT-002", date: "2026-08-26", studentId: "STU-1002", studentName: "Sophia Chen", classId: "CLS-11", status: "Present", remarks: "On time" },
  { id: "ATT-003", date: "2026-08-25", studentId: "STU-1001", studentName: "Alex Morgan", classId: "CLS-12", status: "Late", remarks: "Bus delay" },
  { id: "ATT-004", date: "2026-08-24", studentId: "STU-1001", studentName: "Alex Morgan", classId: "CLS-12", status: "Present", remarks: "On time" }
];

export const initialAssignments = [
  {
    id: "ASN-001",
    title: "Binary Search Tree Implementation",
    subjectId: "SUB-101",
    subjectCode: "CS-401",
    classId: "CLS-12",
    teacherId: "TCH-201",
    dueDate: "2026-09-05",
    totalPoints: 100,
    instructions: "Implement a balanced AVL tree with insert, delete, and traversal methods in C++ or Python."
  },
  {
    id: "ASN-002",
    title: "Matrix Linear Transformations Worksheet",
    subjectId: "SUB-102",
    subjectCode: "MATH-301",
    classId: "CLS-12",
    teacherId: "TCH-201",
    dueDate: "2026-09-08",
    totalPoints: 50,
    instructions: "Complete problems 1 through 15 on page 142 regarding eigenvalues and eigenvectors."
  }
];

export const initialSubmissions = [
  {
    id: "SUB-801",
    assignmentId: "ASN-001",
    studentId: "STU-1001",
    studentName: "Alex Morgan",
    submittedAt: "2026-09-04T14:30:00.000Z",
    status: "Reviewed",
    content: "github.com/alexmorgan/avl-tree-implementation",
    score: 95,
    feedback: "Excellent code structure and clean memory management."
  }
];

export const initialExams = [
  {
    id: "EXM-001",
    title: "Midterm Assessment - Data Structures",
    subjectId: "SUB-101",
    subjectCode: "CS-401",
    classId: "CLS-12",
    examDate: "2026-10-15",
    timeSlot: "09:00 - 11:00 AM",
    durationMinutes: 120,
    totalMarks: 100,
    type: "Midterm"
  },
  {
    id: "EXM-002",
    title: "Linear Algebra Quiz 1",
    subjectId: "SUB-102",
    subjectCode: "MATH-301",
    classId: "CLS-12",
    examDate: "2026-09-20",
    timeSlot: "10:00 - 10:45 AM",
    durationMinutes: 45,
    totalMarks: 50,
    type: "Quiz"
  }
];

export const initialResults = [
  {
    id: "RES-901",
    examId: "EXM-001",
    studentId: "STU-1001",
    studentName: "Alex Morgan",
    subjectCode: "CS-401",
    marksObtained: 94,
    totalMarks: 100,
    percentage: 94,
    letterGrade: "A",
    gpa: 4.0,
    remarks: "Outstanding Performance"
  }
];

// Phase 4 Communication Seed Data
export const initialAnnouncements = [
  {
    id: "ANC-001",
    title: "Welcome to Fall Term 2026 Academic Session",
    content: "We are excited to welcome all students, faculty, and parents to the new academic year. Please review class schedules and update contact details.",
    targetRole: "All",
    isPinned: true,
    publishedAt: "2026-08-26T08:00:00.000Z",
    author: "Administration"
  },
  {
    id: "ANC-002",
    title: "Annual Fall Parent-Teacher Conference",
    content: "The annual Parent-Teacher Conference is scheduled for September 25th. Appointment slots can be selected via the Parent Portal.",
    targetRole: "Parent",
    isPinned: false,
    publishedAt: "2026-08-25T10:00:00.000Z",
    author: "Principal's Office"
  }
];

export const initialNotifications = [
  {
    id: "NTF-001",
    userId: "USR-003", // Alex Morgan
    title: "New Assignment Published",
    message: "Dr. Robert Vance posted Binary Search Tree Implementation (CS-401). Due: Sep 5.",
    type: "assignment",
    isRead: false,
    timestamp: "2026-08-26T09:00:00.000Z"
  },
  {
    id: "NTF-002",
    userId: "USR-003",
    title: "Exam Score Available",
    message: "Your result for CS-401 Midterm Assessment has been posted: 94/100 (Grade A).",
    type: "result",
    isRead: true,
    timestamp: "2026-08-25T16:00:00.000Z"
  },
  {
    id: "NTF-003",
    userId: "USR-004", // Parent David Morgan
    title: "Student Attendance Alert",
    message: "Alex Morgan was recorded Present in class on 2026-08-26.",
    type: "attendance",
    isRead: false,
    timestamp: "2026-08-26T08:30:00.000Z"
  }
];

class DatabaseStore {
  constructor() {
    this.users = [...initialUsers];
    this.roles = ["Admin", "Teacher", "Student", "Parent"];
    this.schoolProfile = { ...initialSchoolProfile };
    this.academicYears = [...initialAcademicYears];
    this.terms = [...initialTerms];
    this.classes = [...initialClasses];
    this.sections = [...initialSections];
    this.subjects = [...initialSubjects];
    this.students = [...initialStudents];
    this.teachers = [...initialTeachers];
    this.parents = [...initialParents];

    this.timetables = [...initialTimetables];
    this.attendanceRecords = [...initialAttendanceRecords];
    this.assignments = [...initialAssignments];
    this.submissions = [...initialSubmissions];
    this.exams = [...initialExams];
    this.results = [...initialResults];

    // Phase 4 Collections
    this.announcements = [...initialAnnouncements];
    this.notifications = [...initialNotifications];

    // Phase 5 Audit Store
    this.auditLogs = [];
  }

  // Audit Log Methods
  logAdminAction(entry) {
    const log = { id: `LOG-${Date.now()}`, ...entry };
    this.auditLogs.unshift(log);
    return log;
  }

  getAuditLogs() {
    return this.auditLogs;
  }

  // Users
  getUsers() { return this.users; }
  findUserByEmail(email) { return this.users.find(u => u.email.toLowerCase() === email.toLowerCase()); }
  findUserById(id) { return this.users.find(u => u.id === id); }

  // School Profile
  getSchoolProfile() { return this.schoolProfile; }
  updateSchoolProfile(updated) {
    this.schoolProfile = { ...this.schoolProfile, ...updated };
    return this.schoolProfile;
  }

  // Academic Years
  getAcademicYears() { return this.academicYears; }
  addAcademicYear(data) {
    const newYear = { id: `AY-${Date.now()}`, ...data };
    this.academicYears.push(newYear);
    return newYear;
  }

  // Classes
  getClasses() { return this.classes; }
  addClass(data) {
    const newClass = { id: `CLS-${Date.now()}`, ...data };
    this.classes.push(newClass);
    return newClass;
  }
  updateClass(id, data) {
    this.classes = this.classes.map(c => c.id === id ? { ...c, ...data } : c);
    return this.classes.find(c => c.id === id);
  }
  deleteClass(id) {
    this.classes = this.classes.filter(c => c.id !== id);
    return true;
  }

  // Sections
  getSections() { return this.sections; }
  addSection(data) {
    const newSec = { id: `SEC-${Date.now()}`, ...data };
    this.sections.push(newSec);
    return newSec;
  }

  // Subjects
  getSubjects() { return this.subjects; }
  addSubject(data) {
    const newSub = { id: `SUB-${Date.now()}`, ...data };
    this.subjects.push(newSub);
    return newSub;
  }
  updateSubject(id, data) {
    this.subjects = this.subjects.map(s => s.id === id ? { ...s, ...data } : s);
    return this.subjects.find(s => s.id === id);
  }
  deleteSubject(id) {
    this.subjects = this.subjects.filter(s => s.id !== id);
    return true;
  }

  // Students Record CRUD
  getStudents() { return this.students; }
  addStudent(data) {
    const newStu = { id: `STU-${1000 + this.students.length + 1}`, ...data };
    this.students.push(newStu);
    return newStu;
  }
  updateStudent(id, data) {
    this.students = this.students.map(s => s.id === id ? { ...s, ...data } : s);
    return this.students.find(s => s.id === id);
  }
  deleteStudent(id) {
    this.students = this.students.filter(s => s.id !== id);
    return true;
  }

  // Teachers Record CRUD
  getTeachers() { return this.teachers; }
  addTeacher(data) {
    const newTch = { id: `TCH-${200 + this.teachers.length + 1}`, ...data };
    this.teachers.push(newTch);
    return newTch;
  }
  updateTeacher(id, data) {
    this.teachers = this.teachers.map(t => t.id === id ? { ...t, ...data } : t);
    return this.teachers.find(t => t.id === id);
  }
  deleteTeacher(id) {
    this.teachers = this.teachers.filter(t => t.id !== id);
    return true;
  }

  // Parents Record CRUD
  getParents() { return this.parents; }
  addParent(data) {
    const newPrn = { id: `PRN-${300 + this.parents.length + 1}`, ...data };
    this.parents.push(newPrn);
    return newPrn;
  }
  updateParent(id, data) {
    this.parents = this.parents.map(p => p.id === id ? { ...p, ...data } : p);
    return this.parents.find(p => p.id === id);
  }
  deleteParent(id) {
    this.parents = this.parents.filter(p => p.id !== id);
    return true;
  }

  // Timetables
  getTimetables() { return this.timetables; }
  addTimetable(slot) {
    const newSlot = { id: `TT-${Date.now()}`, ...slot };
    this.timetables.push(newSlot);
    return newSlot;
  }
  deleteTimetable(id) {
    this.timetables = this.timetables.filter(t => t.id !== id);
    return true;
  }

  // Attendance
  getAttendance() { return this.attendanceRecords; }
  recordAttendance(record) {
    const existingIndex = this.attendanceRecords.findIndex(
      r => r.date === record.date && r.studentId === record.studentId
    );

    if (existingIndex >= 0) {
      this.attendanceRecords[existingIndex] = { ...this.attendanceRecords[existingIndex], ...record };
      return this.attendanceRecords[existingIndex];
    } else {
      const newRec = { id: `ATT-${Date.now()}`, ...record };
      this.attendanceRecords.push(newRec);
      return newRec;
    }
  }

  // Assignments & Submissions
  getAssignments() { return this.assignments; }
  addAssignment(data) {
    const newAsn = { id: `ASN-${Date.now()}`, ...data };
    this.assignments.push(newAsn);
    return newAsn;
  }

  getSubmissions() { return this.submissions; }
  submitHomework(data) {
    const newSub = { id: `SUB-${Date.now()}`, submittedAt: new Date().toISOString(), status: 'Submitted', ...data };
    this.submissions.push(newSub);
    return newSub;
  }
  reviewSubmission(id, score, feedback) {
    this.submissions = this.submissions.map(s => s.id === id ? { ...s, score, feedback, status: 'Reviewed' } : s);
    return this.submissions.find(s => s.id === id);
  }

  // Exams & Results
  getExams() { return this.exams; }
  addExam(data) {
    const newExm = { id: `EXM-${Date.now()}`, ...data };
    this.exams.push(newExm);
    return newExm;
  }

  getResults() { return this.results; }
  saveResult(data) {
    const existingIndex = this.results.findIndex(r => r.examId === data.examId && r.studentId === data.studentId);
    if (existingIndex >= 0) {
      this.results[existingIndex] = { ...this.results[existingIndex], ...data };
      return this.results[existingIndex];
    } else {
      const newRes = { id: `RES-${Date.now()}`, ...data };
      this.results.push(newRes);
      return newRes;
    }
  }

  // Phase 4 Methods: Announcements
  getAnnouncements() { return this.announcements; }
  addAnnouncement(data) {
    const newAnc = { id: `ANC-${Date.now()}`, publishedAt: new Date().toISOString(), ...data };
    this.announcements.unshift(newAnc);
    return newAnc;
  }

  // Notifications
  getNotifications(userId) {
    if (!userId) return this.notifications;
    return this.notifications.filter(n => n.userId === userId);
  }

  markNotificationAsRead(id) {
    this.notifications = this.notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    return true;
  }
}

export const db = new DatabaseStore();
