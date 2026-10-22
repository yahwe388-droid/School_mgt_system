import bcrypt from 'bcryptjs';

const salt = bcrypt.genSaltSync(10);

export const initialUsers = [
  {
    id: "USR-001",
    username: "admin",
    name: "Kebek Guta",
    first_name: "Kebek",
    last_name: "Guta",
    email: "kebi12447@gmail.com",
    passwordHash: bcrypt.hashSync("admin123", salt),
    role: "ADMIN",
    department: "Administration",
    phone: "+1 (555) 100-0001",
    is_active: true,
    must_change_password: false,
    created_by: "SYSTEM",
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    last_login: "2026-09-01T08:00:00.000Z",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250"
  },
  {
    id: "USR-002",
    username: "robert.vance",
    name: "Dr. Robert Vance",
    first_name: "Robert",
    last_name: "Vance",
    email: "teacher@school.com",
    passwordHash: bcrypt.hashSync("teacher123", salt),
    role: "TEACHER",
    department: "Computer Science",
    phone: "+1 (555) 987-6543",
    is_active: true,
    must_change_password: false,
    created_by: "USR-001",
    created_at: "2026-01-02T00:00:00.000Z",
    updated_at: "2026-01-02T00:00:00.000Z",
    last_login: "2026-09-02T10:15:00.000Z",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"
  },
  {
    id: "USR-003",
    username: "KM/34567/18",
    name: "Alex Morgan",
    first_name: "Alex",
    last_name: "Morgan",
    email: "student@school.com",
    studentId: "KM/34567/18",
    passwordHash: bcrypt.hashSync("student123", salt),
    role: "STUDENT",
    department: "Computer Science",
    grade: "Senior",
    phone: "+1 (555) 345-6789",
    is_active: true,
    must_change_password: false,
    created_by: "USR-001",
    created_at: "2026-01-03T00:00:00.000Z",
    updated_at: "2026-01-03T00:00:00.000Z",
    last_login: "2026-09-03T14:20:00.000Z",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250"
  },
  {
    id: "USR-004",
    username: "david.morgan",
    name: "David Morgan",
    first_name: "David",
    last_name: "Morgan",
    email: "parent@school.com",
    passwordHash: bcrypt.hashSync("parent123", salt),
    role: "PARENT",
    children: ["STU-1001"],
    phone: "+1 (555) 456-7890",
    is_active: true,
    must_change_password: false,
    created_by: "USR-001",
    created_at: "2026-01-04T00:00:00.000Z",
    updated_at: "2026-01-04T00:00:00.000Z",
    last_login: "2026-09-03T18:05:00.000Z",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250"
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
  { id: "CLS-09", title: "Grade 9 (Freshman)", code: "G9", level: 9, status: "Active" },
  { id: "CLS-10", title: "Grade 10 (Sophomore)", code: "G10", level: 10, status: "Active" },
  { id: "CLS-11", title: "Grade 11 (Junior)", code: "G11", level: 11, status: "Active" },
  { id: "CLS-12", title: "Grade 12 (Senior)", code: "G12", level: 12, status: "Active" }
];

export const initialSections = [
  // Grade 9 Sections
  { id: "SEC-9A", classId: "CLS-09", title: "Section A", room: "Room 101", capacity: 30, status: "Active" },
  { id: "SEC-9B", classId: "CLS-09", title: "Section B", room: "Room 102", capacity: 30, status: "Active" },
  { id: "SEC-9C", classId: "CLS-09", title: "Section C", room: "Room 103", capacity: 30, status: "Active" },
  // Grade 10 Sections
  { id: "SEC-10A", classId: "CLS-10", title: "Section A", room: "Room 201", capacity: 32, status: "Active" },
  { id: "SEC-10B", classId: "CLS-10", title: "Section B", room: "Room 202", capacity: 32, status: "Active" },
  // Grade 11 Sections
  { id: "SEC-C", classId: "CLS-11", title: "Section A", room: "Room 301", capacity: 35, status: "Active" },
  { id: "SEC-11B", classId: "CLS-11", title: "Section B", room: "Room 302", capacity: 35, status: "Active" },
  // Grade 12 Sections
  { id: "SEC-A", classId: "CLS-12", title: "Section A", room: "Room 401", capacity: 35, status: "Active" },
  { id: "SEC-B", classId: "CLS-12", title: "Section B", room: "Room 402", capacity: 35, status: "Active" }
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
    studentId: "KM/34567/18",
    admissionNo: "KM/34567/18",
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
    studentId: "KM/34568/18",
    admissionNo: "KM/34568/18",
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

export const defaultPeriods = [
  { id: "P-1", period: 1, name: "Period 1", startTime: "08:30", endTime: "09:15", type: "lesson" },
  { id: "P-2", period: 2, name: "Period 2", startTime: "09:20", endTime: "10:05", type: "lesson" },
  { id: "P-BRK", period: "break-1", name: "Morning Break", startTime: "10:05", endTime: "10:25", type: "break" },
  { id: "P-3", period: 3, name: "Period 3", startTime: "10:25", endTime: "11:10", type: "lesson" },
  { id: "P-4", period: 4, name: "Period 4", startTime: "11:15", endTime: "12:00", type: "lesson" },
  { id: "P-LUNCH", period: "lunch", name: "Lunch Break", startTime: "12:00", endTime: "12:45", type: "lunch" },
  { id: "P-5", period: 5, name: "Period 5", startTime: "12:45", endTime: "13:30", type: "lesson" },
  { id: "P-6", period: 6, name: "Period 6", startTime: "13:35", endTime: "14:20", type: "lesson" }
];

export const initialTimetableMasters = [
  {
    id: "TTM-CLS12-SECA",
    classId: "CLS-12",
    sectionId: "SEC-A",
    academicYearId: "AY-2025",
    termId: "TRM-01",
    status: "Published",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    periods: defaultPeriods,
    entries: [
      { id: "TT-001", day: "Monday", period: 1, startTime: "09:00", endTime: "10:00", timeSlot: "09:00 - 10:00 AM", subjectId: "SUB-101", subjectCode: "CS-401", subjectTitle: "Advanced Data Structures & Algorithms", teacherId: "TCH-201", teacherName: "Dr. Robert Vance", room: "Lab 301" },
      { id: "TT-002", day: "Monday", period: 2, startTime: "10:15", endTime: "11:15", timeSlot: "10:15 - 11:15 AM", subjectId: "SUB-102", subjectCode: "MATH-301", subjectTitle: "Calculus & Linear Algebra", teacherId: "TCH-201", teacherName: "Dr. Robert Vance", room: "Room 301" },
      { id: "TT-003", day: "Tuesday", period: 1, startTime: "09:00", endTime: "10:00", timeSlot: "09:00 - 10:00 AM", subjectId: "SUB-103", subjectCode: "ENG-201", subjectTitle: "World Literature & Composition", teacherId: "", teacherName: "Unassigned", room: "Room 302" },
      { id: "TT-004", day: "Wednesday", period: 3, startTime: "11:30", endTime: "12:30", timeSlot: "11:30 - 12:30 PM", subjectId: "SUB-104", subjectCode: "PHY-202", subjectTitle: "General Physics & Mechanics", teacherId: "", teacherName: "Unassigned", room: "Physics Lab" },
      { id: "TT-005", day: "Thursday", period: 2, startTime: "09:20", endTime: "10:05", timeSlot: "09:20 - 10:05 AM", subjectId: "SUB-101", subjectCode: "CS-401", subjectTitle: "Advanced Data Structures & Algorithms", teacherId: "TCH-201", teacherName: "Dr. Robert Vance", room: "Lab 301" },
      { id: "TT-006", day: "Friday", period: 1, startTime: "08:30", endTime: "09:15", timeSlot: "08:30 - 09:15 AM", subjectId: "SUB-102", subjectCode: "MATH-301", subjectTitle: "Calculus & Linear Algebra", teacherId: "TCH-201", teacherName: "Dr. Robert Vance", room: "Room 401" }
    ]
  },
  {
    id: "TTM-CLS11-SECC",
    classId: "CLS-11",
    sectionId: "SEC-C",
    academicYearId: "AY-2025",
    termId: "TRM-01",
    status: "Published",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    periods: defaultPeriods,
    entries: [
      { id: "TT-011", day: "Monday", period: 3, startTime: "10:25", endTime: "11:10", timeSlot: "10:25 - 11:10 AM", subjectId: "SUB-102", subjectCode: "MATH-301", subjectTitle: "Calculus & Linear Algebra", teacherId: "TCH-201", teacherName: "Dr. Robert Vance", room: "Room 301" },
      { id: "TT-012", day: "Wednesday", period: 2, startTime: "09:20", endTime: "10:05", timeSlot: "09:20 - 10:05 AM", subjectId: "SUB-104", subjectCode: "PHY-202", subjectTitle: "General Physics & Mechanics", teacherId: "", teacherName: "Unassigned", room: "Physics Lab" },
      { id: "TT-013", day: "Friday", period: 2, startTime: "09:20", endTime: "10:05", timeSlot: "09:20 - 10:05 AM", subjectId: "SUB-101", subjectCode: "CS-401", subjectTitle: "Advanced Data Structures & Algorithms", teacherId: "TCH-201", teacherName: "Dr. Robert Vance", room: "Lab 301" }
    ]
  },
  {
    id: "TTM-CLS09-SEC9A",
    classId: "CLS-09",
    sectionId: "SEC-9A",
    academicYearId: "AY-2025",
    termId: "TRM-01",
    status: "Published",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    periods: defaultPeriods,
    entries: [
      { id: "TT-021", day: "Monday", period: 4, startTime: "11:15", endTime: "12:00", timeSlot: "11:15 - 12:00 PM", subjectId: "SUB-103", subjectCode: "ENG-201", subjectTitle: "World Literature & Composition", teacherId: "", teacherName: "Unassigned", room: "Room 101" },
      { id: "TT-022", day: "Tuesday", period: 2, startTime: "09:20", endTime: "10:05", timeSlot: "09:20 - 10:05 AM", subjectId: "SUB-102", subjectCode: "MATH-301", subjectTitle: "Calculus & Linear Algebra", teacherId: "TCH-201", teacherName: "Dr. Robert Vance", room: "Room 101" },
      { id: "TT-023", day: "Thursday", period: 1, startTime: "08:30", endTime: "09:15", timeSlot: "08:30 - 09:15 AM", subjectId: "SUB-104", subjectCode: "PHY-202", subjectTitle: "General Physics & Mechanics", teacherId: "", teacherName: "Unassigned", room: "Physics Lab" }
    ]
  }
];

export const initialTimetables = [
  ...initialTimetableMasters.flatMap(tm => tm.entries.map(e => ({
    ...e,
    timetableId: tm.id,
    classId: tm.classId,
    sectionId: tm.sectionId,
    academicYearId: tm.academicYearId,
    termId: tm.termId,
    status: tm.status
  })))
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

export const initialMessages = [
  {
    id: "MSG-101",
    senderId: "USR-002",
    senderName: "Dr. Robert Vance",
    senderRole: "TEACHER",
    recipientId: "USR-004",
    recipientName: "David Morgan",
    recipientRole: "PARENT",
    subject: "Alex's Academic Progress in CS-401",
    content: "Dear Mr. Morgan, Alex demonstrated outstanding mastery in our recent Data Structures assessment (94%). Keep encouraging his interest in software architecture.",
    createdAt: "2026-08-27T10:30:00.000Z",
    isRead: false
  },
  {
    id: "MSG-102",
    senderId: "USR-003",
    senderName: "Alex Morgan",
    senderRole: "STUDENT",
    recipientId: "USR-002",
    recipientName: "Dr. Robert Vance",
    recipientRole: "TEACHER",
    subject: "Question regarding AVL tree rotations",
    content: "Dr. Vance, for assignment ASN-001, should we handle left-right double rotations iteratively or recursively in the delete method?",
    createdAt: "2026-08-28T14:15:00.000Z",
    isRead: true
  },
  {
    id: "MSG-103",
    senderId: "USR-001",
    senderName: "System Administrator",
    senderRole: "ADMIN",
    recipientId: "USR-002",
    recipientName: "Dr. Robert Vance",
    recipientRole: "TEACHER",
    subject: "Faculty Curriculum Review Session",
    content: "Reminder that the quarterly curriculum and accreditation review meets this Thursday in Conference Room B.",
    createdAt: "2026-08-29T09:00:00.000Z",
    isRead: true
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

    this.timetableMasters = JSON.parse(JSON.stringify(initialTimetableMasters));
    this.timetables = [...initialTimetables];
    this.attendanceRecords = [...initialAttendanceRecords];
    this.assignments = [...initialAssignments];
    this.submissions = [...initialSubmissions];
    this.exams = [...initialExams];
    this.results = [...initialResults];

    // Phase 4 Collections
    this.announcements = [...initialAnnouncements];
    this.notifications = [...initialNotifications];
    this.messages = [...initialMessages];

    // Phase 5 Audit Store
    this.auditLogs = [];

    // Authentication Activity Audit Store
    this.authLogs = [
      {
        id: "AUTH-INIT-01",
        userId: "USR-001",
        username: "admin",
        name: "System Administrator",
        role: "ADMIN",
        type: "LOGIN_SUCCESS",
        status: "SUCCESS",
        ip: "127.0.0.1",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: "AUTH-INIT-02",
        userId: "USR-002",
        username: "robert.vance",
        name: "Dr. Robert Vance",
        role: "TEACHER",
        type: "LOGIN_SUCCESS",
        status: "SUCCESS",
        ip: "127.0.0.1",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        timestamp: new Date(Date.now() - 7200000).toISOString()
      }
    ];

    // School Settings Store
    this.schoolSettings = {
      name: "Greenwood International Academy",
      motto: "Excellence in Knowledge & Character",
      logoUrl: "/logo.png",
      studentIdPrefix: "KM",
      studentIdSequence: 34566,
      studentIdYear: "18",
      email: "info@greenwood.edu",
      phone: "+1 (555) 234-5678",
      address: "100 Education Way, Innovation City",
      academicYear: "AY 2025-2026",
      term: "Fall Term 2026"
    };

    // Sequential Student ID Allocation Mutex Queue
    this._studentIdLock = Promise.resolve();
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

  // Authentication Activity Audit Log Methods
  logAuthActivity(entry) {
    const log = {
      id: `AUTH-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      ...entry
    };
    this.authLogs.unshift(log);
    if (this.authLogs.length > 200) this.authLogs.pop();
    return log;
  }

  getAuthLogs(limit = 10) {
    return this.authLogs.slice(0, limit);
  }

  // School Settings Methods
  getSchoolSettings() {
    return this.schoolSettings;
  }

  updateSchoolSettings(data) {
    this.schoolSettings = { ...this.schoolSettings, ...data };
    return this.schoolSettings;
  }

  /**
   * Thread-safe Student ID generator: KM/{SEQUENCE}/{YEAR}
   * Preserves existing student IDs immutably without renumbering.
   * Deterministically allocates next sequence (starts at 34567).
   */
  allocateNextStudentId() {
    const prefix = this.schoolSettings.studentIdPrefix || 'KM';
    const year = this.schoolSettings.studentIdYear || '18';
    const pattern = new RegExp(`^${prefix}/(\\d+)/${year}$`, 'i');

    let maxSeq = parseInt(this.schoolSettings.studentIdSequence, 10) || 34566;

    // Scan all existing students to find highest allocated sequence
    for (const s of this.students) {
      const candidate = s.admissionNo || s.studentId || s.id;
      if (candidate) {
        const match = candidate.match(pattern);
        if (match) {
          const seq = parseInt(match[1], 10);
          if (!isNaN(seq) && seq > maxSeq) {
            maxSeq = seq;
          }
        }
      }
    }

    const nextSeq = maxSeq + 1;
    this.schoolSettings.studentIdSequence = nextSeq;
    return `${prefix}/${nextSeq}/${year}`;
  }

  // Users
  getUsers() { return this.users; }
  findUserByEmail(email) {
    if (!email) return null;
    return this.users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
  }
  findUserByUsername(username) {
    if (!username) return null;
    return this.users.find(u => u.username && u.username.toLowerCase() === username.toLowerCase());
  }
  findUserByUsernameOrEmail(identifier) {
    if (!identifier) return null;
    const clean = identifier.trim().toLowerCase();
    return this.users.find(u => 
      (u.username && u.username.toLowerCase() === clean) ||
      (u.studentId && u.studentId.toLowerCase() === clean) ||
      (u.aliasUsername && u.aliasUsername.toLowerCase() === clean) ||
      (u.email && u.email.toLowerCase() === clean) ||
      (u.id === 'USR-003' && clean === 'alex.morgan')
    );
  }
  findUserById(id) { return this.users.find(u => u.id === id); }

  createUser(userData) {
    const newUser = {
      id: `USR-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
      must_change_password: true,
      last_login: null,
      ...userData,
      // Normalize role uppercase
      role: (userData.role || 'STUDENT').toUpperCase(),
      name: userData.name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim()
    };
    this.users.push(newUser);
    return newUser;
  }

  updateUser(id, data) {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) return null;

    // Disallow role modification through general profile update
    const { role, passwordHash, id: _id, ...safeUpdates } = data;
    this.users[idx] = {
      ...this.users[idx],
      ...safeUpdates,
      name: safeUpdates.name || `${safeUpdates.first_name || this.users[idx].first_name || ''} ${safeUpdates.last_name || this.users[idx].last_name || ''}`.trim(),
      updated_at: new Date().toISOString()
    };
    return this.users[idx];
  }

  setUserActiveStatus(id, isActive) {
    const user = this.findUserById(id);
    if (!user) return null;
    user.is_active = !!isActive;
    user.updated_at = new Date().toISOString();
    return user;
  }

  resetUserPassword(id, passwordHash) {
    const user = this.findUserById(id);
    if (!user) return null;
    user.passwordHash = passwordHash;
    user.must_change_password = true;
    user.updated_at = new Date().toISOString();
    return user;
  }

  recordUserLogin(id) {
    const user = this.findUserById(id);
    if (user) {
      user.last_login = new Date().toISOString();
    }
  }

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
  getSectionsByClass(classId) {
    if (!classId) return this.sections;
    return this.sections.filter(s => s.classId === classId);
  }
  findSectionById(id) {
    return this.sections.find(s => s.id === id);
  }
  addSection(data) {
    const newSec = {
      id: `SEC-${Date.now()}`,
      status: 'Active',
      capacity: 35,
      ...data
    };
    this.sections.push(newSec);
    return newSec;
  }
  updateSection(id, data) {
    const idx = this.sections.findIndex(s => s.id === id);
    if (idx === -1) return null;
    this.sections[idx] = { ...this.sections[idx], ...data };
    return this.sections[idx];
  }
  deleteSection(id) {
    this.sections = this.sections.filter(s => s.id !== id);
    if (this.timetableMasters) {
      this.timetableMasters = this.timetableMasters.filter(tm => tm.sectionId !== id);
    }
    this.timetables = this.timetables.filter(t => t.sectionId !== id);
    return true;
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
  getTimetableMasters() { return this.timetableMasters; }
  getTimetableMasterById(id) { return this.timetableMasters.find(t => t.id === id); }
  findTimetableMaster(classId, sectionId, academicYearId, termId) {
    return this.timetableMasters.find(t => {
      const matchClass = !classId || t.classId === classId;
      const matchSection = !sectionId || t.sectionId === sectionId;
      const matchYear = !academicYearId || t.academicYearId === academicYearId;
      const matchTerm = !termId || t.termId === termId;
      return matchClass && matchSection && matchYear && matchTerm;
    });
  }

  saveTimetableMaster(data) {
    const now = new Date().toISOString();
    let master;
    
    let existingIndex = -1;
    if (data.id && data.id !== 'undefined') {
      existingIndex = this.timetableMasters.findIndex(t => t.id === data.id);
    }
    if (existingIndex === -1 && data.classId && data.sectionId) {
      existingIndex = this.timetableMasters.findIndex(t => 
        t.classId === data.classId && 
        t.sectionId === data.sectionId && 
        t.academicYearId === (data.academicYearId || 'AY-2025') && 
        t.termId === (data.termId || 'TRM-01')
      );
    }

    if (existingIndex >= 0) {
      master = {
        ...this.timetableMasters[existingIndex],
        ...data,
        id: this.timetableMasters[existingIndex].id,
        updatedAt: now,
        periods: (data.periods && data.periods.length > 0) ? data.periods : (this.timetableMasters[existingIndex].periods || defaultPeriods),
        entries: Array.isArray(data.entries) ? data.entries : (this.timetableMasters[existingIndex].entries || [])
      };
      this.timetableMasters[existingIndex] = master;
    } else {
      const generatedId = (data.id && data.id !== 'undefined') ? data.id : `TTM-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      master = {
        ...data,
        id: generatedId,
        status: data.status || 'Draft',
        createdAt: now,
        updatedAt: now,
        periods: (data.periods && data.periods.length > 0) ? data.periods : defaultPeriods,
        entries: Array.isArray(data.entries) ? data.entries : []
      };
      this.timetableMasters.push(master);
    }

    // Synchronize flat timetables collection
    // Remove existing slots belonging to this timetable master
    this.timetables = this.timetables.filter(t => t.timetableId !== master.id && !(t.sectionId && t.sectionId === master.sectionId && t.academicYearId === master.academicYearId && t.termId === master.termId));

    // Add updated slots
    if (Array.isArray(master.entries)) {
      master.entries.forEach(entry => {
        const slot = {
          ...entry,
          id: entry.id || `TT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          timetableId: master.id,
          classId: master.classId,
          sectionId: master.sectionId,
          academicYearId: master.academicYearId,
          termId: master.termId,
          status: master.status
        };
        this.timetables.push(slot);
      });
    }

    return master;
  }

  deleteTimetableMaster(id) {
    this.timetableMasters = this.timetableMasters.filter(t => t.id !== id);
    this.timetables = this.timetables.filter(t => t.timetableId !== id);
    return true;
  }

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

  // Phase 5 Methods: Real Messages
  getMessages(userId) {
    if (!userId) return this.messages;
    return this.messages.filter(m => m.recipientId === userId || m.senderId === userId);
  }

  sendMessage(data) {
    const newMsg = {
      id: `MSG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      isRead: false,
      ...data
    };
    this.messages.unshift(newMsg);
    return newMsg;
  }

  markMessageAsRead(id, userId) {
    const msg = this.messages.find(m => m.id === id);
    if (msg && (!userId || msg.recipientId === userId)) {
      msg.isRead = true;
      return msg;
    }
    return null;
  }
}

export const db = new DatabaseStore();
