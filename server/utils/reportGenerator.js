import { calculateAttendanceStats } from './academicCalculations.js';

export const generateStudentReport = (db, studentId) => {
  const student = db.getStudents().find((s) => s.id === studentId);
  if (!student) return null;

  const results = db.getResults().filter((r) => r.studentId === studentId);
  const attendance = db.getAttendance().filter((a) => a.studentId === studentId);
  const attendanceStats = calculateAttendanceStats(attendance, studentId);
  const submissions = db.getSubmissions().filter((s) => s.studentId === studentId);
  const parent = db.getParents().find((p) => p.studentIds?.includes(studentId));

  return {
    school: db.getSchoolProfile(),
    student,
    parent,
    academicStanding: student.gpa >= 3.8 ? 'Summa Cum Laude' : student.gpa >= 3.5 ? "Dean's List" : 'Good Standing',
    results,
    attendanceStats,
    assignmentsCompleted: submissions.length,
    generatedAt: new Date().toISOString()
  };
};

export const generateAnalyticsData = (db) => {
  const students = db.getStudents();
  const teachers = db.getTeachers();
  const classes = db.getClasses();
  const subjects = db.getSubjects();
  const attendance = db.getAttendance();
  const results = db.getResults();

  const totalStudents = students.length || 1;
  const passedResults = results.filter((r) => r.marksObtained >= 60).length;
  const passRate = Math.round((passedResults / (results.length || 1)) * 100);

  const presentCount = attendance.filter((a) => a.status === 'Present').length;
  const attendanceRate = Math.round((presentCount / (attendance.length || 1)) * 100);

  return {
    totalStudents: students.length,
    totalTeachers: teachers.length,
    totalClasses: classes.length,
    totalSubjects: subjects.length,
    overallPassRate: passRate,
    overallAttendanceRate: attendanceRate,
    gradeDistribution: {
      A: results.filter((r) => r.letterGrade === 'A').length,
      B: results.filter((r) => r.letterGrade === 'B').length,
      C: results.filter((r) => r.letterGrade === 'C').length,
      D: results.filter((r) => r.letterGrade === 'D').length,
      F: results.filter((r) => r.letterGrade === 'F').length
    }
  };
};
