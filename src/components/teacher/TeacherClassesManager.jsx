import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Calendar, Award, Eye, Search, Layers, Clock } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { Alert } from '../common/Alert';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const TeacherClassesManager = () => {
  const { token } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Class Roster Modal
  const [selectedClass, setSelectedClass] = useState(null);
  const [isRosterOpen, setIsRosterOpen] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/teacher/classes', token);
      if (res.success && res.classes) {
        setClasses(res.classes);
      } else {
        setError(res.message || 'Failed to load assigned classes.');
      }
    } catch (err) {
      setError('An error occurred retrieving faculty class records.');
    } finally {
      setLoading(false);
    }
  };

  const filteredClasses = classes.filter(c => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (c.title && c.title.toLowerCase().includes(q)) ||
      (c.code && c.code.toLowerCase().includes(q)) ||
      (c.id && c.id.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="glass-card" style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <BookOpen size={24} color="#22d3ee" /> Faculty Teaching Assignments & Classes
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Institutional academic cohorts and student groups assigned to your instructional schedule.
          </p>
        </div>

        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.25rem' }}
            placeholder="Search classes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {loading ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <LoadingSpinner text="Loading assigned classes..." />
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
          <Layers size={40} style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
          <div style={{ fontWeight: '600', color: '#ffffff' }}>No Assigned Classes Found</div>
          <p style={{ fontSize: '0.8125rem', marginTop: '0.25rem' }}>You have not been assigned teaching cohorts for this academic period.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filteredClasses.map((cls) => (
            <div key={cls.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#22d3ee', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {cls.code || cls.id}
                  </span>
                  <h3 style={{ fontSize: '1.1rem', color: '#ffffff', fontWeight: '700', marginTop: '0.25rem' }}>
                    {cls.title}
                  </h3>
                </div>
                <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
                  Level {cls.level || 'Senior'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', padding: '0.75rem', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>Active Enrollment</span>
                  <div style={{ fontSize: '1rem', fontWeight: '700', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.125rem' }}>
                    <Users size={16} color="#38bdf8" /> {cls.studentCount || (cls.students?.length || 0)} Students
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>Subjects Assigned</span>
                  <div style={{ fontSize: '1rem', fontWeight: '700', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.125rem' }}>
                    <BookOpen size={16} color="#10b981" /> {cls.subjects?.length || 2} Subjects
                  </div>
                </div>
              </div>

              <button
                onClick={() => { setSelectedClass(cls); setIsRosterOpen(true); }}
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'center', gap: '0.5rem', marginTop: 'auto' }}
              >
                <Eye size={16} /> View Enrolled Student Roster
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Class Roster Modal */}
      <Modal
        isOpen={isRosterOpen}
        onClose={() => setIsRosterOpen(false)}
        title={selectedClass ? `Roster: ${selectedClass.title} (${selectedClass.studentCount || selectedClass.students?.length || 0} Students)` : 'Class Roster'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '60vh', overflowY: 'auto' }}>
          {!selectedClass?.students || selectedClass.students.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
              No students are currently enrolled in this cohort.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.5rem' }}>Student ID</th>
                  <th style={{ padding: '0.5rem' }}>Full Name</th>
                  <th style={{ padding: '0.5rem' }}>Email</th>
                  <th style={{ padding: '0.5rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {selectedClass.students.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.75rem 0.5rem', fontFamily: 'monospace', color: 'var(--primary)', fontWeight: '600' }}>
                      {s.studentId || s.admissionNo || s.id}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: '600', color: '#f8fafc' }}>
                      {s.name}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem', color: '#94a3b8' }}>
                      {s.email}
                    </td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span className="badge badge-success">Active</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Modal>
    </div>
  );
};
