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

  // Sections
  getSections: (req, res) => {
    const classId = req.query.classId;
    const sections = classId ? db.getSectionsByClass(classId) : db.getSections();
    res.status(200).json({ success: true, sections });
  },

  addSection: (req, res) => {
    const { classId, title, room, capacity, status } = req.body;
    if (!classId || !title) {
      return res.status(400).json({ success: false, message: 'Parent Class and Section title are required.' });
    }

    const parentClass = db.getClasses().find((c) => c.id === classId);
    if (!parentClass) {
      return res.status(404).json({ success: false, message: 'Specified parent Class/Grade not found.' });
    }

    const cleanTitle = title.trim();
    const existing = db.getSections().find((s) => s.classId === classId && s.title.toLowerCase() === cleanTitle.toLowerCase());
    if (existing) {
      return res.status(409).json({ success: false, message: `Section "${cleanTitle}" already exists for ${parentClass.title}.` });
    }

    const newSection = db.addSection({
      classId,
      title: cleanTitle,
      room: room ? room.trim() : 'Room 101',
      capacity: Number(capacity) || 30,
      status: status || 'Active'
    });

    res.status(201).json({ success: true, message: 'Section created successfully', section: newSection });
  },

  updateSection: (req, res) => {
    const { id } = req.params;
    const { title } = req.body;

    const existingSection = db.findSectionById(id);
    if (!existingSection) {
      return res.status(404).json({ success: false, message: 'Section not found.' });
    }

    if (title) {
      const cleanTitle = title.trim();
      const duplicate = db.getSections().find((s) => s.id !== id && s.classId === existingSection.classId && s.title.toLowerCase() === cleanTitle.toLowerCase());
      if (duplicate) {
        return res.status(409).json({ success: false, message: `Section "${cleanTitle}" already exists in this grade.` });
      }
    }

    const updated = db.updateSection(id, req.body);
    res.status(200).json({ success: true, message: 'Section updated successfully', section: updated });
  },

  deleteSection: (req, res) => {
    const { id } = req.params;
    const existingSection = db.findSectionById(id);
    if (!existingSection) {
      return res.status(404).json({ success: false, message: 'Section not found.' });
    }

    const enrolledStudents = db.getStudents().filter((s) => s.sectionId === id);
    if (enrolledStudents.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete section "${existingSection.title}": ${enrolledStudents.length} student(s) are currently enrolled.`
      });
    }

    db.deleteSection(id);
    res.status(200).json({ success: true, message: 'Section deleted successfully' });
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
