import React from 'react';
import { UserCheck, BookOpen, Users, CalendarCheck, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const TeacherDashboard = () => {
  const { user } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Banner */}
      <div className="glass-card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(99, 102, 241, 0.1))', borderLeft: '4px solid var(--accent-cyan)' }}>
        <h2 style={{ fontSize: '1.25rem' }}>Welcome, {user?.name} (Faculty)</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Department: {user?.department || 'Computer Science'} • Teacher Dashboard Shell
        </p>
      </div>

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: '600' }}>Assigned Classes</span>
            <h3 style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}>3 Courses</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>Active Fall Term</span>
          </div>
          <BookOpen size={28} color="var(--accent-cyan)" />
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: '600' }}>Total Students Enrolled</span>
            <h3 style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}>109 Students</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>Rosters active</span>
          </div>
          <Users size={28} color="var(--accent-emerald)" />
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: '600' }}>Next Scheduled Lecture</span>
            <h3 style={{ fontSize: '1.25rem', marginTop: '0.25rem' }}>CS-401 Algorithms</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>14:00 • Hall B</span>
          </div>
          <Clock size={28} color="var(--accent-violet)" />
        </div>
      </div>
    </div>
  );
};
