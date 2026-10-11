import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';
import { checkTimetableConflict, calculateGrade, calculateAttendanceStats } from '../utils/academicCalculations.js';
import { generateStudentReport, generateAnalyticsData } from '../utils/reportGenerator.js';
import { JWT_SECRET } from '../middleware/authMiddleware.js';
import { runAuthRbacTestSuite } from './testAuthRbacSuite.js';
import { runFullAuditTestSuite } from './testFullAuditSuite.js';

const runTests = async () => {
  console.log('\n======================================================');
  console.log('🧪 SCHOOL MANAGEMENT SYSTEM - AUTOMATED TEST SUITE');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName) => {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  };

  // Test 1: Database Seed Integrity
  assert(db.getUsers().length >= 4, 'Database initialized with pre-seeded users');
  assert(db.findUserByEmail('admin@school.com')?.role?.toUpperCase() === 'ADMIN', 'Admin user present with ADMIN role');
  assert(db.findUserByEmail('teacher@school.com')?.role?.toUpperCase() === 'TEACHER', 'Teacher user present with TEACHER role');
  assert(db.findUserByEmail('student@school.com')?.role?.toUpperCase() === 'STUDENT', 'Student user present with STUDENT role');
  assert(db.findUserByEmail('parent@school.com')?.role?.toUpperCase() === 'PARENT', 'Parent user present with PARENT role');

  // Test 2: JWT Security Token Verification
  const token = jwt.sign({ id: 'USR-001', role: 'Admin' }, JWT_SECRET, { expiresIn: '1h' });
  const decoded = jwt.verify(token, JWT_SECRET);
  assert(decoded.id === 'USR-001' && decoded.role === 'Admin', 'JWT Token generation and verification');

  // Test 3: Timetable Conflict Engine
  const existingSlot = { id: 'TT-1', day: 'Monday', period: 1, teacherId: 'TCH-201', room: 'Room 301', classId: 'CLS-12' };
  const conflictingSlot = { id: 'TT-2', day: 'Monday', period: 1, teacherId: 'TCH-201', room: 'Room 302', classId: 'CLS-11' };
  const validSlot = { id: 'TT-3', day: 'Tuesday', period: 1, teacherId: 'TCH-201', room: 'Room 301', classId: 'CLS-12' };

  const conflictRes = checkTimetableConflict([existingSlot], conflictingSlot);
  assert(conflictRes.hasConflict === true, 'Timetable Conflict Engine detects overlapping teacher period');

  const validRes = checkTimetableConflict([existingSlot], validSlot);
  assert(validRes.hasConflict === false, 'Timetable Conflict Engine permits valid non-overlapping schedule slot');

  // Test 4: Grade & GPA Calculations
  const gradeA = calculateGrade(95, 100);
  assert(gradeA.letter === 'A' && gradeA.gpa === 4.0, 'Grade Calculator computes 95% as Grade A (GPA 4.0)');

  const gradeF = calculateGrade(45, 100);
  assert(gradeF.letter === 'F' && gradeF.gpa === 0.0, 'Grade Calculator computes 45% as Grade F (GPA 0.0)');

  // Test 5: Attendance Stats
  const mockAttendance = [
    { studentId: 'STU-1', status: 'Present' },
    { studentId: 'STU-1', status: 'Present' },
    { studentId: 'STU-1', status: 'Absent' }
  ];
  const attStats = calculateAttendanceStats(mockAttendance, 'STU-1');
  assert(attStats.percentage === 67, 'Attendance Calculator computes 67% attendance rate');

  // Test 6: Report Card Generator
  const report = generateStudentReport(db, 'STU-1001');
  assert(report && report.student.id === 'STU-1001', 'Report Card Generator compiles student academic dossier');

  // Run the 13-Test RBAC & Authentication Suite
  const rbacRes = await runAuthRbacTestSuite();
  passed += rbacRes.passed;
  failed += rbacRes.failed;

  // Run the 23-Test Full Audit & Verification Suite
  const auditRes = await runFullAuditTestSuite();
  passed += auditRes.passed;
  failed += auditRes.failed;

  // Run the 17-Test Timetable Management Suite
  const { runTimetableTestSuite } = await import('./testTimetableSuite.js');
  const timetableRes = await runTimetableTestSuite();
  passed += timetableRes.passed;
  failed += timetableRes.failed;

  // Summary
  console.log('\n======================================================');
  console.log(`📊 COMPLETE TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  if (failed > 0) process.exit(1);
};

runTests();

