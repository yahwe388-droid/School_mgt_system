import React, { useState, useEffect } from 'react';
import { Award, Save, Search, Plus, CheckCircle, Edit2 } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../common/Alert';
import { Modal } from '../common/Modal';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const TeacherGradesManager = () => {
  const { token } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [students, setStudents] = useState([]);
  const [gradesList, setGradesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Grade Entry Modal
  const [isEntryOpen, setIsEntryOpen] = useState(false);
  const [entryForm, setEntryForm] = useState({
    studentId: '',
    assessmentTitle: 'Midterm Examination',
    subjectCode: 'CS-401',
    marksObtained: '',
    totalMarks: 100
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      fetchClassData();
    }
  }, [selectedClassId]);

  const fetchInitialData = async () => {
    try {
      const clsRes = await api.get('/teacher/classes', token);
      if (clsRes.success && clsRes.classes?.length > 0) {
        setClasses(clsRes.classes);
        setSelectedClassId(clsRes.classes[0].id);
      }
    } catch {
      setError('Unable to load assigned classes.');
    }
  };

  const fetchClassData = async () => {
    setLoading(true);
    setError('');
    try {
      const [stuRes, grdRes] = await Promise.all([
        api.get(`/teacher/students?classId=${selectedClassId}`, token),
        api.get('/teacher/grades', token)
      ]);

      if (stuRes.success && stuRes.students) {
        setStudents(stuRes.students);
        if (stuRes.students.length > 0) {
          setEntryForm(prev => ({ ...prev, studentId: stuRes.students[0].id }));
        }
      }
      if (grdRes.success && grdRes.results) {
        setGradesList(grdRes.results);
      }
    } catch {
      setError('Failed to load grade book records.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGrade = async (e) => {
    e.preventDefault();
    if (!entryForm.studentId || !entryForm.marksObtained) {
      setError('Student and marks are required.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await api.post('/teacher/grades', {
        studentId: entryForm.studentId,
        subjectCode: entryForm.subjectCode,
        marksObtained: Number(entryForm.marksObtained),
        totalMarks: Number(entryForm.totalMarks) || 100,
        examId: `EXM-${Date.now()}`
      }, token);

      if (res.success) {
        setSuccessMsg('Grade submitted and stored in institutional ledger.');
        setIsEntryOpen(false);
        setEntryForm(prev => ({ ...prev, marksObtained: '' }));
        await fetchClassData();
      } else {
        setError(res.message || 'Failed to record grade.');
      }
    } catch (err) {
      setError('An error occurred persisting grade entry.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="glass-card" style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Award size={24} color="#f59e0b" /> Official Faculty Gradebook & Assessments
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Enter exam, project, and term scores with automated letter grade and GPA computation.
          </p>
        </div>

        <button
          onClick={() => setIsEntryOpen(true)}
          disabled={students.length === 0}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={16} /> Enter Grade Entry
        </button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} />}

      {/* Cohort Selector */}
      <div className="glass-card" style={{ padding: '1rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <label style={{ fontSize: '0.8125rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Select Cohort:</label>
        <select
          className="form-select"
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          style={{ maxWidth: '280px' }}
        >
          {classes.map(c => (
            <option key={c.id} value={c.id}>{c.title} ({c.code || c.id})</option>
          ))}
        </select>
      </div>

      {/* Grades Table */}
      <div className="glass-card" style={{ padding: '1rem', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <LoadingSpinner text="Retrieving grade book..." />
          </div>
        ) : gradesList.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            No assessment results recorded for this cohort yet. Click "Enter Grade Entry" to log student scores.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Student Name</th>
                <th style={{ padding: '0.75rem 1rem' }}>Course Code</th>
                <th style={{ padding: '0.75rem 1rem' }}>Marks / Max</th>
                <th style={{ padding: '0.75rem 1rem' }}>Percentage</th>
                <th style={{ padding: '0.75rem 1rem' }}>Letter Grade</th>
                <th style={{ padding: '0.75rem 1rem' }}>GPA</th>
                <th style={{ padding: '0.75rem 1rem' }}>Evaluation</th>
              </tr>
            </thead>
            <tbody>
              {gradesList.map((g) => (
                <tr key={g.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '0.875rem 1rem', fontWeight: '600', color: '#f8fafc' }}>
                    {g.studentName}
                  </td>
                  <td style={{ padding: '0.875rem 1rem', fontFamily: 'monospace', color: '#38bdf8' }}>
                    {g.subjectCode}
                  </td>
                  <td style={{ padding: '0.875rem 1rem', fontWeight: '700' }}>
                    {g.marksObtained} / {g.totalMarks}
                  </td>
                  <td style={{ padding: '0.875rem 1rem', color: '#cbd5e1' }}>
                    {g.percentage}%
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <span className={`badge ${g.letterGrade === 'A' ? 'badge-success' : g.letterGrade === 'F' ? 'badge-danger' : 'badge-warning'}`}>
                      Grade {g.letterGrade}
                    </span>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', fontWeight: '700', color: '#10b981' }}>
                    {g.gpa?.toFixed(1) || '4.0'}
                  </td>
                  <td style={{ padding: '0.875rem 1rem', color: '#94a3b8', fontSize: '0.8125rem' }}>
                    {g.remarks || 'Satisfactory'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Grade Entry Modal */}
      <Modal
        isOpen={isEntryOpen}
        onClose={() => setIsEntryOpen(false)}
        title="Record Student Assessment Grade"
      >
        <form onSubmit={handleSaveGrade} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Select Student *</label>
            <select
              className="form-select"
              required
              value={entryForm.studentId}
              onChange={(e) => setEntryForm({ ...entryForm, studentId: e.target.value })}
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.studentId || s.admissionNo})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Subject Code *</label>
              <input
                type="text"
                required
                className="form-input"
                value={entryForm.subjectCode}
                onChange={(e) => setEntryForm({ ...entryForm, subjectCode: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Assessment Title</label>
              <input
                type="text"
                className="form-input"
                value={entryForm.assessmentTitle}
                onChange={(e) => setEntryForm({ ...entryForm, assessmentTitle: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Marks Obtained *</label>
              <input
                type="number"
                min="0"
                max={entryForm.totalMarks}
                required
                className="form-input"
                placeholder="e.g. 88"
                value={entryForm.marksObtained}
                onChange={(e) => setEntryForm({ ...entryForm, marksObtained: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Total Maximum Marks</label>
              <input
                type="number"
                min="10"
                max="500"
                required
                className="form-input"
                value={entryForm.totalMarks}
                onChange={(e) => setEntryForm({ ...entryForm, totalMarks: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsEntryOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              {saving ? 'Recording Grade...' : 'Save & Store Grade'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
