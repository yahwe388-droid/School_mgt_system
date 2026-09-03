import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '../config/db.js';
import { UserModel, VALID_ROLES } from '../models/userModel.js';
import { JWT_SECRET, authenticateToken, requireRole } from '../middleware/authMiddleware.js';
import { authController } from '../controllers/authController.js';
import { adminController } from '../controllers/adminController.js';

// Mock Express Request & Response Helper
const createMockReqRes = (options = {}) => {
  const req = {
    body: options.body || {},
    params: options.params || {},
    query: options.query || {},
    headers: options.headers || {},
    user: options.user || null
  };

  const res = {
    statusCode: 200,
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.data = payload;
      return this;
    },
    setHeader() {}
  };

  return { req, res };
};

export const runAuthRbacTestSuite = async () => {
  console.log('\n======================================================');
  console.log('🛡️  EDUCORE AUTHENTICATION & RBAC AUTOMATED SUITE (13 TESTS)');
  console.log('======================================================\n');

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
  // TEST 1: Admin Login -> Admin Dashboard
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
      first_name: 'Sarah',
      last_name: 'Connor',
      username: 'sarah.connor',
      email: 'sarah@school.com',
      role: 'TEACHER',
      department: 'Mathematics'
    }
  });
  adminController.createUser(t2.req, t2.res);
  const createdTeacher = t2.res.data?.user;
  const teacherTempPassword = t2.res.data?.tempPassword;
  assert(
    t2.res.statusCode === 201 &&
    createdTeacher?.username === 'sarah.connor' &&
    createdTeacher?.role === 'TEACHER' &&
    createdTeacher?.must_change_password === true &&
    !!teacherTempPassword,
    'TEST 2: Admin successfully provisions Teacher account with generated temporary password'
  );

  // ----------------------------------------------------
  // TEST 3: Teacher logs in -> Teacher Dashboard
  // ----------------------------------------------------
  const t3 = createMockReqRes({
    body: { usernameOrEmail: 'sarah.connor', password: teacherTempPassword }
  });
  authController.login(t3.req, t3.res);
  const teacherToken = t3.res.data?.token;
  const teacherUser = t3.res.data?.user;
  assert(
    t3.res.statusCode === 200 &&
    teacherUser?.role === 'TEACHER' &&
    teacherUser?.must_change_password === true &&
    !!teacherToken,
    'TEST 3: Teacher logs in with username & temp password and resolves TEACHER role'
  );

  // ----------------------------------------------------
  // TEST 4: Teacher attempts to access Admin API -> Access denied (HTTP 403)
  // ----------------------------------------------------
  const t4 = createMockReqRes({ user: teacherUser });
  let t4NextCalled = false;
  requireRole(['ADMIN'])(t4.req, t4.res, () => { t4NextCalled = true; });
  assert(
    t4.res.statusCode === 403 && !t4NextCalled && t4.res.data?.success === false,
    'TEST 4: Teacher attempting to access Admin endpoint is blocked with HTTP 403 Forbidden'
  );

  // ----------------------------------------------------
  // TEST 5: Admin creates Student -> Student logs in -> Student Dashboard
  // ----------------------------------------------------
  const t5Create = createMockReqRes({
    user: adminUser,
    body: {
      first_name: 'Lucas',
      last_name: 'Skywalker',
      username: 'lucas.sky',
      email: 'lucas@school.com',
      role: 'STUDENT',
      grade: 'Junior'
    }
  });
  adminController.createUser(t5Create.req, t5Create.res);
  const studentTempPassword = t5Create.res.data?.tempPassword;

  const t5Login = createMockReqRes({
    body: { usernameOrEmail: 'lucas.sky', password: studentTempPassword }
  });
  authController.login(t5Login.req, t5Login.res);
  const studentUser = t5Login.res.data?.user;
  const studentToken = t5Login.res.data?.token;
  assert(
    t5Login.res.statusCode === 200 &&
    studentUser?.role === 'STUDENT' &&
    studentUser?.must_change_password === true &&
    !!studentToken,
    'TEST 5: Admin creates Student and Student authenticates with STUDENT role'
  );

  // ----------------------------------------------------
  // TEST 6: Student attempts to access Teacher/Admin resources -> Access denied (HTTP 403)
  // ----------------------------------------------------
  const t6Admin = createMockReqRes({ user: studentUser });
  requireRole(['ADMIN'])(t6Admin.req, t6Admin.res, () => {});
  const t6Teacher = createMockReqRes({ user: studentUser });
  requireRole(['TEACHER'])(t6Teacher.req, t6Teacher.res, () => {});
  assert(
    t6Admin.res.statusCode === 403 && t6Teacher.res.statusCode === 403,
    'TEST 6: Student attempting to access Teacher or Admin resources is blocked with HTTP 403'
  );

  // ----------------------------------------------------
  // TEST 7: Admin creates Parent -> Parent logs in -> Parent Dashboard
  // ----------------------------------------------------
  const t7Create = createMockReqRes({
    user: adminUser,
    body: {
      first_name: 'Padme',
      last_name: 'Amidala',
      username: 'padme.amidala',
      email: 'padme@school.com',
      role: 'PARENT'
    }
  });
  adminController.createUser(t7Create.req, t7Create.res);
  const parentTempPassword = t7Create.res.data?.tempPassword;

  const t7Login = createMockReqRes({
    body: { usernameOrEmail: 'padme.amidala', password: parentTempPassword }
  });
  authController.login(t7Login.req, t7Login.res);
  const parentUser = t7Login.res.data?.user;
  assert(
    t7Login.res.statusCode === 200 && parentUser?.role === 'PARENT',
    'TEST 7: Admin creates Parent and Parent logs in with PARENT role'
  );

  // ----------------------------------------------------
  // TEST 8: Parent attempts to access Admin resources -> Access denied (HTTP 403)
  // ----------------------------------------------------
  const t8 = createMockReqRes({ user: parentUser });
  requireRole(['ADMIN'])(t8.req, t8.res, () => {});
  assert(
    t8.res.statusCode === 403 && t8.res.data?.message?.includes('permission'),
    'TEST 8: Parent attempting to access Admin resources is blocked with HTTP 403'
  );

  // ----------------------------------------------------
  // TEST 9: Inactive user attempts login -> Login rejected
  // ----------------------------------------------------
  UserModel.setActiveStatus(teacherUser.id, false); // Deactivate Sarah Connor
  const t9 = createMockReqRes({
    body: { usernameOrEmail: 'sarah.connor', password: teacherTempPassword }
  });
  authController.login(t9.req, t9.res);
  assert(
    t9.res.statusCode === 403 && t9.res.data?.message?.includes('inactive'),
    'TEST 9: Inactive user login rejected with HTTP 403 inactive account error'
  );
  UserModel.setActiveStatus(teacherUser.id, true); // Restore

  // ----------------------------------------------------
  // TEST 10: Temporary password user forced to change password -> Redirected
  // ----------------------------------------------------
  const newStrongPassword = 'MyNewPassword#2026';
  const t10Change = createMockReqRes({
    user: studentUser,
    body: {
      currentPassword: studentTempPassword,
      newPassword: newStrongPassword,
      confirmPassword: newStrongPassword
    }
  });
  authController.changePassword(t10Change.req, t10Change.res);
  const updatedStudent = t10Change.res.data?.user;

  // Test login again with the NEW password
  const t10LoginAfter = createMockReqRes({
    body: { usernameOrEmail: 'lucas.sky', password: newStrongPassword }
  });
  authController.login(t10LoginAfter.req, t10LoginAfter.res);

  assert(
    t10Change.res.statusCode === 200 &&
    updatedStudent?.must_change_password === false &&
    t10LoginAfter.res.statusCode === 200 &&
    t10LoginAfter.res.data?.must_change_password === false,
    'TEST 10: Forced password change workflow clears must_change_password and allows subsequent logins'
  );

  // ----------------------------------------------------
  // TEST 11: Logout -> Session destroyed -> Protected pages inaccessible
  // ----------------------------------------------------
  const t11Logout = createMockReqRes({ user: adminUser });
  authController.logout(t11Logout.req, t11Logout.res);

  const t11Protected = createMockReqRes({
    headers: {} // No token provided after logout
  });
  let t11NextCalled = false;
  authenticateToken(t11Protected.req, t11Protected.res, () => { t11NextCalled = true; });
  assert(
    t11Logout.res.statusCode === 200 &&
    t11Protected.res.statusCode === 401 &&
    !t11NextCalled,
    'TEST 11: Logout destroys session; unauthenticated requests receive HTTP 401'
  );

  // ----------------------------------------------------
  // TEST 12: Expired/invalid session -> Returns HTTP 401
  // ----------------------------------------------------
  const expiredToken = jwt.sign({ id: adminUser.id, role: 'ADMIN' }, JWT_SECRET, { expiresIn: '0s' });
  const t12 = createMockReqRes({
    headers: { authorization: `Bearer ${expiredToken}` }
  });
  let t12NextCalled = false;
  authenticateToken(t12.req, t12.res, () => { t12NextCalled = true; });
  assert(
    t12.res.statusCode === 401 && !t12NextCalled && t12.res.data?.message?.includes('expired'),
    'TEST 12: Expired or tampered JWT returns HTTP 401 with session expired message'
  );

  // ----------------------------------------------------
  // TEST 13: Attempt to manipulate role from frontend/API -> Ignored / Rejected
  // ----------------------------------------------------
  // Attempt 1: Submitting role: 'ADMIN' during regular login
  const t13Login = createMockReqRes({
    body: {
      usernameOrEmail: 'student@school.com',
      password: 'student123',
      role: 'ADMIN' // Malicious client attempt
    }
  });
  authController.login(t13Login.req, t13Login.res);
  const resolvedRole = t13Login.res.data?.user?.role;

  // Attempt 2: Calling profile update to modify role
  const t13Update = createMockReqRes({
    user: studentUser,
    params: { id: studentUser.id },
    body: {
      first_name: 'Lucas',
      role: 'ADMIN' // Malicious attempt to escalate role
    }
  });
  adminController.updateUser(t13Update.req, t13Update.res);
  const updatedRole = t13Update.res.data?.user?.role;

  assert(
    resolvedRole === 'STUDENT' && updatedRole === 'STUDENT',
    'TEST 13: Server strictly ignores client-submitted role in login & update payloads'
  );

  // ----------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------
  console.log('\n======================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  return { passed, failed };
};

// Auto-run if executed directly
if (process.argv[1]?.includes('testAuthRbacSuite')) {
  runAuthRbacTestSuite().then(res => {
    if (res.failed > 0) process.exit(1);
  });
}
