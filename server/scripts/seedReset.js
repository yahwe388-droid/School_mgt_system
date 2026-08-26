import { db, initialUsers, initialSchoolProfile, initialAcademicYears, initialClasses, initialSubjects, initialStudents, initialTeachers, initialParents } from '../config/db.js';

console.log('🔄 Resetting School Management System database store to initial baseline...');

db.users = [...initialUsers];
db.schoolProfile = { ...initialSchoolProfile };
db.academicYears = [...initialAcademicYears];
db.classes = [...initialClasses];
db.subjects = [...initialSubjects];
db.students = [...initialStudents];
db.teachers = [...initialTeachers];
db.parents = [...initialParents];
db.auditLogs = [];

console.log('✅ Database store successfully reset to clean seed data.');
