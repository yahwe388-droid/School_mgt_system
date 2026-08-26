import { db } from '../config/db.js';

export const recordController = {
  // Students
  getStudents: (req, res) => {
    res.status(200).json({ success: true, students: db.getStudents() });
  },

  addStudent: (req, res) => {
    const newStu = db.addStudent(req.body);
    res.status(201).json({ success: true, message: 'Student record created', student: newStu });
  },

  updateStudent: (req, res) => {
    const updated = db.updateStudent(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Student record updated', student: updated });
  },

  deleteStudent: (req, res) => {
    db.deleteStudent(req.params.id);
    res.status(200).json({ success: true, message: 'Student record deleted' });
  },

  // Teachers
  getTeachers: (req, res) => {
    res.status(200).json({ success: true, teachers: db.getTeachers() });
  },

  addTeacher: (req, res) => {
    const newTch = db.addTeacher(req.body);
    res.status(201).json({ success: true, message: 'Teacher record created', teacher: newTch });
  },

  updateTeacher: (req, res) => {
    const updated = db.updateTeacher(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Teacher record updated', teacher: updated });
  },

  deleteTeacher: (req, res) => {
    db.deleteTeacher(req.params.id);
    res.status(200).json({ success: true, message: 'Teacher record deleted' });
  },

  // Parents
  getParents: (req, res) => {
    res.status(200).json({ success: true, parents: db.getParents() });
  },

  addParent: (req, res) => {
    const newPrn = db.addParent(req.body);
    res.status(201).json({ success: true, message: 'Parent record created', parent: newPrn });
  },

  updateParent: (req, res) => {
    const updated = db.updateParent(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Parent record updated', parent: updated });
  },

  deleteParent: (req, res) => {
    db.deleteParent(req.params.id);
    res.status(200).json({ success: true, message: 'Parent record deleted' });
  },

  // Phase 2 Summary Dashboard Metrics
  getPhase2Summary: (req, res) => {
    const profile = db.getSchoolProfile();
    res.status(200).json({
      success: true,
      summary: {
        totalStudents: db.getStudents().length,
        totalTeachers: db.getTeachers().length,
        totalParents: db.getParents().length,
        totalClasses: db.getClasses().length,
        totalSubjects: db.getSubjects().length,
        activeAcademicYear: profile.activeAcademicYear,
        activeTerm: profile.activeTerm
      }
    });
  }
};
