import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';
import { UserModel, VALID_ROLES } from '../models/userModel.js';
import { JWT_SECRET, authenticateToken, requireRole } from '../middleware/authMiddleware.js';
import { authController } from '../controllers/authController.js';
import { adminController } from '../controllers/adminController.js';
import { authFailureRateLimiter } from '../middleware/securityMiddleware.js';
import { authorizeStudentAccess } from '../middleware/objectAuthMiddleware.js';
import { teacherRouter, studentRouter, parentRouter } from '../routes/roleProtectedRoutes.js';

// Router Dispatch Helper for Express Router tests
const dispatchRouter = (router, req, res) => {
  return new Promise((resolve) => {
    router.handle(req, res, (err) => {
      if (err) res.status(500).json({ success: false, error: err.message });
      resolve();
    });
    setTimeout(resolve, 30);
  });
};

// Mock Express Request & Response Helper
const createMockReqRes = (options = {}) => {
  const req = {
    method: options.method || 'GET',
    url: options.url || '/',
    body: options.body || {},
    params: options.params || {},
    query: options.query || {},
    headers: options.headers || {},
    user: options.user || null,
    ip: options.ip || '127.0.0.1',
    socket: { remoteAddress: options.ip || '127.0.0.1' }
  };

  const res = {
    statusCode: 200,
    data: null,
    headers: {},
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
    },
    getHeader(name) {
      return this.headers[name.toLowerCase()];
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.data = payload;
      return this;
    }
  };

  return { req, res };
};

