import React from 'react';
import { HeartHandshake, GraduationCap, Award, CalendarCheck, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ParentDashboard = () => {
  const { user } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Banner */}
      <div className="glass-card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(99, 102, 241, 0.1))', borderLeft: '4px solid var(--accent-amber)' }}>
        <h2 style={{ fontSize: '1.25rem' }}>Welcome, {user?.name} (Parent Portal)</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Monitoring linked student: <strong>Alex Morgan (Senior - Computer Science)</strong>
        </p>
      </div>

      {/* Child Summary Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: '600' }}>Child's Current GPA</span>
            <h3 style={{ fontSize: '1.75rem', marginTop: '0.25rem', color: 'var(--accent-emerald)' }}>3.85</h3>
            <span className="badge badge-success">Top Standing</span>
          </div>
          <Award size={32} color="var(--accent-amber)" />
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: '600' }}>Term Attendance</span>
            <h3 style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}>96% Present</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>Regular</span>
          </div>
          <CalendarCheck size={32} color="var(--accent-cyan)" />
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: '600' }}>School Announcements</span>
            <h3 style={{ fontSize: '1.25rem', marginTop: '0.25rem' }}>2 New Notices</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Fall Parent Conference</span>
          </div>
          <Bell size={32} color="var(--primary)" />
        </div>
      </div>
    </div>
  );
};
