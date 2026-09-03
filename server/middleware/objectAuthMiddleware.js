import { db } from '../config/db.js';

/**
 * Object-level authorization middleware
 * Verifies that the authenticated user actually has rights to access the specific student entity
 */
export const authorizeStudentAccess = (req, res, next) => {
  const user = req.user;
  const targetStudentId = req.params.studentId || req.params.id || req.query.studentId;

  if (!user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  const role = (user.role || '').toUpperCase();

  // Admin and Teachers can access all student academic entities
  if (role === 'ADMIN' || role === 'TEACHER') {
    return next();
  }

  // If no specific student requested, proceed to controller where data can be scoped to the user
  if (!targetStudentId) {
    return next();
  }

  // Student can only access their own record
  if (role === 'STUDENT') {
    const student = db.getStudents().find(s => 
      s.id === targetStudentId || 
      s.studentId === targetStudentId || 
      s.admissionNo === targetStudentId
    );

    if (!student || student.userId !== user.id) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this student resource.'
      });
    }
    return next();
  }

  // Parent can only access their associated children
  if (role === 'PARENT') {
    const parentRecord = db.getParents().find(p => 
      p.userId === user.id || 
      (p.email && user.email && p.email.toLowerCase() === user.email.toLowerCase())
    );
    const allowedStudentIds = parentRecord?.studentIds || user.children || [];

    const isAllowed = allowedStudentIds.includes(targetStudentId) ||
      db.getStudents().some(s => 
        (s.id === targetStudentId || s.studentId === targetStudentId || s.admissionNo === targetStudentId) && 
        allowedStudentIds.includes(s.id)
      );

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this student resource.'
      });
    }

    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'You do not have permission to access this resource.'
  });
};