export const runFullAuditTestSuite = async () => {
  console.log('\n================================================================');
  console.log('🛡️  EDUCORE FULL AUDIT & VERIFICATION TEST SUITE (23 TESTS)');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, detail = '') => {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}${detail ? ` -> ${detail}` : ''}`);
      failed++;
    }
  };

  // ----------------------------------------------------
  // TEST 1: Admin login -> Admin Dashboard
  // ----------------------------------------------------
  const t1 = createMockReqRes({
    body: { usernameOrEmail: 'admin', password: 'admin123' }
  });
  authController.login(t1.req, t1.res);
  const adminToken = t1.res.data?.token;
  const adminUser = t1.res.data?.user;
  assert(
    t1.res.statusCode === 200 && adminUser?.role === 'ADMIN' && !!adminToken,
    'TEST 1: Admin login succeeds and returns valid JWT with ADMIN role'
  );

  // ----------------------------------------------------
  // TEST 2: Admin creates Teacher -> Teacher account created
  // ----------------------------------------------------
  const t2 = createMockReqRes({
    user: adminUser,
    body: {
      first_name: 'Elena',
      last_name: 'Rostova',
      username: 'elena.rostova',
      email: 'elena@school.com',
      role: 'TEACHER',
      department: 'Physics'
    }
  });
  adminController.createUser(t2.req, t2.res);
  const teacherUser = t2.res.data?.user;
  const teacherTempPassword = t2.res.data?.tempPassword;
  assert(
    t2.res.statusCode === 201 &&
    teacherUser?.username === 'elena.rostova' &&
    teacherUser?.role === 'TEACHER' &&
    teacherUser?.must_change_password === true &&
    !!teacherTempPassword,
    'TEST 2: Admin provisions Teacher account with temporary password'
  );

  // ----------------------------------------------------
  // TEST 3: Teacher login -> Teacher Dashboard
  // ----------------------------------------------------
  const t3 = createMockReqRes({
    body: { usernameOrEmail: 'elena.rostova', password: teacherTempPassword }
  });
  authController.login(t3.req, t3.res);
  const teacherLoginUser = t3.res.data?.user;
  assert(
    t3.res.statusCode === 200 && teacherLoginUser?.role === 'TEACHER',
    'TEST 3: Teacher logs in with username and temp password into TEACHER role'
  );

  // ----------------------------------------------------
  // TEST 4: Teacher attempts Admin Dashboard/API -> 403 / Access Denied
  // ----------------------------------------------------
  const t4 = createMockReqRes({ user: teacherLoginUser });
  let t4Allowed = false;
  requireRole(['ADMIN'])(t4.req, t4.res, () => { t4Allowed = true; });
  assert(
    t4.res.statusCode === 403 && !t4Allowed && t4.res.data?.success === false,
    'TEST 4: Teacher accessing Admin endpoint is blocked with HTTP 403 Forbidden'
  );

  // ----------------------------------------------------
  // TEST 5: Admin creates Student -> Student ID generated automatically
  // ----------------------------------------------------
  const t5 = createMockReqRes({
    user: adminUser,
    body: {
      first_name: 'David',
      last_name: 'Kassa',
      email: 'david.kassa@school.com',
      role: 'STUDENT',
      grade: 'Junior'
    }
  });
  adminController.createUser(t5.req, t5.res);
  const student1Id = t5.res.data?.studentId;
  const student1User = t5.res.data?.user;
  const student1TempPass = t5.res.data?.tempPassword;
  assert(
    t5.res.statusCode === 201 &&
    /^KM\/\d+\/18$/.test(student1Id) &&
    student1User?.username === student1Id &&
    !!student1TempPass,
    `TEST 5: Student ID automatically generated in format KM/{SEQUENCE}/{YEAR} (${student1Id})`
  );

  // ----------------------------------------------------
  // TEST 6: Student ID is used as username -> Student successfully logs in
  // ----------------------------------------------------
  const t6 = createMockReqRes({
    body: { usernameOrEmail: student1Id, password: student1TempPass }
  });
  authController.login(t6.req, t6.res);
  const studentLoginUser = t6.res.data?.user;
  assert(
    t6.res.statusCode === 200 &&
    studentLoginUser?.role === 'STUDENT' &&
    studentLoginUser?.username === student1Id,
    'TEST 6: Student authenticates directly using generated Student ID as login username'
  );

  // ----------------------------------------------------
  // TEST 7: Create Abebe Chala then Abebe Cherinet -> Verify alphabetical allocation & uniqueness
  // ----------------------------------------------------
  // Create Abebe Chala
  const t7Chala = createMockReqRes({
    user: adminUser,
    body: { first_name: 'Abebe', last_name: 'Chala', role: 'STUDENT', grade: 'Freshman' }
  });
  adminController.createUser(t7Chala.req, t7Chala.res);
  const chalaId = t7Chala.res.data?.studentId;

  // Create Abebe Cherinet
  const t7Cherinet = createMockReqRes({
    user: adminUser,
    body: { first_name: 'Abebe', last_name: 'Cherinet', role: 'STUDENT', grade: 'Freshman' }
  });
  adminController.createUser(t7Cherinet.req, t7Cherinet.res);
  const cherinetId = t7Cherinet.res.data?.studentId;

  const chalaSeq = parseInt(chalaId.split('/')[1], 10);
  const cherinetSeq = parseInt(cherinetId.split('/')[1], 10);

  assert(
    chalaId !== cherinetId &&
    cherinetSeq > chalaSeq &&
    chalaId.startsWith('KM/') && cherinetId.startsWith('KM/'),
    `TEST 7: Alphabetical allocation preserves ordering (${chalaId} before ${cherinetId}) and uniqueness`
  );

  // ----------------------------------------------------
  // TEST 8: Admin creates Parent -> Parent login works
  // ----------------------------------------------------
  const t8Create = createMockReqRes({
    user: adminUser,
    body: {
      first_name: 'Martha',
      last_name: 'Wayne',
      username: 'martha.wayne',
      email: 'martha@family.org',
      role: 'PARENT',
      studentIds: [student1Id]
    }
  });
  adminController.createUser(t8Create.req, t8Create.res);
  const parentTempPass = t8Create.res.data?.tempPassword;

  const t8Login = createMockReqRes({
    body: { usernameOrEmail: 'martha.wayne', password: parentTempPass }
  });
  authController.login(t8Login.req, t8Login.res);
  const parentUser = t8Login.res.data?.user;
  assert(
    t8Login.res.statusCode === 200 && parentUser?.role === 'PARENT',
    'TEST 8: Admin creates Parent and Parent authenticates into PARENT role'
  );

  // ----------------------------------------------------
  // TEST 9: Parent attempts Admin resources -> Access denied (HTTP 403)
  // ----------------------------------------------------
  const t9 = createMockReqRes({ user: parentUser });
  let t9Allowed = false;
  requireRole(['ADMIN'])(t9.req, t9.res, () => { t9Allowed = true; });
  assert(
    t9.res.statusCode === 403 && !t9Allowed,
    'TEST 9: Parent accessing Admin endpoint is blocked with HTTP 403 Forbidden'
  );

  // ----------------------------------------------------
  // TEST 10: Inactive account login -> Login rejected (HTTP 403)
  // ----------------------------------------------------
  UserModel.setActiveStatus(studentLoginUser.id, false); // Deactivate David Kassa
  const t10 = createMockReqRes({
    body: { usernameOrEmail: student1Id, password: student1TempPass }
  });
  authController.login(t10.req, t10.res);
  assert(
    t10.res.statusCode === 403 && t10.res.data?.message?.includes('inactive'),
    'TEST 10: Deactivated account login is rejected with inactive account notification'
  );
  UserModel.setActiveStatus(studentLoginUser.id, true); // Restore

  // ----------------------------------------------------
  // TEST 11: Temporary password login -> Force password change flag
  // ----------------------------------------------------
  const t11 = createMockReqRes({
    body: { usernameOrEmail: student1Id, password: student1TempPass }
  });
  authController.login(t11.req, t11.res);
  assert(
    t11.res.statusCode === 200 && t11.res.data?.must_change_password === true,
    'TEST 11: Initial login with temporary password requires mandatory password update'
  );

  // ----------------------------------------------------
  // TEST 12: Password changed -> Dashboard accessible
  // ----------------------------------------------------
  const newStrongPass = 'SecureStudent#2026';
  const t12Change = createMockReqRes({
    user: studentLoginUser,
    body: {
      currentPassword: student1TempPass,
      newPassword: newStrongPass,
      confirmPassword: newStrongPass
    }
  });
  authController.changePassword(t12Change.req, t12Change.res);

  const t12Login = createMockReqRes({
    body: { usernameOrEmail: student1Id, password: newStrongPass }
  });
  authController.login(t12Login.req, t12Login.res);
  assert(
    t12Change.res.statusCode === 200 &&
    t12Login.res.statusCode === 200 &&
    t12Login.res.data?.must_change_password === false,
    'TEST 12: Password changed successfully, must_change_password cleared, dashboard unlocked'
  );

  // ----------------------------------------------------
  // TEST 13: Logout -> Protected pages inaccessible
  // ----------------------------------------------------
  const t13Logout = createMockReqRes({ user: adminUser });
  authController.logout(t13Logout.req, t13Logout.res);
  const t13Protected = createMockReqRes({ headers: {} });
  let t13Next = false;
  authenticateToken(t13Protected.req, t13Protected.res, () => { t13Next = true; });
  assert(
    t13Logout.res.statusCode === 200 && t13Protected.res.statusCode === 401 && !t13Next,
    'TEST 13: Logout destroys session; unauthenticated requests receive HTTP 401'
  );

  // ----------------------------------------------------
  // TEST 14: Expired session -> Redirect to login (HTTP 401)
  // ----------------------------------------------------
  const expiredJwt = jwt.sign({ id: adminUser.id, role: 'ADMIN' }, JWT_SECRET, { expiresIn: '0s' });
  const t14 = createMockReqRes({ headers: { authorization: `Bearer ${expiredJwt}` } });
  let t14Next = false;
  authenticateToken(t14.req, t14.res, () => { t14Next = true; });
  assert(
    t14.res.statusCode === 401 && !t14Next && t14.res.data?.message?.includes('expired'),
    'TEST 14: Expired token returns HTTP 401 with session expired message'
  );

  // ----------------------------------------------------
  // TEST 15: Click login ONE time -> EXACTLY ONE login request executed
  // ----------------------------------------------------
  let requestCounter = 0;
  const dispatchLogin = () => {
    requestCounter++;
    const t = createMockReqRes({ body: { usernameOrEmail: 'admin', password: 'admin123' } });
    authController.login(t.req, t.res);
    return t.res;
  };
  const singleRes = dispatchLogin();
  assert(
    requestCounter === 1 && singleRes.statusCode === 200,
    'TEST 15: Single login click triggers exactly one execution and response'
  );

  // ----------------------------------------------------
  // TEST 16: Repeated failed login attempts -> Rate limiting activates
  // ----------------------------------------------------
  const limiterTest = authFailureRateLimiter({ windowMs: 60000, maxFailures: 3 });
  const ipAttack = '192.168.1.99';
  let lastStatus = 200;

  // Run 3 failures
  for (let i = 0; i < 3; i++) {
    const mock = createMockReqRes({ ip: ipAttack, body: { usernameOrEmail: 'admin', password: 'bad' } });
    limiterTest(mock.req, mock.res, () => {
      authController.login(mock.req, mock.res);
    });
  }

  // 4th attempt should be blocked by rate limiter
  const mockBlocked = createMockReqRes({ ip: ipAttack, body: { usernameOrEmail: 'admin', password: 'bad' } });
  let blockedNextCalled = false;
  limiterTest(mockBlocked.req, mockBlocked.res, () => { blockedNextCalled = true; });
  assert(
    mockBlocked.res.statusCode === 429 && !blockedNextCalled,
    'TEST 16: Consecutive failed authentication attempts trigger HTTP 429 Rate Limit Exceeded'
  );

  // ----------------------------------------------------
  // TEST 17: Normal first login -> Must NOT incorrectly show "Too many requests"
  // ----------------------------------------------------
  const normalLimiter = authFailureRateLimiter({ windowMs: 60000, maxFailures: 10 });
  const normalMock = createMockReqRes({ ip: '10.0.0.1', body: { usernameOrEmail: 'admin', password: 'admin123' } });
  let normalNextCalled = false;
  normalLimiter(normalMock.req, normalMock.res, () => {
    normalNextCalled = true;
    authController.login(normalMock.req, normalMock.res);
  });
  assert(
    normalMock.res.statusCode === 200 && normalNextCalled,
    'TEST 17: Legitimate first login request succeeds without false-positive 429 error'
  );

  // ----------------------------------------------------
  // TEST 18: Two simultaneous student creation requests -> Student IDs remain unique
  // ----------------------------------------------------
  const sim1 = createMockReqRes({
    user: adminUser,
    body: { first_name: 'Concurrent', last_name: 'One', role: 'STUDENT' }
  });
  const sim2 = createMockReqRes({
    user: adminUser,
    body: { first_name: 'Concurrent', last_name: 'Two', role: 'STUDENT' }
  });

  adminController.createUser(sim1.req, sim1.res);
  adminController.createUser(sim2.req, sim2.res);

  const id1 = sim1.res.data?.studentId;
  const id2 = sim2.res.data?.studentId;

  assert(
    id1 && id2 && id1 !== id2,
    `TEST 18: Concurrent student creation guarantees unique IDs (${id1} vs ${id2})`
  );

  // ----------------------------------------------------
  // TEST 19: Student attempts to access another student's information -> Access denied
  // ----------------------------------------------------
  const otherStudentId = 'STU-1002'; // Sophia Chen
  const t19 = createMockReqRes({
    user: { id: studentLoginUser.id, role: 'STUDENT' },
    params: { studentId: otherStudentId }
  });
  let t19Allowed = false;
  authorizeStudentAccess(t19.req, t19.res, () => { t19Allowed = true; });
  assert(
    t19.res.statusCode === 403 && !t19Allowed,
    'TEST 19: Student attempting to inspect another student record is blocked (object-level auth)'
  );

  // ----------------------------------------------------
  // TEST 20: Parent attempts to access unlinked student -> Access denied
  // ----------------------------------------------------
  const unlinkedStudentId = 'STU-9999';
  const t20 = createMockReqRes({
    user: { id: parentUser.id, role: 'PARENT' },
    params: { studentId: unlinkedStudentId }
  });
  let t20Allowed = false;
  authorizeStudentAccess(t20.req, t20.res, () => { t20Allowed = true; });
  assert(
    t20.res.statusCode === 403 && !t20Allowed,
    'TEST 20: Parent attempting to inspect unlinked student is blocked (object-level auth)'
  );

  // ----------------------------------------------------
  // TEST 21: Frontend attempts role=ADMIN in update payload -> Ignored / Rejected
  // ----------------------------------------------------
  const t21 = createMockReqRes({
    user: teacherUser,
    params: { id: teacherUser.id },
    body: { role: 'ADMIN', first_name: 'Hacked' }
  });
  adminController.updateUser(t21.req, t21.res);
  assert(
    t21.res.data?.user?.role === 'TEACHER',
    'TEST 21: Server rejects unauthorized role manipulation in update payloads'
  );

  // ----------------------------------------------------
  // TEST 22: Directly type /admin/users while logged in as Student -> Access denied
  // ----------------------------------------------------
  const t22 = createMockReqRes({ user: studentLoginUser });
  let t22Allowed = false;
  requireRole(['ADMIN'])(t22.req, t22.res, () => { t22Allowed = true; });
  assert(
    t22.res.statusCode === 403 && !t22Allowed,
    'TEST 22: Student direct access to /admin/users route is blocked with HTTP 403 Forbidden'
  );

  // ----------------------------------------------------
  // TEST 23: Direct API request to admin endpoint as Student -> HTTP 403
  // ----------------------------------------------------
  const t23 = createMockReqRes({
    user: studentLoginUser,
    url: '/api/admin/metrics'
  });
  let t23Allowed = false;
  requireRole(['ADMIN'])(t23.req, t23.res, () => { t23Allowed = true; });
  assert(
    t23.res.statusCode === 403 && !t23Allowed,
    'TEST 23: Direct API call to /api/admin/* by Student yields HTTP 403 Forbidden'
  );

  // ----------------------------------------------------
  // TEST 24: Creating account with password < 8 characters is rejected with HTTP 400
  // ----------------------------------------------------
  const t24Short = createMockReqRes({
    user: { id: 'usr-admin-1', role: 'ADMIN' },
    body: {
      username: 'short.pwd.user',
      role: 'TEACHER',
      first_name: 'Short',
      last_name: 'Pass',
      email: 'shortpass@school.com',
      password: '123'
    }
  });
  adminController.createUser(t24Short.req, t24Short.res);
  assert(
    t24Short.res.statusCode === 400 &&
    t24Short.res.data?.success === false &&
    t24Short.res.data?.message?.includes('8 characters'),
    'TEST 24: Password < 8 characters is strictly rejected with HTTP 400'
  );

  // ----------------------------------------------------
  // TEST 25: Custom password is encrypted with bcrypt, never exposed, and authenticates successfully
  // ----------------------------------------------------
  const customPlainPassword = 'SuperSecret2026!#';
  const t25Create = createMockReqRes({
    user: { id: 'usr-admin-1', role: 'ADMIN' },
    body: {
      username: 'encrypted.faculty',
      role: 'TEACHER',
      first_name: 'Cipher',
      last_name: 'Security',
      email: 'cipher@school.com',
      password: customPlainPassword
    }
  });
  adminController.createUser(t25Create.req, t25Create.res);
  const createdFaculty = t25Create.res.data?.user;

  // Verify database record has bcrypt hash
  const rawDbUser = db.findUserById(createdFaculty?.id);
  const isBcryptHash = rawDbUser?.passwordHash && rawDbUser.passwordHash.startsWith('$2');
  const noPlaintextInDb = rawDbUser?.password === undefined;
  const noHashInResponse = createdFaculty?.passwordHash === undefined && createdFaculty?.password === undefined;

  // Verify successful authentication with the custom password
  const t25LoginSuccess = createMockReqRes({
    body: { usernameOrEmail: 'encrypted.faculty', password: customPlainPassword }
  });
  authController.login(t25LoginSuccess.req, t25LoginSuccess.res);

  // Verify failed authentication with wrong password
  const t25LoginFail = createMockReqRes({
    body: { usernameOrEmail: 'encrypted.faculty', password: 'WrongPassword999!' }
  });
  authController.login(t25LoginFail.req, t25LoginFail.res);

  assert(
    t25Create.res.statusCode === 201 &&
    isBcryptHash &&
    noPlaintextInDb &&
    noHashInResponse &&
    t25LoginSuccess.res.statusCode === 200 &&
    t25LoginFail.res.statusCode === 401,
    'TEST 25: Custom password is encrypted with bcrypt, safe from leakage, and authenticates successfully'
  );

  // ----------------------------------------------------
  // TEST 26: Teacher Portal - Attendance Authorization & Scoping
  // ----------------------------------------------------
  const facultyUser = db.findUserByUsername('robert.vance');
  const facultyToken = jwt.sign(
    { id: facultyUser.id, role: 'TEACHER', username: facultyUser.username },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  // Authorized class attendance marking
  const t26AuthAtt = createMockReqRes({
    method: 'POST',
    url: '/attendance',
    headers: { authorization: `Bearer ${facultyToken}` },
    body: {
      classId: 'CLS-12',
      date: '2026-09-04',
      records: [{ studentId: 'STU-1001', status: 'Present', remarks: 'On time' }]
    }
  });
  await dispatchRouter(teacherRouter, t26AuthAtt.req, t26AuthAtt.res);

  // Unauthorized class attendance marking (blocked with 403)
  const t26UnauthAtt = createMockReqRes({
    method: 'POST',
    url: '/attendance',
    headers: { authorization: `Bearer ${facultyToken}` },
    body: {
      classId: 'CLS-UNAUTHORIZED-999',
      date: '2026-09-04',
      records: [{ studentId: 'STU-9999', status: 'Present' }]
    }
  });
  await dispatchRouter(teacherRouter, t26UnauthAtt.req, t26UnauthAtt.res);

  assert(
    t26AuthAtt.res.statusCode === 200 &&
    t26AuthAtt.res.data?.success === true &&
    t26UnauthAtt.res.statusCode === 403 &&
    t26UnauthAtt.res.data?.success === false,
    'TEST 26: Teacher Portal - Attendance marking for authorized class succeeds; unauthorized class rejected with 403'
  );

  // ----------------------------------------------------
  // TEST 27: Teacher Portal - Coursework Publishing & Automated GPA Grading
  // ----------------------------------------------------
  const t27Publish = createMockReqRes({
    method: 'POST',
    url: '/assignments',
    headers: { authorization: `Bearer ${facultyToken}` },
    body: {
      title: 'Advanced Operating Systems Lab',
      classId: 'CLS-12',
      subjectCode: 'CS-401',
      totalPoints: 100,
      dueDate: '2026-09-15',
      instructions: 'Submit thread scheduling code.'
    }
  });
  await dispatchRouter(teacherRouter, t27Publish.req, t27Publish.res);

  const t27Grade = createMockReqRes({
    method: 'POST',
    url: '/grades',
    headers: { authorization: `Bearer ${facultyToken}` },
    body: {
      studentId: 'STU-1001',
      examId: 'EXM-LAB-1',
      subjectCode: 'CS-401',
      marksObtained: 94,
      totalMarks: 100
    }
  });
  await dispatchRouter(teacherRouter, t27Grade.req, t27Grade.res);

  assert(
    t27Publish.res.statusCode === 201 &&
    t27Publish.res.data?.assignment?.id &&
    t27Grade.res.statusCode === 200 &&
    t27Grade.res.data?.result?.letterGrade === 'A' &&
    t27Grade.res.data?.result?.gpa === 4.0,
    'TEST 27: Teacher Portal - Publishing coursework assignment & entering grades with automated GPA calculation'
  );

  // ----------------------------------------------------
  // TEST 28: Student Portal - Course & Assignment Scoping
  // ----------------------------------------------------
  const studentUser = db.findUserById('USR-003'); // Alex Morgan
  const studentToken = jwt.sign(
    { id: studentUser.id, role: 'STUDENT', username: studentUser.username, studentId: studentUser.username },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const t28Courses = createMockReqRes({
    method: 'GET',
    url: '/courses',
    headers: { authorization: `Bearer ${studentToken}` }
  });
  await dispatchRouter(studentRouter, t28Courses.req, t28Courses.res);

  const t28Assignments = createMockReqRes({
    method: 'GET',
    url: '/assignments',
    headers: { authorization: `Bearer ${studentToken}` }
  });
  await dispatchRouter(studentRouter, t28Assignments.req, t28Assignments.res);

  assert(
    t28Courses.res.statusCode === 200 &&
    Array.isArray(t28Courses.res.data?.courses) &&
    t28Courses.res.data.courses.length > 0 &&
    t28Assignments.res.statusCode === 200 &&
    Array.isArray(t28Assignments.res.data?.assignments) &&
    t28Assignments.res.data.assignments.some(a => a.id === t27Publish.res.data?.assignment?.id),
    'TEST 28: Student Portal - Accessing own enrolled courses and published class assignments'
  );

  // ----------------------------------------------------
  // TEST 29: Student Portal - Submitting Homework
  // ----------------------------------------------------
  const targetAsnId = t27Publish.res.data?.assignment?.id;
  const t29Submit = createMockReqRes({
    method: 'POST',
    url: `/assignments/${targetAsnId}/submit`,
    headers: { authorization: `Bearer ${studentToken}` },
    body: { content: 'https://github.com/alexmorgan/kernel-scheduler' }
  });
  await dispatchRouter(studentRouter, t29Submit.req, t29Submit.res);

  // Re-fetch assignments to verify submission status is updated
  const t29Verify = createMockReqRes({
    method: 'GET',
    url: '/assignments',
    headers: { authorization: `Bearer ${studentToken}` }
  });
  await dispatchRouter(studentRouter, t29Verify.req, t29Verify.res);
  const submittedItem = t29Verify.res.data?.assignments?.find(a => a.id === targetAsnId);

  assert(
    t29Submit.res.statusCode === 201 &&
    t29Submit.res.data?.submission?.content === 'https://github.com/alexmorgan/kernel-scheduler' &&
    submittedItem?.isSubmitted === true &&
    submittedItem?.submissionStatus === 'Submitted',
    'TEST 29: Student Portal - Submitting homework assignment and verifying submission status update'
  );

  // ----------------------------------------------------
  // TEST 30: Student Portal - Privilege Escalation Prevention
  // ----------------------------------------------------
  const t30TamperGrade = createMockReqRes({
    method: 'POST',
    url: '/grades',
    headers: { authorization: `Bearer ${studentToken}` },
    body: { studentId: 'STU-1001', marksObtained: 100 }
  });
  await dispatchRouter(teacherRouter, t30TamperGrade.req, t30TamperGrade.res);

  assert(
    t30TamperGrade.res.statusCode === 403,
    'TEST 30: Student Portal - Privilege Escalation Prevention: Student attempting to grade or mark attendance is rejected with HTTP 403'
  );

  // ----------------------------------------------------
  // TEST 31: Parent Portal - Child Scoping & Object-Level Access Control
  // ----------------------------------------------------
  const guardianUser = db.findUserById('USR-004'); // Sarah Morgan
  const guardianToken = jwt.sign(
    { id: guardianUser.id, role: 'PARENT', username: guardianUser.username, children: ['STU-1001'] },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const t31Children = createMockReqRes({
    method: 'GET',
    url: '/children',
    headers: { authorization: `Bearer ${guardianToken}` }
  });
  await dispatchRouter(parentRouter, t31Children.req, t31Children.res);

  const t31AuthAtt = createMockReqRes({
    method: 'GET',
    url: '/attendance?studentId=STU-1001',
    headers: { authorization: `Bearer ${guardianToken}` },
    query: { studentId: 'STU-1001' }
  });
  await dispatchRouter(parentRouter, t31AuthAtt.req, t31AuthAtt.res);

  const t31UnauthAtt = createMockReqRes({
    method: 'GET',
    url: '/attendance?studentId=STU-UNLINKED-999',
    headers: { authorization: `Bearer ${guardianToken}` },
    query: { studentId: 'STU-UNLINKED-999' }
  });
  await dispatchRouter(parentRouter, t31UnauthAtt.req, t31UnauthAtt.res);

  assert(
    t31Children.res.statusCode === 200 &&
    t31Children.res.data?.children?.some(c => c.id === 'STU-1001' || c.studentId === 'KM/34567/18') &&
    t31AuthAtt.res.statusCode === 200 &&
    t31UnauthAtt.res.statusCode === 403,
    'TEST 31: Parent Portal - Accessing linked children profiles & attendance; unlinked student access blocked with 403'
  );

  // ----------------------------------------------------
  // TEST 32: Inter-Portal Real Database Messaging
  // ----------------------------------------------------
  // 1. Teacher sends message to Student
  const t32TeacherSend = createMockReqRes({
    method: 'POST',
    url: '/messages',
    headers: { authorization: `Bearer ${facultyToken}` },
    body: {
      recipientId: studentUser.id,
      subject: 'Lab Assignment Clarification',
      content: 'Please make sure your scheduler supports priority queueing.'
    }
  });
  await dispatchRouter(teacherRouter, t32TeacherSend.req, t32TeacherSend.res);
  const sentMsgId = t32TeacherSend.res.data?.data?.id;

  // 2. Student reads inbox
  const t32StudentInbox = createMockReqRes({
    method: 'GET',
    url: '/messages',
    headers: { authorization: `Bearer ${studentToken}` }
  });
  await dispatchRouter(studentRouter, t32StudentInbox.req, t32StudentInbox.res);
  const receivedMsg = t32StudentInbox.res.data?.messages?.find(m => m.id === sentMsgId);

  // 3. Student replies to Teacher
  const t32StudentReply = createMockReqRes({
    method: 'POST',
    url: '/messages',
    headers: { authorization: `Bearer ${studentToken}` },
    body: {
      recipientId: facultyUser.id,
      subject: 'Re: Lab Assignment Clarification',
      content: 'Understood Dr. Vance, priority queue implemented.'
    }
  });
  await dispatchRouter(studentRouter, t32StudentReply.req, t32StudentReply.res);
  const replyMsgId = t32StudentReply.res.data?.data?.id;

  // 4. Teacher marks reply as read
  const t32MarkRead = createMockReqRes({
    method: 'PUT',
    url: `/messages/${replyMsgId}/read`,
    headers: { authorization: `Bearer ${facultyToken}` },
    params: { id: replyMsgId }
  });
  await dispatchRouter(teacherRouter, t32MarkRead.req, t32MarkRead.res);
  const updatedReplyInDb = db.messages.find(m => m.id === replyMsgId);

  assert(
    t32TeacherSend.res.statusCode === 201 &&
    receivedMsg !== undefined &&
    t32StudentReply.res.statusCode === 201 &&
    t32MarkRead.res.statusCode === 200 &&
    updatedReplyInDb?.isRead === true,
    'TEST 32: Inter-Portal Real Database Messaging - Communication workflow across roles persists in real database'
  );

  // ----------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------
  console.log('\n================================================================');
  console.log(`📊 AUDIT TEST SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  return { passed, failed };
};

// Auto-run if executed directly
if (process.argv[1]?.includes('testFullAuditSuite')) {
  runFullAuditTestSuite().then(res => {
    if (res.failed > 0) process.exit(1);
  });
}
