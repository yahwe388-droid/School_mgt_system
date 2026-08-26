import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, AlertTriangle, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../common/Alert';
import { Modal } from '../common/Modal';

export const TimetableManager = () => {
  const { token, user } = useAuth();
  const [timetables, setTimetables] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    day: 'Monday',
    period: 1,
    timeSlot: '09:00 - 10:00 AM',
    room: 'Room 301',
    subjectId: '',
    subjectCode: '',
    teacherName: 'Dr. Robert Vance',
    classId: 'CLS-12'
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = [1, 2, 3, 4];

  useEffect(() => {
    fetchTimetableData();
  }, []);

  const fetchTimetableData = async () => {
    const res = await api.get('/academic/timetables', token);
    if (res.success) setTimetables(res.timetables);

    const subRes = await api.get('/school/subjects');
    if (subRes.success) {
      setSubjects(subRes.subjects);
      if (subRes.subjects.length > 0) {
        setForm((prev) => ({
          ...prev,
          subjectId: subRes.subjects[0].id,
          subjectCode: subRes.subjects[0].code
        }));
      }
    }
  };

  const handleSubjectChange = (e) => {
    const selectedId = e.target.value;
    const sub = subjects.find((s) => s.id === selectedId);
    setForm({
      ...form,
      subjectId: selectedId,
      subjectCode: sub ? sub.code : ''
    });
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    setError('');

    const res = await api.post('/academic/timetables', form, token);
    if (res.success) {
      setIsModalOpen(false);
      fetchTimetableData();
    } else {
      setError(res.message);
    }
  };

  const handleDeleteSlot = async (id) => {
    await api.post(`/academic/timetables/${id}`, {}, token);
    fetchTimetableData();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Calendar size={22} color="var(--primary)" />
          <div>
            <h3 style={{ fontSize: '1.125rem' }}>Weekly Academic Schedule & Timetable</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Conflict detection engine active</span>
          </div>
        </div>

        {(user?.role === 'Admin' || user?.role === 'Teacher') && (
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} /> Schedule Period Slot
          </button>
        )}
      </div>

      {/* Timetable Grid View */}
      <div className="glass-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        <table className="data-table" style={{ border: '1px solid var(--border-color)' }}>
          <thead>
            <tr>
              <th style={{ width: '120px' }}>Period</th>
              {days.map((d) => (
                <th key={d} style={{ textAlign: 'center' }}>{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periods.map((p) => (
              <tr key={p}>
                <td style={{ fontWeight: '700', backgroundColor: 'var(--border-light)' }}>
                  Period {p}
                </td>
                {days.map((d) => {
                  const slot = timetables.find((t) => t.day === d && parseInt(t.period) === p);
                  return (
                    <td key={d} style={{ height: '90px', verticalAlign: 'top', padding: '0.5rem', border: '1px solid var(--border-color)' }}>
                      {slot ? (
                        <div style={{
                          padding: '0.5rem',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(99, 102, 241, 0.12)',
                          borderLeft: '3px solid var(--primary)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.25rem'
                        }}>
                          <div style={{ fontWeight: '700', color: 'var(--primary-text)', fontSize: '0.8125rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span>{slot.subjectCode}</span>
                            {user?.role === 'Admin' && (
                              <button onClick={() => handleDeleteSlot(slot.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--accent-rose)' }}>
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: '500' }}>{slot.room}</span>
                          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>{slot.teacherName}</span>
                        </div>
                      ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)', fontSize: '0.75rem' }}>
                          Free Slot
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Slot Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule Period Slot">
        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <form onSubmit={handleAddSlot}>
          <div className="form-group">
            <label className="form-label">Subject</label>
            <select className="form-select" value={form.subjectId} onChange={handleSubjectChange}>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.code} - {s.title}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Day of Week</label>
              <select className="form-select" value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}>
                {days.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Period (1 - 4)</label>
              <input type="number" min="1" max="4" className="form-input" value={form.period} onChange={(e) => setForm({ ...form, period: parseInt(e.target.value) })} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Room Location</label>
              <input type="text" className="form-input" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} />
            </div>

            <div className="form-group">
              <label className="form-label">Assigned Teacher</label>
              <input type="text" className="form-input" value={form.teacherName} onChange={(e) => setForm({ ...form, teacherName: e.target.value })} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Schedule Slot</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
