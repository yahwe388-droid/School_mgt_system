import React, { useState, useEffect } from 'react';
import { CalendarCheck, CheckCircle2, Clock, XCircle, AlertCircle, Save, Calendar, Check } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../common/Alert';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const TeacherAttendanceManager = () => {
  const { token } = useAuth();
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [remarks, setRemarks] = useState({});
  const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, percentage: 100 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    fetchInitialClasses();
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      fetchClassAttendance();
    }
  }, [selectedClassId, selectedDate]);

  const fetchInitialClasses = async () => {
    try {
      const res = await api.get('/teacher/classes', token);
      if (res.success && res.classes?.length > 0) {
        setClasses(res.classes);
        setSelectedClassId(res.classes[0].id);
      }
    } catch {
      setError('Unable to load authorized classes.');
    }
  };

  const fetchClassAttendance = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/teacher/attendance?classId=${selectedClassId}&date=${selectedDate}`, token);
      if (res.success && res.students) {
        setStudents(res.students);
        if (res.stats) setStats(res.stats);

        // Pre-fill statuses
        const statusMap = {};
        const remarkMap = {};
        res.students.forEach(s => {
          statusMap[s.studentId] = s.status || 'Present';
          remarkMap[s.studentId] = s.remarks || '';
        });
        setAttendanceRecords(statusMap);
        setRemarks(remarkMap);
      }
    } catch (err) {
      setError('Failed to load class attendance register.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceRecords(prev => ({ ...prev, [studentId]: status }));
  };

  const handleRemarkChange = (studentId, remark) => {
    setRemarks(prev => ({ ...prev, [studentId]: remark }));
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    setError('');
    setSuccessMsg('');

    const recordsPayload = students.map(s => ({
      studentId: s.studentId,
      name: s.name,
      status: attendanceRecords[s.studentId] || 'Present',
      remarks: remarks[s.studentId] || ''
    }));

    try {
      const res = await api.post('/teacher/attendance', {
        classId: selectedClassId,
        date: selectedDate,
        records: recordsPayload
      }, token);

      if (res.success) {
        setSuccessMsg(`Attendance saved to database for ${students.length} students on ${selectedDate}.`);
        await fetchClassAttendance();
      } else {
        setError(res.message || 'Failed to record attendance.');
      }
    } catch (err) {
      setError('An error occurred persisting attendance.');
    } finally {
      setSaving(false);
    }
  };

  const markAll = (status) => {
    const updated = {};
    students.forEach(s => {
      updated[s.studentId] = status;
    });
    setAttendanceRecords(updated);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="glass-card" style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <CalendarCheck size={24} color="#10b981" /> Faculty Attendance Register
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Daily institutional roll-call management with database synchronization and conflict prevention.
          </p>
        </div>

        <button
          onClick={handleSaveAttendance}
          disabled={saving || students.length === 0}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Save size={16} /> {saving ? 'Saving to Database...' : 'Save & Submit Register'}
        </button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} />}

      {/* Control Bar: Class selector, Date Picker, Quick Actions */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Select Assigned Class</label>
            <select
              className="form-select"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              style={{ minWidth: '220px' }}
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.title} ({c.code || c.id})</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase' }}>Attendance Date</label>
            <input
              type="date"
              className="form-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={{ padding: '0.5rem 0.75rem' }}
            />
          </div>
        </div>

        {/* Quick Fill Actions */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => markAll('Present')}
            className="btn btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', color: '#10b981' }}
          >
            Mark All Present
          </button>
          <button
            type="button"
            onClick={() => markAll('Absent')}
            className="btn btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', color: '#ef4444' }}
          >
            Mark All Absent
          </button>
        </div>
      </div>

      {/* Register Table */}
      <div className="glass-card" style={{ padding: '1rem', overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <LoadingSpinner text="Retrieving class roll call..." />
          </div>
        ) : students.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            No enrolled students found for the selected cohort.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Student ID</th>
                <th style={{ padding: '0.75rem 1rem' }}>Student Name</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Attendance Status</th>
                <th style={{ padding: '0.75rem 1rem' }}>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => {
                const currentStatus = attendanceRecords[s.studentId] || 'Present';
                return (
                  <tr key={s.studentId} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.875rem 1rem', fontFamily: 'monospace', fontWeight: '700', color: '#38bdf8' }}>
                      {s.admissionNo || s.studentId}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: '600', color: '#f8fafc' }}>
                      {s.name}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '0.375rem', background: 'rgba(0,0,0,0.2)', padding: '0.25rem', borderRadius: '6px' }}>
                        {['Present', 'Late', 'Absent'].map((st) => {
                          const isSel = currentStatus === st;
                          const color = st === 'Present' ? '#10b981' : st === 'Late' ? '#f59e0b' : '#ef4444';
                          return (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleStatusChange(s.studentId, st)}
                              style={{
                                padding: '0.25rem 0.625rem',
                                borderRadius: '4px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                backgroundColor: isSel ? color : 'transparent',
                                color: isSel ? '#ffffff' : '#94a3b8',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              {st}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Optional remarks (e.g. Bus delay)"
                        style={{ padding: '0.35rem 0.5rem', fontSize: '0.8125rem' }}
                        value={remarks[s.studentId] || ''}
                        onChange={(e) => handleRemarkChange(s.studentId, e.target.value)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
