export const checkTimetableConflict = (existingTimetables, newSlot) => {
  const conflict = existingTimetables.find((slot) => {
    // Skip checking against itself if editing
    if (slot.id === newSlot.id) return false;

    const sameDay = slot.day === newSlot.day;
    const samePeriod = slot.period === newSlot.period;

    if (!sameDay || !samePeriod) return false;

    const teacherConflict = slot.teacherId && slot.teacherId === newSlot.teacherId;
    const roomConflict = slot.room && slot.room === newSlot.room;
    const classConflict = slot.classId && slot.classId === newSlot.classId;

    return teacherConflict || roomConflict || classConflict;
  });

  if (!conflict) return { hasConflict: false };

  let reason = 'Schedule conflict detected';
  if (conflict.teacherId === newSlot.teacherId) reason = `Teacher is already assigned to ${conflict.subjectCode || 'another class'} in Period ${newSlot.period} on ${newSlot.day}`;
  else if (conflict.room === newSlot.room) reason = `Room ${newSlot.room} is already booked in Period ${newSlot.period} on ${newSlot.day}`;
  else if (conflict.classId === newSlot.classId) reason = `Class is already scheduled for another subject in Period ${newSlot.period} on ${newSlot.day}`;

  return { hasConflict: true, reason, conflictingSlot: conflict };
};

export const calculateGrade = (score, totalMarks = 100) => {
  const percentage = (score / totalMarks) * 100;
  if (percentage >= 90) return { letter: 'A', gpa: 4.0, remark: 'Outstanding' };
  if (percentage >= 80) return { letter: 'B', gpa: 3.0, remark: 'Good' };
  if (percentage >= 70) return { letter: 'C', gpa: 2.0, remark: 'Satisfactory' };
  if (percentage >= 60) return { letter: 'D', gpa: 1.0, remark: 'Pass' };
  return { letter: 'F', gpa: 0.0, remark: 'Needs Improvement' };
};

export const calculateAttendanceStats = (attendanceRecords, studentId) => {
  const studentLogs = studentId
    ? attendanceRecords.filter((r) => r.studentId === studentId)
    : attendanceRecords;

  const total = studentLogs.length;
  if (total === 0) return { present: 0, absent: 0, late: 0, excused: 0, percentage: 100 };

  const present = studentLogs.filter((r) => r.status === 'Present').length;
  const late = studentLogs.filter((r) => r.status === 'Late').length;
  const excused = studentLogs.filter((r) => r.status === 'Excused').length;
  const absent = studentLogs.filter((r) => r.status === 'Absent').length;

  const effectivePresent = present + late * 0.8 + excused;
  const percentage = Math.round((effectivePresent / total) * 100);

  return { present, absent, late, excused, total, percentage: Math.min(percentage, 100) };
};
