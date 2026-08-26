import { db } from '../config/db.js';

export const schoolController = {
  getSchoolProfile: (req, res) => {
    res.status(200).json({ success: true, profile: db.getSchoolProfile() });
  },

  updateSchoolProfile: (req, res) => {
    const updated = db.updateSchoolProfile(req.body);
    res.status(200).json({ success: true, message: 'School profile updated successfully', profile: updated });
  },

  getAcademicYears: (req, res) => {
    res.status(200).json({ success: true, academicYears: db.getAcademicYears(), terms: db.terms });
  },

  addAcademicYear: (req, res) => {
    const newYear = db.addAcademicYear(req.body);
    res.status(201).json({ success: true, message: 'Academic year created', year: newYear });
  },

  getClasses: (req, res) => {
    res.status(200).json({ success: true, classes: db.getClasses(), sections: db.getSections() });
  },

  addClass: (req, res) => {
    const newClass = db.addClass(req.body);
    res.status(201).json({ success: true, message: 'Class created', class: newClass });
  },

  updateClass: (req, res) => {
    const updated = db.updateClass(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Class updated', class: updated });
  },

  deleteClass: (req, res) => {
    db.deleteClass(req.params.id);
    res.status(200).json({ success: true, message: 'Class deleted' });
  },

  getSubjects: (req, res) => {
    res.status(200).json({ success: true, subjects: db.getSubjects() });
  },

  addSubject: (req, res) => {
    const newSub = db.addSubject(req.body);
    res.status(201).json({ success: true, message: 'Subject created', subject: newSub });
  },

  updateSubject: (req, res) => {
    const updated = db.updateSubject(req.params.id, req.body);
    res.status(200).json({ success: true, message: 'Subject updated', subject: updated });
  },

  deleteSubject: (req, res) => {
    db.deleteSubject(req.params.id);
    res.status(200).json({ success: true, message: 'Subject deleted' });
  }
};
