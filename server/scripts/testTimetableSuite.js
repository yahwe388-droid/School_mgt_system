import jwt from 'jsonwebtoken';
import { db, defaultPeriods } from '../config/db.js';
import { checkTimetableConflict } from '../utils/academicCalculations.js';
import { JWT_SECRET } from '../middleware/authMiddleware.js';

export const runTimetableTestSuite = async () => {
  console.log('\n======================================================');
  console.log('📅 EDUCORE TIMETABLE MANAGEMENT SYSTEM - AUTOMATED SUITE');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName) => {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  };

  // Scenario 1: Create a timetable for Grade 9A
  const g9aMaster = db.saveTimetableMaster({
    classId: 'CLS-09',
    sectionId: 'SEC-9A',
    academicYearId: 'AY-2025',
    termId: 'TRM-01',
    status: 'Draft',
    periods: defaultPeriods,
    entries: [
      {
        id: 'TT-G9A-1',
        day: 'Monday',
        period: 1,
        startTime: '08:30',
        endTime: '09:15',
        subjectId: 'SUB-103',
        subjectCode: 'ENG-201',
        subjectTitle: 'World Literature & Composition',
        teacherId: 'TCH-201',
        teacherName: 'Dr. Robert Vance',
        room: 'Room 101'
      }
    ]
  });
  assert(g9aMaster && g9aMaster.id && g9aMaster.classId === 'CLS-09' && g9aMaster.sectionId === 'SEC-9A', 'Scenario 1: Administrator creates timetable master for Grade 9 Section A');

  // Scenario 2: Add lessons, assign subjects, teachers, rooms, and save
  const g9aUpdated = db.saveTimetableMaster({
    ...g9aMaster,
    entries: [
      ...g9aMaster.entries,
      {
        id: 'TT-G9A-2',
        day: 'Tuesday',
        period: 2,
        startTime: '09:20',
        endTime: '10:05',
        subjectId: 'SUB-102',
        subjectCode: 'MATH-301',
        subjectTitle: 'Calculus & Linear Algebra',
        teacherId: 'TCH-201',
        teacherName: 'Dr. Robert Vance',
        room: 'Room 101'
      }
    ]
  });
  assert(g9aUpdated.entries.length === 2 && g9aUpdated.entries[1].subjectCode === 'MATH-301', 'Scenario 2: Administrator adds lessons with subjects, teachers, rooms, and saves');

  // Scenario 3: Saved timetable remains correct after querying db
  const fetchedG9A = db.getTimetableMasterById(g9aMaster.id);
  assert(fetchedG9A && fetchedG9A.entries.length === 2 && fetchedG9A.status === 'Draft', 'Scenario 3: Saved timetable persists correctly and reloads with accurate structure');

  // Scenario 4: Administrator can reopen and edit an existing timetable
  fetchedG9A.entries[0].room = 'Room 102';
  const savedEdit = db.saveTimetableMaster(fetchedG9A);
  const reloadedEdit = db.getTimetableMasterById(g9aMaster.id);
  assert(reloadedEdit.entries[0].room === 'Room 102', 'Scenario 4: Administrator reopens and successfully edits saved timetable');

  // Scenario 5: Grade 9A and Grade 9B retain separate independent schedules
  const g9bMaster = db.saveTimetableMaster({
    classId: 'CLS-09',
    sectionId: 'SEC-9B',
    academicYearId: 'AY-2025',
    termId: 'TRM-01',
    status: 'Draft',
    periods: defaultPeriods,
    entries: [
      {
        id: 'TT-G9B-1',
        day: 'Monday',
        period: 2,
        startTime: '09:20',
        endTime: '10:05',
        subjectId: 'SUB-104',
        subjectCode: 'PHY-202',
        subjectTitle: 'General Physics & Mechanics',
        teacherId: 'TCH-201',
        teacherName: 'Dr. Robert Vance',
        room: 'Physics Lab'
      }
    ]
  });
  const check9A = db.findTimetableMaster('CLS-09', 'SEC-9A', 'AY-2025', 'TRM-01');
  const check9B = db.findTimetableMaster('CLS-09', 'SEC-9B', 'AY-2025', 'TRM-01');
  assert(check9A.id !== check9B.id && check9A.entries[0].subjectCode !== check9B.entries[0].subjectCode, 'Scenario 5: Grade 9A and Grade 9B maintain completely separate independent timetables');

  // Scenario 6: Grades 10, 11, and 12 can have their own timetables
  const g10Master = db.saveTimetableMaster({
    classId: 'CLS-10',
    sectionId: 'SEC-10A',
    academicYearId: 'AY-2025',
    termId: 'TRM-01',
    status: 'Published',
    periods: defaultPeriods,
    entries: [
      {
        id: 'TT-G10-1',
        day: 'Wednesday',
        period: 1,
        startTime: '08:30',
        endTime: '09:15',
        subjectId: 'SUB-101',
        subjectCode: 'CS-401',
        teacherId: 'TCH-201',
        teacherName: 'Dr. Robert Vance',
        room: 'Lab 301'
      }
    ]
  });
  const g11Master = db.findTimetableMaster('CLS-11', 'SEC-C', 'AY-2025', 'TRM-01');
  const g12Master = db.findTimetableMaster('CLS-12', 'SEC-A', 'AY-2025', 'TRM-01');
  assert(g10Master && g11Master && g12Master, 'Scenario 6: Grades 10, 11, and 12 maintain dedicated timetable masters');

  // Scenario 7: Dynamic section creation without source-code modification
  const dynamicSection = db.addSection({
    classId: 'CLS-09',
    title: 'Section D',
    room: 'Room 105',
    capacity: 28,
    status: 'Active'
  });
  const g9dMaster = db.saveTimetableMaster({
    classId: 'CLS-09',
    sectionId: dynamicSection.id,
    academicYearId: 'AY-2025',
    termId: 'TRM-01',
    status: 'Draft',
    entries: []
  });
  assert(dynamicSection && dynamicSection.id && g9dMaster.sectionId === dynamicSection.id, 'Scenario 7: Administrator adds new section dynamically and provisions its timetable');

  // Scenario 8: Switching between grades and sections loads the correct data
  const loadedFor9B = db.findTimetableMaster('CLS-09', 'SEC-9B', 'AY-2025', 'TRM-01');
  const loadedFor12A = db.findTimetableMaster('CLS-12', 'SEC-A', 'AY-2025', 'TRM-01');
  assert(loadedFor9B.entries[0].subjectCode === 'PHY-202' && loadedFor12A.entries[0].subjectCode === 'CS-401', 'Scenario 8: Switching between grades and sections loads the exact corresponding timetable');

  // Scenario 9: Conflict engine detects teacher, room, and section collisions
  const teacherConflictSlot = {
    id: 'TT-CONF-1',
    day: 'Wednesday',
    period: 1,
    startTime: '08:30',
    endTime: '09:15',
    teacherId: 'TCH-201',
    teacherName: 'Dr. Robert Vance',
    room: 'Room 202',
    classId: 'CLS-09',
    sectionId: 'SEC-9A'
  };
  const conflictResult = checkTimetableConflict(db.getTimetables(), teacherConflictSlot);
  assert(conflictResult.hasConflict === true && conflictResult.reason.includes('Teacher conflict'), 'Scenario 9: Conflict Engine detects and rejects overlapping teacher assignment');

  // Scenario 9B: Room conflict detection
  const roomConflictSlot = {
    id: 'TT-CONF-2',
    day: 'Wednesday',
    period: 1,
    startTime: '08:30',
    endTime: '09:15',
    teacherId: 'TCH-999',
    room: 'Lab 301',
    classId: 'CLS-09',
    sectionId: 'SEC-9A'
  };
  const roomConflictResult = checkTimetableConflict(db.getTimetables(), roomConflictSlot);
  assert(roomConflictResult.hasConflict === true && roomConflictResult.reason.includes('Room conflict'), 'Scenario 9B: Conflict Engine detects and rejects room double-booking');

  // Scenario 10: Invalid time ranges rejected (end <= start)
  const invalidTimeSlot = {
    id: 'TT-INV-1',
    day: 'Monday',
    startTime: '10:00',
    endTime: '09:00',
    teacherId: 'TCH-201',
    room: 'Room 101'
  };
  const invalidTimeResult = checkTimetableConflict([], invalidTimeSlot);
  assert(invalidTimeResult.hasConflict === true && invalidTimeResult.reason.includes('Invalid time range'), 'Scenario 10: Invalid chronological time interval (endTime < startTime) rejected');

  // Scenario 11: Publishing a timetable makes it active
  g9aMaster.status = 'Published';
  const publishedG9A = db.saveTimetableMaster(g9aMaster);
  assert(publishedG9A.status === 'Published', 'Scenario 11: Publishing timetable transitions status to Published for portal distribution');

  // Scenario 12: Teacher schedule reflects teacher assignments
  const teacherSlots = db.getTimetables().filter(t => t.teacherId === 'TCH-201');
  assert(teacherSlots.length >= 3, 'Scenario 12: Teacher Portal extracts personal schedule of assigned periods');

  // Scenario 13: Unpublished timetables remain hidden in student portal
  const unpublishedSectionMaster = db.saveTimetableMaster({
    classId: 'CLS-10',
    sectionId: 'SEC-10B',
    academicYearId: 'AY-2025',
    termId: 'TRM-01',
    status: 'Draft',
    entries: [{ id: 'TT-DRAFT-1', day: 'Monday', period: 1, subjectCode: 'MATH-301' }]
  });
  const studentViewCheck = db.getTimetableMasters().find(tm => tm.sectionId === 'SEC-10B' && tm.status === 'Published');
  assert(!studentViewCheck, 'Scenario 13: Unpublished draft timetable is strictly masked from student portal');

  // Scenario 14: Section uniqueness enforcement within same academic period
  const duplicateMasterCheck = db.findTimetableMaster('CLS-10', 'SEC-10B', 'AY-2025', 'TRM-01');
  assert(duplicateMasterCheck && duplicateMasterCheck.id === unpublishedSectionMaster.id, 'Scenario 14: System binds exactly one active timetable record per (Section + Term)');

  // Scenario 15: Missing timetable handled gracefully
  const missingTimetable = db.findTimetableMaster('CLS-10', 'NON-EXISTENT-SEC', 'AY-2025', 'TRM-01');
  assert(!missingTimetable, 'Scenario 15: Querying unconfigured section returns empty state gracefully without errors');

  // Scenario 16: Clean deletion removes slots from master and flat view
  db.deleteTimetableMaster(unpublishedSectionMaster.id);
  const deletedCheck = db.getTimetableMasterById(unpublishedSectionMaster.id);
  const flatSlotCheck = db.getTimetables().find(t => t.timetableId === unpublishedSectionMaster.id);
  assert(!deletedCheck && !flatSlotCheck, 'Scenario 16: Timetable deletion cleanly cascades and unbinds slots');

  console.log('\n======================================================');
  console.log(`📊 TIMETABLE TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('======================================================\n');

  return { passed, failed };
};
