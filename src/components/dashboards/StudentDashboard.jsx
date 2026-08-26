import React from 'react';
import { GraduationCap, Award, BookOpen, CalendarCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const StudentDashboard = () => {
  const { user } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Banner */}
      <div className="glass-card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.1))', borderLeft: '4px solid var(--accent-emerald)' }}>
        <h2 style={{ fontSize: '1.25rem' }}>Welcome, {user?.name} (Student)</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          ID: {user?.id} • Year: {user?.grade || 'Senior'} • Department: {user?.department || 'Computer Science'}
        </p>
      </div>

      {/* KPI Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: '600' }}>Cumulative GPA</span>
            <h3 style={{ fontSize: '1.75rem', marginTop: '0.25rem', color: 'var(--accent-emerald)' }}>3.85 / 4.00</h3>
            <span className="badge badge-success" style={{ marginTop: '0.25rem' }}>Dean's List</span>
          </div>
          <Award size={32} color="var(--accent-emerald)" />
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: '600' }}>Enrolled Courses</span>
            <h3 style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}>5 Subjects</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>16 Credit Hours</span>
          </div>
          <BookOpen size={32} color="var(--primary)" />
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: '600' }}>Attendance Rate</span>
            <h3 style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}>96%</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>Optimal Standing</span>
          </div>
          <CalendarCheck size={32} color="var(--accent-cyan)" />
        </div>
      </div>
    </div>
  );
};
