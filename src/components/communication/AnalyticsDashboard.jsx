import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, CheckCircle2, Award, Users, BookOpen } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const AnalyticsDashboard = () => {
  const { token } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    const res = await api.get('/communication/analytics', token);
    if (res.success) setData(res.analytics);
  };

  if (!data) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <BarChart3 size={24} color="var(--primary)" />
        <div>
          <h3 style={{ fontSize: '1.125rem' }}>Institutional Analytics & Operational Insights</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real-time performance metrics and pass rates</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: '600' }}>Overall Exam Pass Rate</span>
          <h3 style={{ fontSize: '1.75rem', marginTop: '0.25rem', color: 'var(--accent-emerald)' }}>{data.overallPassRate}%</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>High Academic Standing</span>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: '600' }}>Overall Attendance Rate</span>
          <h3 style={{ fontSize: '1.75rem', marginTop: '0.25rem', color: 'var(--accent-cyan)' }}>{data.overallAttendanceRate}%</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Daily Average</span>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: '600' }}>Total Active Enrolment</span>
          <h3 style={{ fontSize: '1.75rem', marginTop: '0.25rem' }}>{data.totalStudents} Students</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>{data.totalTeachers} Faculty Members</span>
        </div>
      </div>

      {/* Grade Distribution Bar Visualizer */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', marginBottom: '1.25rem' }}>Grade Distribution Summary</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {Object.entries(data.gradeDistribution).map(([letter, count]) => {
            const widthPct = Math.min((count / (data.totalStudents || 1)) * 100 + 20, 100);
            return (
              <div key={letter} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ width: '60px', fontWeight: '700', fontSize: '0.875rem' }}>Grade {letter}</span>
                <div style={{ flex: 1, height: '12px', backgroundColor: 'var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${widthPct}%`,
                    height: '100%',
                    backgroundColor: letter === 'A' ? 'var(--accent-emerald)' : letter === 'B' ? 'var(--primary)' : 'var(--accent-amber)',
                    borderRadius: '6px'
                  }} />
                </div>
                <span style={{ width: '40px', fontSize: '0.875rem', fontWeight: '600', textAlign: 'right' }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
