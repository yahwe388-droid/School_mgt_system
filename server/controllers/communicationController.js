import { db } from '../config/db.js';
import { generateStudentReport, generateAnalyticsData } from '../utils/reportGenerator.js';

export const communicationController = {
  // Announcements
  getAnnouncements: (req, res) => {
    const userRole = (req.user?.role || '').toUpperCase();
    const all = db.getAnnouncements();

    // Filter by role visibility
    const filtered = all.filter(a => 
      a.targetRole === 'All' || 
      (a.targetRole && a.targetRole.toUpperCase() === userRole) || 
      userRole === 'ADMIN'
    );
    res.status(200).json({ success: true, announcements: filtered });
  },

  addAnnouncement: (req, res) => {
    const newAnc = db.addAnnouncement({
      author: req.user?.name || 'Administration',
      ...req.body
    });
    res.status(201).json({ success: true, message: 'Announcement published', announcement: newAnc });
  },

  // Notifications
  getNotifications: (req, res) => {
    const userId = req.user?.id;
    const list = db.getNotifications(userId);
    const unreadCount = list.filter(n => !n.isRead).length;
    res.status(200).json({ success: true, notifications: list, unreadCount });
  },

  markNotificationRead: (req, res) => {
    db.markNotificationAsRead(req.params.id);
    res.status(200).json({ success: true, message: 'Notification marked as read' });
  },

  // Reports
  getStudentReportCard: (req, res) => {
    const studentId = req.params.studentId || 'STU-1001';
    const report = generateStudentReport(db, studentId);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Student record not found' });
    }
    res.status(200).json({ success: true, report });
  },

  // Visual Analytics
  getAnalytics: (req, res) => {
    const analytics = generateAnalyticsData(db);
    res.status(200).json({ success: true, analytics });
  }
};
