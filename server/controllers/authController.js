import jwt from 'jsonwebtoken';
import { UserModel } from '../models/userModel.js';
import { JWT_SECRET } from '../middleware/authMiddleware.js';

export const authController = {
  login: (req, res) => {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    // Find user
    const user = UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.'
      });
    }

    // Verify password
    const isPasswordValid = UserModel.verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.'
      });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    const safeUser = UserModel.sanitizeUser(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: safeUser
    });
  },

  getMe: (req, res) => {
    return res.status(200).json({
      success: true,
      user: req.user
    });
  },

  logout: (req, res) => {
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.'
    });
  }
};
