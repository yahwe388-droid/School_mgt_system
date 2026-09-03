import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Clock, Award, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../common/Alert';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const ParentAssignmentsManager = () => {
  const { token } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/parent/assignments', token);
      if (res.success && res.assignments) {
        setAssignments(res.assignments);
      } else {
        setError(res.message || 'Failed to retrieve assignments.');
      }
    } catch (err) {
      setError('An error occurred retrieving child coursework.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving student assignments..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="glass-card" style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <BookOpen size={24} color="#f59e0b" /> Coursework & Homework Monitor
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Inspect upcoming homework due dates, instructions, and academic assignments for your child's class.
          </p>
        </div>

        <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
          Total Tasks: <strong style={{ color: '#ffffff' }}>{assignments.length}</strong>
        </span>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {assignments.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
          <BookOpen size={48} style={{ opacity: 0.3, margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.125rem', color: '#ffffff', marginBottom: '0.5rem' }}>No Active Assignments</h3>
          <p style={{ fontSize: '0.875rem' }}>Instructors have not assigned any active tasks for your child's cohort.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {assignments.map((asn) => (
            <div key={asn.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '4px solid #f59e0b' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#f59e0b', textTransform: 'uppercase' }}>
                    {asn.subjectCode || 'GEN-101'}
                  </span>
                  <h3 style={{ fontSize: '1.125rem', color: '#ffffff', fontWeight: '600', marginTop: '0.2rem' }}>
                    {asn.title}
                  </h3>
                </div>

                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  color: '#fbbf24',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}>
                  <Clock size={12} /> Class Cohort: {asn.classId || 'Enrolled'}
                </span>
              </div>

              <div style={{ fontSize: '0.8125rem', color: '#cbd5e1', lineHeight: '1.5', backgroundColor: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '6px' }}>
                {asn.instructions || 'No specific instructions provided.'}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem', color: '#94a3b8', marginTop: 'auto', paddingTop: '0.5rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Calendar size={14} /> Due Date: <strong style={{ color: '#e2e8f0' }}>{asn.dueDate || 'Open'}</strong>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Award size={14} /> Total Points: <strong style={{ color: '#e2e8f0' }}>{asn.totalPoints || 100} pts</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
