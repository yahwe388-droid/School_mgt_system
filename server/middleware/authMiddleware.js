import jwt from 'jsonwebtoken';
import { UserModel } from '../models/userModel.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'school_mgt_secret_key_2026';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required. No token provided.' 
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = UserModel.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid session. User no longer exists.' 
      });
    }

    if (user.is_active === false) {
      return res.status(403).json({ 
        success: false, 
        message: 'Your account is currently inactive. Please contact the system administrator.' 
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ 
      success: false, 
      message: 'Your session has expired. Please log in again.' 
    });
  }
};

export const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required.' 
      });
    }

    const userRole = (req.user.role || '').toUpperCase();
    const normalizedAllowed = allowedRoles.map(r => r.toUpperCase());

    if (!normalizedAllowed.includes(userRole)) {
      return res.status(403).json({ 
        success: false, 
        message: 'You do not have permission to access this resource.' 
      });
    }

    next();
  };
};

export const requirePasswordChanged = (req, res, next) => {
  if (req.user && req.user.must_change_password) {
    return res.status(403).json({
      success: false,
      must_change_password: true,
      message: 'You must change your temporary password before accessing this resource.'
    });
  }
  next();
};

