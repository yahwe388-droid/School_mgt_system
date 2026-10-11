import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  Clock, 
  AlertTriangle, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  CheckCircle, 
  Printer, 
  Building, 
  BookOpen, 
  User, 
  Layers, 
  Send, 
  Coffee, 
  Utensils, 
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../common/Alert';
import { Modal } from '../common/Modal';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const TimetableManager = () => {
  const { token, user } = useAuth();
  const userRole = (user?.role || '').toUpperCase();

  // Common Academic Data
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [terms, setTerms] = useState([]);

  // Active Selection State
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState('AY-2025');
  const [selectedTermId, setSelectedTermId] = useState('TRM-01');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');

  // Active Timetable Master & Draft State
  const [activeTimetable, setActiveTimetable] = useState(null);
  const [draftEntries, setDraftEntries] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modals State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [editingLessonIndex, setEditingLessonIndex] = useState(null);

  // Lesson Form
  const [lessonForm, setLessonForm] = useState({
    id: '',
    day: 'Monday',
    period: 1,
    startTime: '08:30',
    endTime: '09:15',
    timeSlot: '08:30 - 09:15 AM',
    subjectId: '',
    subjectCode: '',
    subjectTitle: '',
    teacherId: '',
    teacherName: '',
    room: 'Room 101'
  });

  // Create Timetable Form
  const [createForm, setCreateForm] = useState({
    classId: '',
    sectionId: '',
    academicYearId: 'AY-2025',
    termId: 'TRM-01',
    newSectionTitle: ''
  });

  // Quick Add Section Form
  const [newSectionForm, setNewSectionForm] = useState({
    classId: '',
    title: '',
    room: 'Room 101',
    capacity: 30
  });

  // Non-Admin Portal States
  const [studentScheduleData, setStudentScheduleData] = useState(null);
  const [teacherScheduleData, setTeacherScheduleData] = useState(null);
  const [parentScheduleData, setParentScheduleData] = useState(null);
  const [parentSelectedChildId, setParentSelectedChildId] = useState('');

  // Default School Days & Periods
  const schoolDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const standardPeriods = [
    { period: 1, name: 'Period 1', startTime: '08:30', endTime: '09:15', type: 'lesson' },
    { period: 2, name: 'Period 2', startTime: '09:20', endTime: '10:05', type: 'lesson' },
    { period: 'break-1', name: 'Morning Break', startTime: '10:05', endTime: '10:25', type: 'break' },
    { period: 3, name: 'Period 3', startTime: '10:25', endTime: '11:10', type: 'lesson' },
    { period: 4, name: 'Period 4', startTime: '11:15', endTime: '12:00', type: 'lesson' },
    { period: 'lunch', name: 'Lunch Break', startTime: '12:00', endTime: '12:45', type: 'lunch' },
    { period: 5, name: 'Period 5', startTime: '12:45', endTime: '13:30', type: 'lesson' },
    { period: 6, name: 'Period 6', startTime: '13:35', endTime: '14:20', type: 'lesson' }
  ];

  const roomOptions = [
    'Room 101', 'Room 102', 'Room 103',
    'Room 201', 'Room 202', 'Room 203',
    'Room 301', 'Room 302', 'Room 303',
    'Room 401', 'Room 402', 'Lab 301',
    'Computer Lab 1', 'Science Lab', 'Physics Lab',
    'Chemistry Lab', 'Biology Lab', 'Library'
  ];

  // ============================================================
  // Initial Data Loading
  // ============================================================
  useEffect(() => {
    loadInitialData();
  }, [userRole]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      if (userRole === 'STUDENT') {
        await fetchStudentSchedule();
      } else if (userRole === 'TEACHER') {
        await fetchTeacherSchedule();
      } else if (userRole === 'PARENT') {
        await fetchParentSchedule();
      } else {
        await fetchAdminMetaData();
      }
    } catch (err) {
      console.error('Error initializing timetable manager:', err);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // ADMIN DATA FETCHING & SYNC
  // ============================================================
  const fetchAdminMetaData = async () => {
    try {
      const [clsRes, secRes, subRes, tchRes, ayRes] = await Promise.all([
        api.get('/school/classes', token),
        api.get('/school/sections', token),
        api.get('/school/subjects', token),
        api.get('/records/teachers', token),
        api.get('/school/academic-years', token)
      ]);

      const loadedClasses = clsRes.success ? (clsRes.classes || []) : [];
      let loadedSections = secRes.success ? (secRes.sections || []) : [];
      if (loadedSections.length === 0 && clsRes.sections) {
        loadedSections = clsRes.sections;
      }
      const loadedSubjects = subRes.success ? (subRes.subjects || []) : [];
      const loadedTeachers = tchRes.success ? (tchRes.teachers || []) : [];
      const loadedYears = ayRes.success ? (ayRes.academicYears || []) : [];
      const loadedTerms = ayRes.success ? (ayRes.terms || []) : [];

      setClasses(loadedClasses);
      setSections(loadedSections);
      setSubjects(loadedSubjects);
      setTeachers(loadedTeachers);
      setAcademicYears(loadedYears);
      setTerms(loadedTerms);

      let defaultClsId = loadedClasses[0]?.id || 'CLS-12';
      let defaultSecId = '';

      const matchingSecs = loadedSections.filter((s) => s.classId === defaultClsId);
      if (matchingSecs.length > 0) {
        defaultSecId = matchingSecs[0].id;
      } else if (loadedSections.length > 0) {
        defaultSecId = loadedSections[0].id;
      }

      setSelectedClassId(defaultClsId);
      setSelectedSectionId(defaultSecId);

      if (defaultSecId) {
        await fetchTimetableForSection(defaultClsId, defaultSecId, 'AY-2025', 'TRM-01');
      }
    } catch (err) {
      console.error('Error fetching admin metadata:', err);
    }
  };

  const fetchTimetableForSection = async (classId, sectionId, yearId, termId) => {
    if (!sectionId) {
      setActiveTimetable(null);
      setDraftEntries([]);
      setIsEditing(false);
      return;
    }

    try {
      const q = `/academic/timetables?classId=${classId}&sectionId=${sectionId}&academicYearId=${yearId}&termId=${termId}`;
      const res = await api.get(q, token);

      if (res.success && res.timetable) {
        setActiveTimetable(res.timetable);
        setDraftEntries(res.timetable.entries || []);
      } else {
        setActiveTimetable(null);
        setDraftEntries([]);
      }
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to fetch section timetable:', err);
    }
  };

  const handleClassChange = (newClassId) => {
    setSelectedClassId(newClassId);
    const availableSections = sections.filter((s) => s.classId === newClassId);
    const nextSecId = availableSections.length > 0 ? availableSections[0].id : '';
    setSelectedSectionId(nextSecId);

    if (nextSecId) {
      fetchTimetableForSection(newClassId, nextSecId, selectedAcademicYearId, selectedTermId);
    } else {
      setActiveTimetable(null);
      setDraftEntries([]);
      setIsEditing(false);
    }
  };

  const handleSectionChange = (newSectionId) => {
    setSelectedSectionId(newSectionId);
    fetchTimetableForSection(selectedClassId, newSectionId, selectedAcademicYearId, selectedTermId);
  };

  // ============================================================
  // NON-ADMIN PORTAL DATA FETCHING
  // ============================================================
  const fetchStudentSchedule = async () => {
    try {
      const res = await api.get('/student/schedule', token);
      if (res.success) {
        setStudentScheduleData(res);
      }
    } catch (err) {
      console.error('Failed to fetch student schedule:', err);
    }
  };

  const fetchTeacherSchedule = async () => {
    try {
      const res = await api.get('/teacher/schedule', token);
      if (res.success) {
        setTeacherScheduleData(res);
      }
    } catch (err) {
      console.error('Failed to fetch teacher schedule:', err);
    }
  };

  const fetchParentSchedule = async (childId = '') => {
    try {
      const endpoint = childId ? `/parent/schedule?studentId=${childId}` : '/parent/schedule';
      const res = await api.get(endpoint, token);
      if (res.success) {
        setParentScheduleData(res);
        if (res.selectedChild && !childId) {
          setParentSelectedChildId(res.selectedChild.id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch parent schedule:', err);
    }
  };

  // ============================================================
  // ADMIN TIMETABLE ACTIONS: CREATE, EDIT, SAVE, PUBLISH, DELETE
  // ============================================================
  const handleOpenCreateModal = () => {
    setCreateForm({
      classId: selectedClassId || (classes[0]?.id || ''),
      sectionId: selectedSectionId || '',
      academicYearId: selectedAcademicYearId,
      termId: selectedTermId,
      newSectionTitle: ''
    });
    setError('');
    setSuccess('');
    setIsCreateModalOpen(true);
  };

  const handleExecuteCreateTimetable = async (targetClassId, targetSectionId, targetYearId, targetTermId) => {
    const clsId = targetClassId || selectedClassId || (classes[0]?.id || '');
    let secId = targetSectionId || selectedSectionId;
    const yearId = targetYearId || selectedAcademicYearId || 'AY-2025';
    const trmId = targetTermId || selectedTermId || 'TRM-01';

    if (!clsId) {
      setError('Please select a Grade level first.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // If no section id is provided:
      if (!secId) {
        // First check if any section already exists for this grade
        const existingClassSections = sections.filter((s) => s.classId === clsId);
        if (existingClassSections.length > 0) {
          secId = existingClassSections[0].id;
        } else {
          // No section exists at all for this grade, create one
          const secTitle = createForm.newSectionTitle?.trim() || 'Section A';
          const createSecRes = await api.post('/school/sections', {
            classId: clsId,
            title: secTitle,
            room: 'Room 101',
            capacity: 30
          }, token);

          if (createSecRes.success && createSecRes.section) {
            const newSec = createSecRes.section;
            setSections((prev) => [...prev, newSec]);
            secId = newSec.id;
          } else {
            setError(createSecRes.message || 'Please create a section for this grade first.');
            setSaving(false);
            return;
          }
        }
      }

      // Synchronize active selector state to the newly target section
      setSelectedClassId(clsId);
      setSelectedSectionId(secId);
      if (yearId) setSelectedAcademicYearId(yearId);
      if (trmId) setSelectedTermId(trmId);

      // Save initial timetable in database as Draft
      const payload = {
        classId: clsId,
        sectionId: secId,
        academicYearId: yearId,
        termId: trmId,
        status: 'Draft',
        periods: standardPeriods,
        entries: []
      };

      const res = await api.post('/academic/timetables/save', payload, token);
      if (res.success && res.timetable) {
        setActiveTimetable(res.timetable);
        setDraftEntries(res.timetable.entries || []);
        setIsEditing(true);
        setIsCreateModalOpen(false);
        const clsObj = classes.find((c) => c.id === clsId);
        const secObj = sections.find((s) => s.id === secId) || { title: 'Section' };
        setSuccess(`Timetable initialized for ${clsObj?.title || 'Grade'} — ${secObj?.title || 'Section'} in Draft mode. You are now in edit mode. Click on any slot below to add lessons.`);
      } else if (res.existingId) {
        // Load existing timetable for editing
        await fetchTimetableForSection(clsId, secId, yearId, trmId);
        setIsEditing(true);
        setIsCreateModalOpen(false);
        setSuccess('Loaded existing timetable for this section into editing mode.');
      } else {
        setError(res.message || 'Failed to initialize timetable.');
      }
    } catch (err) {
      setError('An unexpected error occurred while creating the timetable.');
    } finally {
      setSaving(false);
    }
  };

  const handleStartEditing = () => {
    setIsEditing(true);
    setDraftEntries(activeTimetable ? [...(activeTimetable.entries || [])] : []);
    setError('');
    setSuccess('');
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setDraftEntries(activeTimetable ? [...(activeTimetable.entries || [])] : []);
    setError('');
    setSuccess('');
  };

  const handleSaveDraft = async () => {
    if (!selectedClassId || !selectedSectionId) {
      setError('Please select a Grade and Section.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        id: activeTimetable?.id,
        classId: selectedClassId,
        sectionId: selectedSectionId,
        academicYearId: selectedAcademicYearId,
        termId: selectedTermId,
        status: 'Draft',
        periods: standardPeriods,
        entries: draftEntries
      };

      const res = await api.post('/academic/timetables/save', payload, token);
      if (res.success) {
        setActiveTimetable(res.timetable);
        setDraftEntries(res.timetable.entries || []);
        setIsEditing(false);
        setSuccess('Timetable draft saved successfully.');
      } else {
        setError(res.message || 'Failed to save timetable.');
      }
    } catch (err) {
      setError('An error occurred while saving the draft.');
    } finally {
      setSaving(false);
    }
  };

  const handlePublishTimetable = async () => {
    if (!activeTimetable?.id && draftEntries.length === 0) {
      setError('Please add at least one lesson before publishing.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        id: activeTimetable?.id,
        classId: selectedClassId,
        sectionId: selectedSectionId,
        academicYearId: selectedAcademicYearId,
        termId: selectedTermId,
        status: 'Published',
        periods: standardPeriods,
        entries: draftEntries
      };

      const res = await api.post('/academic/timetables/save', payload, token);
      if (res.success) {
        const pubRes = await api.post(`/academic/timetables/${res.timetable.id}/publish`, {}, token);
        if (pubRes.success) {
          setActiveTimetable(pubRes.timetable);
          setDraftEntries(pubRes.timetable.entries || []);
          setIsEditing(false);
          setSuccess('Timetable published successfully! It is now live in student, teacher, and parent portals.');
        } else {
          setError(pubRes.message || 'Validation error during publish.');
        }
      } else {
        setError(res.message || 'Failed to save before publishing.');
      }
    } catch (err) {
      setError('An error occurred while publishing the timetable.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTimetable = async () => {
    if (!activeTimetable?.id) return;
    if (!window.confirm('Are you sure you want to permanently delete this timetable? This cannot be undone.')) {
      return;
    }

    setSaving(true);
    try {
      const res = await api.delete(`/academic/timetables/${activeTimetable.id}`, token);
      if (res.success) {
        setActiveTimetable(null);
        setDraftEntries([]);
        setIsEditing(false);
        setSuccess('Timetable deleted successfully.');
      } else {
        setError(res.message || 'Failed to delete timetable.');
      }
    } catch (err) {
      setError('An error occurred while deleting timetable.');
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // LESSON MODAL & CONFLICT VALIDATION
  // ============================================================
  const handleOpenAddLesson = (day, periodObj) => {
    if (!isEditing) return;

    const defaultSub = subjects[0] || {};
    const defaultTch = teachers[0] || {};

    setEditingLessonIndex(null);
    setLessonForm({
      id: `TTE-${Date.now()}`,
      day,
      period: periodObj.period,
      startTime: periodObj.startTime,
      endTime: periodObj.endTime,
      timeSlot: `${periodObj.startTime} - ${periodObj.endTime}`,
      subjectId: defaultSub.id || '',
      subjectCode: defaultSub.code || '',
      subjectTitle: defaultSub.title || '',
      teacherId: defaultSub.teacherId || defaultTch.id || '',
      teacherName: defaultTch.name || 'Faculty Member',
      room: 'Room 101'
    });
    setError('');
    setIsLessonModalOpen(true);
  };

  const handleOpenEditLesson = (lesson, index) => {
    if (!isEditing) return;

    setEditingLessonIndex(index);
    setLessonForm({ ...lesson });
    setError('');
    setIsLessonModalOpen(true);
  };

  const handleLessonSubjectChange = (e) => {
    const subId = e.target.value;
    const sub = subjects.find((s) => s.id === subId);
    let tch = teachers.find((t) => t.id === sub?.teacherId) || teachers[0];

    setLessonForm((prev) => ({
      ...prev,
      subjectId: subId,
      subjectCode: sub ? sub.code : '',
      subjectTitle: sub ? sub.title : '',
      teacherId: tch ? tch.id : prev.teacherId,
      teacherName: tch ? tch.name : prev.teacherName
    }));
  };

  const handleLessonTeacherChange = (e) => {
    const tchId = e.target.value;
    const tch = teachers.find((t) => t.id === tchId);
    setLessonForm((prev) => ({
      ...prev,
      teacherId: tchId,
      teacherName: tch ? tch.name : 'Unassigned'
    }));
  };

  const handleSaveLessonModal = (e) => {
    e.preventDefault();

    if (!lessonForm.subjectId) {
      setError('Please select a subject for this period.');
      return;
    }

    if (lessonForm.startTime >= lessonForm.endTime) {
      setError('End time must be later than start time.');
      return;
    }

    // Check duplicate period inside draft entries
    const conflictInDraft = draftEntries.find((entry, idx) => {
      if (editingLessonIndex !== null && idx === editingLessonIndex) return false;
      if (entry.day !== lessonForm.day) return false;

      if (String(entry.period) === String(lessonForm.period)) return true;

      if (entry.startTime && entry.endTime && lessonForm.startTime && lessonForm.endTime) {
        return Math.max(entry.startTime, lessonForm.startTime) < Math.min(entry.endTime, lessonForm.endTime);
      }
      return false;
    });

    if (conflictInDraft) {
      setError(`Period conflict: ${lessonForm.day} already has a lesson scheduled at this time (${conflictInDraft.subjectCode || 'Lesson'}).`);
      return;
    }

    const updated = [...draftEntries];
    if (editingLessonIndex !== null) {
      updated[editingLessonIndex] = { ...lessonForm };
    } else {
      updated.push({ ...lessonForm });
    }

    setDraftEntries(updated);
    setIsLessonModalOpen(false);
    setError('');
  };

  const handleDeleteLessonModal = () => {
    if (editingLessonIndex === null) return;
    const updated = draftEntries.filter((_, idx) => idx !== editingLessonIndex);
    setDraftEntries(updated);
    setIsLessonModalOpen(false);
  };

  // ============================================================
  // QUICK ADD SECTION ACTION
  // ============================================================
  const handleOpenAddSectionModal = () => {
    setNewSectionForm({
      classId: selectedClassId || (classes[0]?.id || ''),
      title: '',
      room: 'Room 101',
      capacity: 30
    });
    setIsAddSectionModalOpen(true);
  };

  const handleSaveNewSection = async (e) => {
    e.preventDefault();
    if (!newSectionForm.classId || !newSectionForm.title) {
      setError('Class and Section Name are required.');
      return;
    }

    try {
      const res = await api.post('/school/sections', newSectionForm, token);
      if (res.success) {
        setIsAddSectionModalOpen(false);
        const created = res.section;
        setSections((prev) => [...prev, created]);
        setSelectedClassId(created.classId);
        setSelectedSectionId(created.id);
        setSuccess(`Section "${created.title}" created successfully.`);
        fetchTimetableForSection(created.classId, created.id, selectedAcademicYearId, selectedTermId);
      } else {
        setError(res.message || 'Failed to create section.');
      }
    } catch (err) {
      setError('Network error creating section.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // UI Derived Labels
  const currentClass = classes.find((c) => c.id === selectedClassId);
  const currentSection = sections.find((s) => s.id === selectedSectionId);
  const currentYear = academicYears.find((y) => y.id === selectedAcademicYearId);
  const currentTerm = terms.find((t) => t.id === selectedTermId);
  const filteredSections = sections.filter((s) => s.classId === selectedClassId);

  // ============================================================
  // RENDER: NON-ADMIN PORTALS
  // ============================================================

  // --- 1. STUDENT VIEW ---
  if (userRole === 'STUDENT') {
    if (loading) return <LoadingSpinner text="Retrieving class timetable..." />;

    const info = studentScheduleData?.studentInfo;
    const isPublished = studentScheduleData?.isPublished;
    const entries = studentScheduleData?.entries || [];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <Calendar size={22} color="var(--primary)" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff' }}>
                Academic Class Timetable
              </h2>
              {isPublished ? (
                <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '0.25rem 0.65rem', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                  Published Schedule
                </span>
              ) : (
                <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '0.25rem 0.65rem', borderRadius: '12px', backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }}>
                  Unpublished
                </span>
              )}
            </div>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.35rem' }}>
              {info ? `${info.className} — ${info.sectionName} | Academic Year 2025-2026 (Fall Term 2026)` : 'Loading enrolled class details...'}
            </p>
          </div>

          <button className="btn btn-secondary" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Printer size={16} /> Print Timetable
          </button>
        </div>

        {!isPublished || entries.length === 0 ? (
          <div className="glass-card" style={{ padding: '3.5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <Calendar size={48} color="#64748b" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#ffffff' }}>
              No Published Timetable Available
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', maxWidth: '480px' }}>
              {studentScheduleData?.message || 'Your section schedule is currently being finalized by academic administrators. Please check back shortly.'}
            </p>
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', minWidth: '850px' }}>
              <thead>
                <tr>
                  <th style={{ width: '150px' }}>Period & Time</th>
                  {schoolDays.map((day) => (
                    <th key={day} style={{ textAlign: 'center' }}>{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {standardPeriods.map((pObj) => {
                  if (pObj.type === 'break' || pObj.type === 'lunch') {
                    return (
                      <tr key={pObj.period} style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                        <td style={{ fontWeight: '700', color: '#fbbf24', fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}>
                          {pObj.type === 'break' ? <Coffee size={14} style={{ display: 'inline', marginRight: '0.4rem' }} /> : <Utensils size={14} style={{ display: 'inline', marginRight: '0.4rem' }} />}
                          {pObj.name}
                        </td>
                        <td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                          {pObj.startTime} — {pObj.endTime} ({pObj.name})
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={pObj.period}>
                      <td style={{ verticalAlign: 'top', padding: '0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                        <div style={{ fontWeight: '700', color: '#ffffff', fontSize: '0.8125rem' }}>{pObj.name}</div>
                        <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: '0.2rem' }}>{pObj.startTime} - {pObj.endTime}</div>
                      </td>
                      {schoolDays.map((day) => {
                        const lesson = entries.find((e) => e.day === day && parseInt(e.period) === pObj.period);
                        return (
                          <td key={day} style={{ verticalAlign: 'top', height: '90px', padding: '0.5rem', border: '1px solid var(--border-color)' }}>
                            {lesson ? (
                              <div style={{
                                padding: '0.625rem',
                                borderRadius: '8px',
                                backgroundColor: 'rgba(99, 102, 241, 0.12)',
                                borderLeft: '3px solid var(--primary)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.2rem'
                              }}>
                                <span style={{ fontWeight: '700', fontSize: '0.8125rem', color: '#ffffff' }}>
                                  {lesson.subjectCode}
                                </span>
                                <span style={{ fontSize: '0.6875rem', color: '#cbd5e1', lineHeight: '1.2' }}>
                                  {lesson.subjectTitle}
                                </span>
                                <div style={{ fontSize: '0.6875rem', color: 'var(--accent-cyan)', marginTop: '0.25rem', fontWeight: '500' }}>
                                  {lesson.room}
                                </div>
                                <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
                                  {lesson.teacherName}
                                </div>
                              </div>
                            ) : (
                              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.75rem' }}>
                                Free Period
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // --- 2. TEACHER VIEW ---
  if (userRole === 'TEACHER') {
    if (loading) return <LoadingSpinner text="Retrieving faculty teaching schedule..." />;

    const teacher = teacherScheduleData?.teacher;
    const timetable = teacherScheduleData?.timetable || [];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <Calendar size={22} color="#38bdf8" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff' }}>
                Faculty Teaching Schedule
              </h2>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.35rem' }}>
              Instructor: <strong style={{ color: '#ffffff' }}>{teacher?.name || user?.name}</strong> | Department: {teacher?.department || 'Faculty'} | Total Lessons: {timetable.length} periods/week
            </p>
          </div>

          <button className="btn btn-secondary" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Printer size={16} /> Print Schedule
          </button>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', minWidth: '850px' }}>
            <thead>
              <tr>
                <th style={{ width: '150px' }}>Period & Time</th>
                {schoolDays.map((day) => (
                  <th key={day} style={{ textAlign: 'center' }}>{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {standardPeriods.map((pObj) => {
                if (pObj.type === 'break' || pObj.type === 'lunch') {
                  return (
                    <tr key={pObj.period} style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                      <td style={{ fontWeight: '700', color: '#fbbf24', fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}>
                        {pObj.name}
                      </td>
                      <td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem' }}>
                        {pObj.startTime} — {pObj.endTime}
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={pObj.period}>
                    <td style={{ verticalAlign: 'top', padding: '0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                      <div style={{ fontWeight: '700', color: '#ffffff', fontSize: '0.8125rem' }}>{pObj.name}</div>
                      <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: '0.2rem' }}>{pObj.startTime} - {pObj.endTime}</div>
                    </td>
                    {schoolDays.map((day) => {
                      const lesson = timetable.find((e) => e.day === day && parseInt(e.period) === pObj.period);
                      return (
                        <td key={day} style={{ verticalAlign: 'top', height: '90px', padding: '0.5rem', border: '1px solid var(--border-color)' }}>
                          {lesson ? (
                            <div style={{
                              padding: '0.625rem',
                              borderRadius: '8px',
                              backgroundColor: 'rgba(56, 189, 248, 0.12)',
                              borderLeft: '3px solid #38bdf8',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.2rem'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: '700', fontSize: '0.8125rem', color: '#38bdf8' }}>
                                  {lesson.subjectCode}
                                </span>
                                <span style={{ fontSize: '0.6875rem', color: '#fbbf24', fontWeight: '600' }}>
                                  {lesson.sectionName || lesson.className}
                                </span>
                              </div>
                              <span style={{ fontSize: '0.6875rem', color: '#cbd5e1' }}>
                                {lesson.subjectTitle || lesson.className}
                              </span>
                              <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                                Location: <strong style={{ color: '#ffffff' }}>{lesson.room}</strong>
                              </div>
                            </div>
                          ) : (
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.75rem' }}>
                              Available / Office Hours
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // --- 3. PARENT VIEW ---
  if (userRole === 'PARENT') {
    if (loading) return <LoadingSpinner text="Retrieving student schedule..." />;

    const children = parentScheduleData?.children || [];
    const selectedChild = parentScheduleData?.selectedChild;
    const isPublished = parentScheduleData?.isPublished;
    const entries = parentScheduleData?.entries || [];

    const handleChildSelectChange = (e) => {
      const childId = e.target.value;
      setParentSelectedChildId(childId);
      fetchParentSchedule(childId);
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <Calendar size={22} color="#f59e0b" />
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff' }}>
                Student Class Timetable
              </h2>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.35rem' }}>
              Student: <strong style={{ color: '#ffffff' }}>{selectedChild?.name}</strong> ({selectedChild?.admissionNo}) | Class: {selectedChild?.className} — {selectedChild?.sectionName}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {children.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Select Child:</label>
                <select
                  className="form-select"
                  value={parentSelectedChildId}
                  onChange={handleChildSelectChange}
                  style={{ width: 'auto', minWidth: '160px' }}
                >
                  {children.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.studentId})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button className="btn btn-secondary" onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Printer size={16} /> Print
            </button>
          </div>
        </div>

        {!isPublished || entries.length === 0 ? (
          <div className="glass-card" style={{ padding: '3.5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <Calendar size={48} color="#64748b" />
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#ffffff' }}>
              No Published Timetable
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', maxWidth: '480px' }}>
              The timetable for {selectedChild?.name}'s section is not yet published by the administration.
            </p>
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', minWidth: '850px' }}>
              <thead>
                <tr>
                  <th style={{ width: '150px' }}>Period & Time</th>
                  {schoolDays.map((day) => (
                    <th key={day} style={{ textAlign: 'center' }}>{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {standardPeriods.map((pObj) => {
                  if (pObj.type === 'break' || pObj.type === 'lunch') {
                    return (
                      <tr key={pObj.period} style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                        <td style={{ fontWeight: '700', color: '#fbbf24', fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}>
                          {pObj.name}
                        </td>
                        <td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem' }}>
                          {pObj.startTime} — {pObj.endTime}
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={pObj.period}>
                      <td style={{ verticalAlign: 'top', padding: '0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                        <div style={{ fontWeight: '700', color: '#ffffff', fontSize: '0.8125rem' }}>{pObj.name}</div>
                        <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: '0.2rem' }}>{pObj.startTime} - {pObj.endTime}</div>
                      </td>
                      {schoolDays.map((day) => {
                        const lesson = entries.find((e) => e.day === day && parseInt(e.period) === pObj.period);
                        return (
                          <td key={day} style={{ verticalAlign: 'top', height: '90px', padding: '0.5rem', border: '1px solid var(--border-color)' }}>
                            {lesson ? (
                              <div style={{
                                padding: '0.625rem',
                                borderRadius: '8px',
                                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                                borderLeft: '3px solid #f59e0b',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.2rem'
                              }}>
                                <span style={{ fontWeight: '700', fontSize: '0.8125rem', color: '#ffffff' }}>
                                  {lesson.subjectCode}
                                </span>
                                <span style={{ fontSize: '0.6875rem', color: '#cbd5e1' }}>
                                  {lesson.subjectTitle}
                                </span>
                                <div style={{ fontSize: '0.6875rem', color: '#fbbf24', marginTop: '0.2rem' }}>
                                  {lesson.room}
                                </div>
                                <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
                                  Instructor: {lesson.teacherName}
                                </div>
                              </div>
                            ) : (
                              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.75rem' }}>
                                Free Period
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // ============================================================
  // --- 4. ADMIN PORTAL TIMETABLE MANAGEMENT SYSTEM ---
  // ============================================================
  if (loading) return <LoadingSpinner text="Loading timetable management engine..." />;

  const displayEntries = isEditing ? draftEntries : (activeTimetable?.entries || []);
  const timetableStatus = activeTimetable ? activeTimetable.status : 'Unconfigured';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Alert Notifications */}
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Toolbar */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          {/* Selectors Group */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
            {/* Academic Year */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.6875rem', color: '#94a3b8', fontWeight: '600' }}>Academic Year</label>
              <select
                className="form-select"
                value={selectedAcademicYearId}
                onChange={(e) => {
                  setSelectedAcademicYearId(e.target.value);
                  fetchTimetableForSection(selectedClassId, selectedSectionId, e.target.value, selectedTermId);
                }}
                style={{ fontSize: '0.8125rem', padding: '0.4rem 0.75rem' }}
              >
                {academicYears.map((ay) => (
                  <option key={ay.id} value={ay.id}>{ay.title}</option>
                ))}
              </select>
            </div>

            {/* Term */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.6875rem', color: '#94a3b8', fontWeight: '600' }}>Term / Semester</label>
              <select
                className="form-select"
                value={selectedTermId}
                onChange={(e) => {
                  setSelectedTermId(e.target.value);
                  fetchTimetableForSection(selectedClassId, selectedSectionId, selectedAcademicYearId, e.target.value);
                }}
                style={{ fontSize: '0.8125rem', padding: '0.4rem 0.75rem' }}
              >
                {terms.map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>

            {/* Grade */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.6875rem', color: '#94a3b8', fontWeight: '600' }}>Grade / Level</label>
              <select
                className="form-select"
                value={selectedClassId}
                onChange={(e) => handleClassChange(e.target.value)}
                style={{ fontSize: '0.8125rem', padding: '0.4rem 0.75rem', fontWeight: '600' }}
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.6875rem', color: '#94a3b8', fontWeight: '600' }}>Class Section</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <select
                  className="form-select"
                  value={selectedSectionId}
                  onChange={(e) => handleSectionChange(e.target.value)}
                  style={{ fontSize: '0.8125rem', padding: '0.4rem 0.75rem', fontWeight: '600' }}
                >
                  {filteredSections.length === 0 ? (
                    <option value="">No sections in this grade</option>
                  ) : (
                    filteredSections.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title} ({s.room || 'General'})
                      </option>
                    ))
                  )}
                </select>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleOpenAddSectionModal}
                  title="Add New Section to this Grade"
                  style={{ padding: '0.4rem 0.6rem', fontSize: '0.8125rem' }}
                >
                  <Plus size={14} /> Add Section
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginRight: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Status:</span>
              {timetableStatus === 'Published' && (
                <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '0.25rem 0.65rem', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
                  Published
                </span>
              )}
              {timetableStatus === 'Draft' && (
                <span style={{ fontSize: '0.75rem', fontWeight: '700', padding: '0.25rem 0.65rem', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
                  Draft
                </span>
              )}
              {timetableStatus === 'Unconfigured' && (
                <span style={{ fontSize: '0.75rem', fontWeight: '600', padding: '0.25rem 0.65rem', borderRadius: '12px', backgroundColor: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8' }}>
                  Not Created
                </span>
              )}
            </div>

            {!activeTimetable && !isEditing && (
              <button
                className="btn btn-primary"
                onClick={handleOpenCreateModal}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Plus size={16} /> Create Timetable
              </button>
            )}

            {activeTimetable && !isEditing && (
              <>
                <button
                  className="btn btn-secondary"
                  onClick={handleStartEditing}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Edit3 size={15} /> Edit Timetable
                </button>

                {activeTimetable.status === 'Draft' && (
                  <button
                    className="btn btn-primary"
                    onClick={handlePublishTimetable}
                    disabled={saving}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#10b981' }}
                  >
                    <Send size={15} /> Publish Timetable
                  </button>
                )}

                <button
                  className="btn btn-danger"
                  onClick={handleDeleteTimetable}
                  disabled={saving}
                  style={{ padding: '0.45rem 0.75rem' }}
                  title="Delete Timetable"
                >
                  <Trash2 size={15} />
                </button>
              </>
            )}

            {isEditing && (
              <>
                <button
                  className="btn btn-secondary"
                  onClick={handleCancelEditing}
                  disabled={saving}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <X size={15} /> Cancel
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={handleSaveDraft}
                  disabled={saving}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Save size={15} /> {saving ? 'Saving...' : 'Save Draft'}
                </button>

                <button
                  className="btn btn-primary"
                  onClick={handlePublishTimetable}
                  disabled={saving}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#10b981' }}
                >
                  <Send size={15} /> Publish
                </button>
              </>
            )}

            <button
              className="btn btn-secondary"
              onClick={handlePrint}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              title="Print Clean Printable Schedule"
            >
              <Printer size={15} /> Print
            </button>
          </div>
        </div>

        {/* Dynamic Heading */}
        <div style={{
          padding: '0.85rem 1.25rem',
          borderRadius: '8px',
          background: 'linear-gradient(90deg, rgba(99, 102, 241, 0.1) 0%, rgba(56, 189, 248, 0.05) 100%)',
          borderLeft: '4px solid var(--primary)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#ffffff' }}>
              {currentClass ? currentClass.title : 'Grade'} — {currentSection ? currentSection.title : 'Section'} | Weekly Timetable | {currentYear ? currentYear.title : 'AY 2025-2026'} ({currentTerm ? currentTerm.title : 'Term'})
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Independent schedule for section {currentSection?.title || ''} • Real-time Conflict Engine Active
            </span>
          </div>

          {isEditing && (
            <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Edit3 size={14} /> Editing Mode: Click slots to add or modify lessons
            </span>
          )}
        </div>
      </div>

      {/* Main Grid View or Empty State Card */}
      {!activeTimetable && !isEditing ? (
        <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ padding: '1.25rem', borderRadius: '50%', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
            <Calendar size={48} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff' }}>
              No Timetable Created for {currentClass?.title || 'This Grade'} — {currentSection?.title || 'This Section'}
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.35rem', maxWidth: '520px' }}>
              Every section has its own independent schedule. Click below to initialize this timetable, assign lessons, teachers, and rooms without conflicts.
            </p>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => handleExecuteCreateTimetable(selectedClassId, selectedSectionId || filteredSections[0]?.id, selectedAcademicYearId, selectedTermId)}
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.5rem', fontSize: '0.9375rem' }}
          >
            <Plus size={18} /> {saving ? 'Initializing...' : `Create Timetable for ${currentSection?.title || filteredSections[0]?.title || currentClass?.title || 'Section'}`}
          </button>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ width: '160px' }}>Period & Time</th>
                {schoolDays.map((day) => (
                  <th key={day} style={{ textAlign: 'center', width: '16.8%' }}>
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {standardPeriods.map((pObj) => {
                if (pObj.type === 'break' || pObj.type === 'lunch') {
                  return (
                    <tr key={pObj.period} style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
                      <td style={{ fontWeight: '700', color: '#fbbf24', fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}>
                        {pObj.type === 'break' ? <Coffee size={14} style={{ display: 'inline', marginRight: '0.4rem' }} /> : <Utensils size={14} style={{ display: 'inline', marginRight: '0.4rem' }} />}
                        {pObj.name}
                      </td>
                      <td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                        {pObj.startTime} — {pObj.endTime} ({pObj.name})
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={pObj.period}>
                    <td style={{ verticalAlign: 'top', padding: '0.75rem', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRight: '1px solid var(--border-color)' }}>
                      <div style={{ fontWeight: '700', color: '#ffffff', fontSize: '0.8125rem' }}>{pObj.name}</div>
                      <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: '0.2rem' }}>{pObj.startTime} - {pObj.endTime}</div>
                    </td>

                    {schoolDays.map((day) => {
                      const lessonIndex = displayEntries.findIndex((e) => e.day === day && parseInt(e.period) === pObj.period);
                      const lesson = lessonIndex >= 0 ? displayEntries[lessonIndex] : null;

                      return (
                        <td
                          key={day}
                          onClick={() => {
                            if (isEditing) {
                              if (lesson) {
                                handleOpenEditLesson(lesson, lessonIndex);
                              } else {
                                handleOpenAddLesson(day, pObj);
                              }
                            }
                          }}
                          style={{
                            verticalAlign: 'top',
                            height: '95px',
                            padding: '0.4rem',
                            border: '1px solid var(--border-color)',
                            cursor: isEditing ? 'pointer' : 'default',
                            transition: 'background-color 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            if (isEditing) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                          }}
                          onMouseLeave={(e) => {
                            if (isEditing) e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          {lesson ? (
                            <div style={{
                              height: '100%',
                              padding: '0.5rem',
                              borderRadius: '8px',
                              backgroundColor: 'rgba(99, 102, 241, 0.14)',
                              borderLeft: '3px solid var(--primary)',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                              <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontWeight: '800', fontSize: '0.8125rem', color: '#ffffff' }}>
                                    {lesson.subjectCode}
                                  </span>
                                  {isEditing && (
                                    <Edit3 size={12} color="var(--primary)" style={{ opacity: 0.8 }} />
                                  )}
                                </div>
                                <div style={{ fontSize: '0.6875rem', color: '#cbd5e1', lineHeight: '1.2', marginTop: '0.15rem' }}>
                                  {lesson.subjectTitle}
                                </div>
                              </div>

                              <div style={{ marginTop: '0.25rem' }}>
                                <div style={{ fontSize: '0.6875rem', color: 'var(--accent-cyan)', fontWeight: '600' }}>
                                  {lesson.room}
                                </div>
                                <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
                                  {lesson.teacherName}
                                </div>
                              </div>
                            </div>
                          ) : isEditing ? (
                            <div style={{
                              height: '100%',
                              borderRadius: '6px',
                              border: '1px dashed rgba(255, 255, 255, 0.15)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#94a3b8',
                              fontSize: '0.75rem',
                              gap: '0.25rem'
                            }}>
                              <Plus size={14} /> Add Lesson
                            </div>
                          ) : (
                            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.75rem' }}>
                              Free Slot
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ============================================================
          MODAL: CREATE TIMETABLE (DEDICATED EDITOR INITIATION)
      ============================================================ */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create & Initialize Timetable"
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          handleExecuteCreateTimetable(createForm.classId, createForm.sectionId, createForm.academicYearId, createForm.termId);
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Academic Year *</label>
              <select
                className="form-select"
                value={createForm.academicYearId}
                onChange={(e) => setCreateForm({ ...createForm, academicYearId: e.target.value })}
              >
                {academicYears.map((ay) => (
                  <option key={ay.id} value={ay.id}>{ay.title}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Term / Semester *</label>
              <select
                className="form-select"
                value={createForm.termId}
                onChange={(e) => setCreateForm({ ...createForm, termId: e.target.value })}
              >
                {terms.map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Target Grade / Level *</label>
            <select
              className="form-select"
              required
              value={createForm.classId}
              onChange={(e) => {
                const newCls = e.target.value;
                const secs = sections.filter((s) => s.classId === newCls);
                setCreateForm({
                  ...createForm,
                  classId: newCls,
                  sectionId: secs[0]?.id || ''
                });
              }}
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Target Section *</label>
            {sections.filter((s) => s.classId === createForm.classId).length > 0 ? (
              <select
                className="form-select"
                value={createForm.sectionId}
                onChange={(e) => setCreateForm({ ...createForm, sectionId: e.target.value })}
              >
                {sections.filter((s) => s.classId === createForm.classId).map((s) => (
                  <option key={s.id} value={s.id}>{s.title} ({s.room || 'General Room'})</option>
                ))}
              </select>
            ) : (
              <div>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Section A"
                  value={createForm.newSectionTitle}
                  onChange={(e) => setCreateForm({ ...createForm, newSectionTitle: e.target.value })}
                />
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem', display: 'block' }}>
                  No section exists in this grade yet. Enter a section name (e.g. Section A) to create it automatically.
                </span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Initializing...' : 'Create & Open Editor'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ============================================================
          MODAL: ADD / EDIT LESSON SLOT
      ============================================================ */}
      <Modal
        isOpen={isLessonModalOpen}
        onClose={() => setIsLessonModalOpen(false)}
        title={editingLessonIndex !== null ? 'Edit Scheduled Lesson' : 'Schedule New Lesson'}
      >
        <form onSubmit={handleSaveLessonModal}>
          <div className="form-group">
            <label className="form-label">Subject *</label>
            <select
              className="form-select"
              required
              value={lessonForm.subjectId}
              onChange={handleLessonSubjectChange}
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code} - {sub.title} ({sub.department})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Day of Week</label>
              <select
                className="form-select"
                value={lessonForm.day}
                onChange={(e) => setLessonForm({ ...lessonForm, day: e.target.value })}
              >
                {schoolDays.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Period (1 - 6)</label>
              <select
                className="form-select"
                value={lessonForm.period}
                onChange={(e) => {
                  const pNum = parseInt(e.target.value);
                  const pMatch = standardPeriods.find((p) => p.period === pNum);
                  setLessonForm((prev) => ({
                    ...prev,
                    period: pNum,
                    startTime: pMatch ? pMatch.startTime : prev.startTime,
                    endTime: pMatch ? pMatch.endTime : prev.endTime,
                    timeSlot: pMatch ? `${pMatch.startTime} - ${pMatch.endTime}` : prev.timeSlot
                  }));
                }}
              >
                {standardPeriods.filter((p) => typeof p.period === 'number').map((p) => (
                  <option key={p.period} value={p.period}>
                    {p.name} ({p.startTime} - {p.endTime})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Period Start Time</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="08:30"
                value={lessonForm.startTime}
                onChange={(e) => setLessonForm({ ...lessonForm, startTime: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Period End Time</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="09:15"
                value={lessonForm.endTime}
                onChange={(e) => setLessonForm({ ...lessonForm, endTime: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Assigned Teacher *</label>
              <select
                className="form-select"
                value={lessonForm.teacherId}
                onChange={handleLessonTeacherChange}
              >
                {teachers.map((tch) => (
                  <option key={tch.id} value={tch.id}>
                    {tch.name} ({tch.department || 'Faculty'})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Classroom / Laboratory *</label>
              <input
                type="text"
                required
                list="room-suggestions"
                className="form-input"
                placeholder="e.g. Room 101, Lab 301"
                value={lessonForm.room}
                onChange={(e) => setLessonForm({ ...lessonForm, room: e.target.value })}
              />
              <datalist id="room-suggestions">
                {roomOptions.map((rm) => (
                  <option key={rm} value={rm} />
                ))}
              </datalist>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
            {editingLessonIndex !== null ? (
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteLessonModal}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Trash2 size={15} /> Remove Lesson
              </button>
            ) : <div />}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsLessonModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingLessonIndex !== null ? 'Apply Changes' : 'Add to Schedule'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* ============================================================
          MODAL: QUICK ADD NEW SECTION
      ============================================================ */}
      <Modal
        isOpen={isAddSectionModalOpen}
        onClose={() => setIsAddSectionModalOpen(false)}
        title="Add New Section to Grade"
      >
        <form onSubmit={handleSaveNewSection}>
          <div className="form-group">
            <label className="form-label">Parent Grade Level *</label>
            <select
              className="form-select"
              required
              value={newSectionForm.classId}
              onChange={(e) => setNewSectionForm({ ...newSectionForm, classId: e.target.value })}
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Section Name *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Section C, Section D"
                value={newSectionForm.title}
                onChange={(e) => setNewSectionForm({ ...newSectionForm, title: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Assigned Room</label>
              <input
                type="text"
                className="form-input"
                placeholder="Room 103"
                value={newSectionForm.room}
                onChange={(e) => setNewSectionForm({ ...newSectionForm, room: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Student Capacity</label>
            <input
              type="number"
              min="1"
              max="100"
              className="form-input"
              value={newSectionForm.capacity}
              onChange={(e) => setNewSectionForm({ ...newSectionForm, capacity: parseInt(e.target.value) || 30 })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsAddSectionModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Section
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
