import jwt from 'jsonwebtoken';
import { UserModel } from '../models/userModel.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'school_mgt_secret_key_2026';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = UserModel.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid token. User no longer exists.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token.' });
  }
};

export const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. ${req.user.role} role is not authorized for this resource.` 
      });
    }

    next();
  };
};
