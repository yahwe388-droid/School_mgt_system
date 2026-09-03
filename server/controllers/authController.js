import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';
import { UserModel } from '../models/userModel.js';
import { JWT_SECRET } from '../middleware/authMiddleware.js';

export const authController = {
  login: (req, res) => {
    const identifier = req.body.usernameOrEmail || req.body.username || req.body.email;
    const password = req.body.password;
    const clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || 'Unknown Agent';

    // Strict validation
    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both username/email and password.'
      });
    }

    // Find user by username or email or student ID
    const user = UserModel.findByUsernameOrEmail(identifier);
    if (!user) {
      db.logAuthActivity({
        username: identifier,
        name: identifier,
        role: 'UNKNOWN',
        type: 'LOGIN_FAILED',
        status: 'FAILED',
        ip: clientIp,
        userAgent
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid username/email or password.'
      });
    }

    // Verify password against stored bcrypt hash
    const isPasswordValid = UserModel.verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      db.logAuthActivity({
        userId: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        type: 'LOGIN_FAILED',
        status: 'FAILED',
        ip: clientIp,
        userAgent
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid username/email or password.'
      });
    }

    // Check account active state
    if (user.is_active === false) {
      db.logAuthActivity({
        userId: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        type: 'LOGIN_BLOCKED_INACTIVE',
        status: 'BLOCKED',
        ip: clientIp,
        userAgent
      });

      return res.status(403).json({
        success: false,
        message: 'Your account is currently inactive. Please contact the system administrator.'
      });
    }

    // Record login timestamp
    UserModel.recordLogin(user.id);

    // Record successful authentication in audit log
    db.logAuthActivity({
      userId: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      type: 'LOGIN_SUCCESS',
      status: 'SUCCESS',
      ip: clientIp,
      userAgent
    });

    // Generate JWT Token with database-authoritative role
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username,
        email: user.email, 
        role: user.role,
        must_change_password: !!user.must_change_password
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    const safeUser = UserModel.sanitizeUser(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: safeUser,
      must_change_password: !!user.must_change_password
    });
  },

  changePassword: (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long.'
      });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match.'
      });
    }

    // Fetch user with password hash
    const fullUser = UserModel.findById(req.user.id, true);
    if (!fullUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Verify current password
    const isCurrentValid = UserModel.verifyPassword(currentPassword, fullUser.passwordHash);
    if (!isCurrentValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match.'
      });
    }

    // Update password, set must_change_password to false
    const updated = UserModel.resetPassword(req.user.id, newPassword);
    const finalUser = UserModel.updateUser(req.user.id, { must_change_password: false });

    // Issue refreshed token
    const token = jwt.sign(
      { 
        id: finalUser.id, 
        username: finalUser.username,
        email: finalUser.email, 
        role: finalUser.role,
        must_change_password: false
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully.',
      token,
      user: finalUser
    });
  },

  forgotPassword: (req, res) => {
    return res.status(200).json({
      success: true,
      message: 'Password reset requests must be processed by your System Administrator. Please contact admin@school.com.'
    });
  },

  getMe: (req, res) => {
    const user = UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.status(200).json({
      success: true,
      user
    });
  },

  logout: (req, res) => {
    if (req.user) {
      db.logAuthActivity({
        userId: req.user.id,
        username: req.user.username,
        name: req.user.name,
        role: req.user.role,
        type: 'LOGOUT',
        status: 'SUCCESS',
        ip: req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'Unknown'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  }
};

