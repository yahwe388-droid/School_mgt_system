import express from 'express';
import { UserModel } from '../models/userModel.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin only: List all users
router.get('/', authenticateToken, requireRole(['Admin']), (req, res) => {
  const users = UserModel.getAllUsers();
  res.status(200).json({ success: true, users });
});

export default router;
