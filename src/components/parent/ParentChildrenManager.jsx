import React, { useState, useEffect } from 'react';
import { HeartHandshake, GraduationCap, Award, CalendarCheck, User, Mail, Hash, Building, ExternalLink } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { Alert } from '../common/Alert';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const ParentChildrenManager = ({ onSelectChild }) => {
  const { token, navigate } = useAuth();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedChild, setSelectedChild] = useState(null);

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/parent/children', token);
      if (res.success && res.children) {
        setChildren(res.children);
      } else {
        setError(res.message || 'Failed to retrieve linked children profiles.');
      }
    } catch (err) {
      setError('An error occurred retrieving child records.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving student ward profiles..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="glass-card" style={{ padding: '1.5rem 2rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <HeartHandshake size={24} color="#f59e0b" /> Verified Children & Student Wards
        </h2>
        <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '0.25rem' }}>
          Academic profiles, enrollment records, and performance summaries of your linked dependents.
        </p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {children.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
          <GraduationCap size={48} style={{ opacity: 0.3, margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.125rem', color: '#ffffff', marginBottom: '0.5rem' }}>No Children Linked</h3>
          <p style={{ fontSize: '0.875rem' }}>Your guardian account has no verified student dependents linked by the administration.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {children.map((child) => {
            const attStats = child.attendanceStats || { percentage: 100, present: 0, absent: 0 };
            const grades = child.grades || [];
            const avgScore = grades.length > 0
              ? (grades.reduce((acc, g) => acc + (Number(g.percentage) || 0), 0) / grades.length).toFixed(0)
              : 'N/A';

            return (
              <div key={child.id} className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', borderLeft: '4px solid #f59e0b' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(245, 158, 11, 0.15)',
                    border: '2px solid rgba(245, 158, 11, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fbbf24',
                    fontWeight: 'bold',
                    fontSize: '1.35rem'
                  }}>
                    {(child.name || 'C')[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.125rem', color: '#ffffff', fontWeight: '700' }}>{child.name}</h3>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                      ID: <strong style={{ color: '#e2e8f0', fontFamily: 'monospace' }}>{child.studentId || child.admissionNo || child.id}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div style={{ padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Enrolled Cohort</span>
                    <strong style={{ color: '#ffffff', fontSize: '0.875rem' }}>{child.classId || 'Class 12'}</strong>
                  </div>
                  <div style={{ padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Attendance</span>
                    <strong style={{ color: '#34d399', fontSize: '0.875rem' }}>{attStats.percentage}% Rate</strong>
                  </div>
                  <div style={{ padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Average Grade</span>
                    <strong style={{ color: '#38bdf8', fontSize: '0.875rem' }}>{avgScore}%</strong>
                  </div>
                  <div style={{ padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Status</span>
                    <strong style={{ color: '#34d399', fontSize: '0.875rem' }}>Active Scholar</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      if (onSelectChild) onSelectChild(child.id);
                      navigate('/parent/attendance');
                    }}
                    style={{ flex: 1, fontSize: '0.75rem', justifyContent: 'center', padding: '0.45rem' }}
                  >
                    <CalendarCheck size={14} /> Attendance
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => {
                      if (onSelectChild) onSelectChild(child.id);
                      navigate('/parent/grades');
                    }}
                    style={{ flex: 1, fontSize: '0.75rem', justifyContent: 'center', padding: '0.45rem' }}
                  >
                    <Award size={14} /> Report Card
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => setSelectedChild(child)}
                    style={{ fontSize: '0.75rem', padding: '0.45rem 0.75rem' }}
                  >
                    Dossier
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Child Dossier Modal */}
      {selectedChild && (
        <Modal
          isOpen={!!selectedChild}
          onClose={() => setSelectedChild(null)}
          title={`Student Ward Dossier: ${selectedChild.name}`}
          maxWidth="600px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fbbf24',
                fontWeight: 'bold',
                fontSize: '1.5rem'
              }}>
                {(selectedChild.name || 'C')[0].toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '1.125rem', fontWeight: '700', color: '#ffffff' }}>{selectedChild.name}</div>
                <div style={{ fontSize: '0.8125rem', color: '#fbbf24' }}>
                  Student ID: {selectedChild.studentId || selectedChild.admissionNo || selectedChild.id}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Class Cohort</span>
                <strong style={{ color: '#ffffff' }}>{selectedChild.classId || 'Class 12'}</strong>
              </div>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Contact Email</span>
                <strong style={{ color: '#ffffff' }}>{selectedChild.email || 'student@educore.edu'}</strong>
              </div>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Attendance Standing</span>
                <strong style={{ color: '#34d399' }}>{selectedChild.attendanceStats?.percentage || 100}% Recorded</strong>
              </div>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Recorded Assessments</span>
                <strong style={{ color: '#38bdf8' }}>{selectedChild.grades?.length || 0} Exams</strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedChild(null)}>
                Close Dossier
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
