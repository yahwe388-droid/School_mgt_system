export const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return null;
  const clean = timeStr.trim();
  const match = clean.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridian = match[3] ? match[3].toUpperCase() : null;
  if (meridian === 'PM' && hours < 12) hours += 12;
  if (meridian === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

export const timesOverlap = (start1, end1, start2, end2) => {
  const s1 = parseTimeToMinutes(start1);
  const e1 = parseTimeToMinutes(end1);
  const s2 = parseTimeToMinutes(start2);
  const e2 = parseTimeToMinutes(end2);
  if (s1 !== null && e1 !== null && s2 !== null && e2 !== null) {
    return Math.max(s1, s2) < Math.min(e1, e2);
  }
  return false;
};

export const checkTimetableConflict = (existingTimetables, newSlot) => {
  if (!existingTimetables || !Array.isArray(existingTimetables) || !newSlot) {
    return { hasConflict: false };
  }

  // Validate start and end time if both are provided
  if (newSlot.startTime && newSlot.endTime) {
    const sMin = parseTimeToMinutes(newSlot.startTime);
    const eMin = parseTimeToMinutes(newSlot.endTime);
    if (sMin !== null && eMin !== null && sMin >= eMin) {
      return {
        hasConflict: true,
        reason: `Invalid time range: End time (${newSlot.endTime}) must be later than start time (${newSlot.startTime}).`
      };
    }
  }

  const conflict = existingTimetables.find((slot) => {
    // Skip checking against itself if editing
    if (slot.id && newSlot.id && slot.id === newSlot.id) return false;

    // Must be on the same day
    if (slot.day !== newSlot.day) return false;

    // Check time overlap:
    // If both slots provide start and end times, verify time range intersection
    let hasTimeOverlap = false;
    if (slot.startTime && slot.endTime && newSlot.startTime && newSlot.endTime) {
      hasTimeOverlap = timesOverlap(slot.startTime, slot.endTime, newSlot.startTime, newSlot.endTime);
    } else {
      // Fallback to period matching
      hasTimeOverlap = (slot.period !== undefined && newSlot.period !== undefined && String(slot.period) === String(newSlot.period));
    }

    if (!hasTimeOverlap) return false;

    // Check teacher conflict
    const teacherConflict = !!(slot.teacherId && newSlot.teacherId && slot.teacherId === newSlot.teacherId);

    // Check room conflict
    const roomConflict = !!(slot.room && newSlot.room && slot.room.trim().toLowerCase() === newSlot.room.trim().toLowerCase());

    // Check class/section conflict
    let classConflict = false;
    if (slot.sectionId && newSlot.sectionId) {
      classConflict = slot.sectionId === newSlot.sectionId;
    } else if (slot.classId && newSlot.classId) {
      classConflict = slot.classId === newSlot.classId;
    }

    return teacherConflict || roomConflict || classConflict;
  });

  if (!conflict) return { hasConflict: false };

  let reason = 'Schedule conflict detected';
  const timeDesc = newSlot.timeSlot || (newSlot.startTime && newSlot.endTime ? `${newSlot.startTime} to ${newSlot.endTime}` : `Period ${newSlot.period || ''}`);

  if (conflict.teacherId && conflict.teacherId === newSlot.teacherId) {
    reason = `Teacher conflict: ${newSlot.teacherName || conflict.teacherName || 'Teacher'} is already assigned to ${conflict.subjectCode || 'another class'} in Period ${newSlot.period || ''} on ${newSlot.day}`;
  } else if (conflict.room && conflict.room.trim().toLowerCase() === (newSlot.room || '').trim().toLowerCase()) {
    reason = `Room conflict: ${newSlot.room} is already booked in Period ${newSlot.period || ''} on ${newSlot.day}`;
  } else if (conflict.sectionId && conflict.sectionId === newSlot.sectionId) {
    reason = `Class conflict: Section is already scheduled for another subject in Period ${newSlot.period || ''} on ${newSlot.day}`;
  } else if (conflict.classId === newSlot.classId) {
    reason = `Class conflict: Class is already scheduled for another subject in Period ${newSlot.period || ''} on ${newSlot.day}`;
  }

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
