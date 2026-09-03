import crypto from 'crypto';
import { UserModel, VALID_ROLES } from '../models/userModel.js';
import { db } from '../config/db.js';

export const adminController = {
  // List users with search and filtering
  getUsers: (req, res) => {
    const { q, role, isActive } = req.query;
    const users = UserModel.getAllUsers({ query: q, role, isActive });
    res.status(200).json({ success: true, count: users.length, users });
  },

  // Create a new user (Teacher, Student, Parent)
  createUser: (req, res) => {
    try {
      const { first_name, last_name, username, email, phone, role, department, grade } = req.body;

      const normalizedRole = (role || '').toUpperCase();
      if (!VALID_ROLES.includes(normalizedRole)) {
        return res.status(400).json({
          success: false,
          message: `Invalid role '${role}'. Allowed roles are: ${VALID_ROLES.join(', ')}`
        });
      }

      if (!first_name || !last_name) {
        return res.status(400).json({
          success: false,
          message: 'First name and last name are required.'
        });
      }

      if (normalizedRole !== 'STUDENT' && !username) {
        return res.status(400).json({
          success: false,
          message: 'Username is required for non-student accounts.'
        });
      }

      let finalUsername = username;
      let generatedStudentId = null;

      // When role is STUDENT, automatically generate Student ID in KM/{SEQUENCE}/{YEAR} format
      // Student ID is strictly used as the student's login username
      if (normalizedRole === 'STUDENT') {
        generatedStudentId = db.allocateNextStudentId();
        finalUsername = generatedStudentId;
      }

      // Validate password if supplied (supports either 'password' or 'temporaryPassword')
      const rawPassword = req.body.password || req.body.temporaryPassword;
      if (rawPassword !== undefined && rawPassword !== null && rawPassword !== '') {
        if (typeof rawPassword !== 'string' || rawPassword.trim().length < 8) {
          return res.status(400).json({
            success: false,
            message: 'Password is required and must be at least 8 characters long.'
          });
        }
      }

      // Generate a secure temporary password if not provided
      const tempPassword = (rawPassword && typeof rawPassword === 'string' && rawPassword.trim().length >= 8)
        ? rawPassword.trim()
        : `Edu@${crypto.randomBytes(3).toString('hex')}!`;

      // Create user record in UserModel
      const newUser = UserModel.createUser({
        username: finalUsername,
        studentId: generatedStudentId,
        aliasUsername: (username && username !== finalUsername) ? username.toLowerCase() : undefined,
        email: email || `${finalUsername.toLowerCase().replace(/[^a-z0-9]/g, '.')}@student.school.com`,
        password: tempPassword,
        role: normalizedRole,
        first_name,
        last_name,
        phone,
        department,
        grade,
        created_by: req.user.id
      });

      // Synchronize into specific role collections for consistent academic operations
      if (normalizedRole === 'TEACHER') {
        db.addTeacher({
          userId: newUser.id,
          employeeId: req.body.employeeId || `EMP-${Date.now().toString().slice(-4)}`,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          department: department || 'General Education',
          qualification: req.body.qualification || 'B.Ed / M.Sc',
          status: 'Active'
        });
      } else if (normalizedRole === 'STUDENT') {
        db.addStudent({
          userId: newUser.id,
          studentId: generatedStudentId,
          admissionNo: generatedStudentId,
          name: newUser.name,
          email: newUser.email,
          classId: req.body.classId || 'CLS-12',
          sectionId: req.body.sectionId || 'SEC-A',
          parentId: req.body.parentId || '',
          grade: grade || 'Senior',
          status: 'Active'
        });
      } else if (normalizedRole === 'PARENT') {
        db.addParent({
          userId: newUser.id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          studentIds: req.body.studentIds || []
        });
      }

      // Return credentials with generated Student ID and temp password
      res.status(201).json({
        success: true,
        message: `${normalizedRole} account created successfully.`,
        tempPassword,
        studentId: generatedStudentId,
        user: newUser
      });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  // Edit an existing user profile
  updateUser: (req, res) => {
    try {
      const { id } = req.params;
      const updated = UserModel.updateUser(id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: 'User not found.' });
      }
      res.status(200).json({
        success: true,
        message: 'User profile updated successfully.',
        user: updated
      });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  },

  // Toggle user active / inactive status
  toggleUserStatus: (req, res) => {
    const { id } = req.params;
    const { is_active } = req.body;
    const updated = UserModel.setActiveStatus(id, is_active);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.status(200).json({
      success: true,
      message: `Account has been ${updated.is_active ? 'activated' : 'deactivated'}.`,
      user: updated
    });
  },

  // Reset user password & generate a new temporary password
  resetPassword: (req, res) => {
    const { id } = req.params;
    const tempPassword = req.body.temporaryPassword || `Reset@${crypto.randomBytes(3).toString('hex')}!`;
    const updated = UserModel.resetPassword(id, tempPassword);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({
      success: true,
      message: 'Temporary password generated successfully.',
      tempPassword,
      user: updated
    });
  },

  // Aggregated Admin Metrics
  getMetrics: (req, res) => {
    const allUsers = UserModel.getAllUsers();
    const totalUsers = allUsers.length;
    const totalTeachers = allUsers.filter(u => u.role === 'TEACHER').length;
    const totalStudents = db.getStudents().length;
    const totalParents = allUsers.filter(u => u.role === 'PARENT').length;
    const activeAccounts = allUsers.filter(u => u.is_active !== false).length;
    const inactiveAccounts = allUsers.filter(u => u.is_active === false).length;

    const recentCreations = [...allUsers]
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .slice(0, 5);

    const recentLogins = [...allUsers]
      .filter(u => u.last_login)
      .sort((a, b) => new Date(b.last_login || 0) - new Date(a.last_login || 0))
      .slice(0, 5);

    const recentAuthLogs = db.getAuthLogs(6);

    res.status(200).json({
      success: true,
      metrics: {
        totalUsers,
        totalTeachers,
        totalStudents,
        totalParents,
        activeAccounts,
        inactiveAccounts,
        recentCreations,
        recentLogins,
        recentAuthLogs
      }
    });
  },

  // Authentication Audit Logs
  getAuthLogs: (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 50;
    const logs = db.getAuthLogs(limit);
    res.status(200).json({ success: true, count: logs.length, logs });
  },

  // School Settings Management
  getSettings: (req, res) => {
    const settings = db.getSchoolSettings();
    res.status(200).json({ success: true, settings });
  },

  updateSettings: (req, res) => {
    const updated = db.updateSchoolSettings(req.body);
    res.status(200).json({
      success: true,
      message: 'School settings updated successfully.',
      settings: updated
    });
  }
};
