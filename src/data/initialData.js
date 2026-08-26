export const initialStudents = [
  {
    id: "STU-1001",
    name: "Alex Morgan",
    email: "alex.morgan@university.edu",
    grade: "Senior",
    department: "Computer Science",
    gpa: 3.85,
    status: "Active",
    enrollmentDate: "2023-09-01",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"
  },
  {
    id: "STU-1002",
    name: "Sophia Chen",
    email: "sophia.chen@university.edu",
    grade: "Junior",
    department: "Electrical Engineering",
    gpa: 3.92,
    status: "Active",
    enrollmentDate: "2024-01-15",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=250"
  },
  {
    id: "STU-1003",
    name: "Marcus Vance",
    email: "marcus.v@university.edu",
    grade: "Sophomore",
    department: "Business Administration",
    gpa: 3.40,
    status: "Active",
    enrollmentDate: "2024-09-01",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=250"
  },
  {
    id: "STU-1004",
    name: "Emily Watson",
    email: "emily.w@university.edu",
    grade: "Freshman",
    department: "Data Science",
    gpa: 3.65,
    status: "Active",
    enrollmentDate: "2025-09-01",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250"
  },
  {
    id: "STU-1005",
    name: "Liam O'Connor",
    email: "liam.oc@university.edu",
    grade: "Senior",
    department: "Mechanical Engineering",
    gpa: 3.12,
    status: "On Leave",
    enrollmentDate: "2023-09-01",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250"
  }
];

export const initialTeachers = [
  {
    id: "FAC-201",
    name: "Dr. Robert Vance",
    email: "robert.vance@university.edu",
    department: "Computer Science",
    role: "Department Chair",
    coursesAssigned: 3,
    status: "Active"
  },
  {
    id: "FAC-202",
    name: "Prof. Elena Rostova",
    email: "elena.r@university.edu",
    department: "Electrical Engineering",
    role: "Associate Professor",
    coursesAssigned: 2,
    status: "Active"
  },
  {
    id: "FAC-203",
    name: "Dr. Sarah Jenkins",
    email: "sarah.j@university.edu",
    department: "Data Science",
    role: "Senior Lecturer",
    coursesAssigned: 4,
    status: "Active"
  }
];

export const initialCourses = [
  {
    code: "CS-401",
    title: "Advanced Data Structures & Algorithms",
    department: "Computer Science",
    credits: 4,
    instructor: "Dr. Robert Vance",
    enrolled: 42,
    capacity: 50
  },
  {
    code: "DS-302",
    title: "Machine Learning & Neural Networks",
    department: "Data Science",
    credits: 3,
    instructor: "Dr. Sarah Jenkins",
    enrolled: 38,
    capacity: 40
  },
  {
    code: "EE-210",
    title: "Digital Logic & Circuit Design",
    department: "Electrical Engineering",
    credits: 4,
    instructor: "Prof. Elena Rostova",
    enrolled: 29,
    capacity: 35
  }
];

export const initialAttendance = [
  { studentId: "STU-1001", name: "Alex Morgan", status: "Present", date: "2026-08-26" },
  { studentId: "STU-1002", name: "Sophia Chen", status: "Present", date: "2026-08-26" },
  { studentId: "STU-1003", name: "Marcus Vance", status: "Late", date: "2026-08-26" },
  { studentId: "STU-1004", name: "Emily Watson", status: "Present", date: "2026-08-26" },
  { studentId: "STU-1005", name: "Liam O'Connor", status: "Absent", date: "2026-08-26" }
];
