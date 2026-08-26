import React from 'react';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  UserPlus
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Dashboard = () => {
  const { students, teachers, courses, attendance, setActiveTab } = useApp();

  const totalStudents = students.length;
  const avgGpa = (students.reduce((acc, curr) => acc + (curr.gpa || 0), 0) / (totalStudents || 1)).toFixed(2);
  const presentCount = attendance.filter(a => a.status === 'Present').length;
  const attendanceRate = Math.round((presentCount / (attendance.length || 1)) * 100);

  const stats = [
    { title: 'Total Enrolled Students', value: totalStudents, change: '+12% this term', icon: GraduationCap, color: 'var(--primary)' },
    { title: 'Faculty & Staff', value: teachers.length, change: '100% active', icon: Users, color: 'var(--accent-cyan)' },
    { title: 'Active Courses', value: courses.length, change: '6 Departments', icon: BookOpen, color: 'var(--accent-violet)' },
    { title: 'Average GPA', value: avgGpa, change: 'Top 5% percentile', icon: TrendingUp, color: 'var(--accent-emerald)' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Stat Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: '600' }}>{stat.title}</span>
                <h3 style={{ fontSize: '1.75rem', marginTop: '0.25rem', color: 'var(--text-main)' }}>{stat.value}</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.375rem' }}>
                  {stat.change}
                </span>
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: stat.color
              }}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Overview & Recent Activities */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Attendance Summary Widget */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.125rem' }}>Today's Attendance Overview</h3>
            <button className="btn btn-secondary" style={{ fontSize: '0.75rem' }} onClick={() => setActiveTab('attendance')}>
              View Register
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', margin: '1rem 0' }}>
            <div style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              background: `conic-gradient(var(--accent-emerald) ${attendanceRate * 3.6}deg, var(--border-color) 0deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              <div style={{
                width: '74px',
                height: '74px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-card)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '1.25rem', fontWeight: '800', lineHeight: '1' }}>{attendanceRate}%</span>
                <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)' }}>Present</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <CheckCircle2 size={14} color="var(--accent-emerald)" /> Present
                </span>
                <strong>{presentCount}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Clock size={14} color="var(--accent-amber)" /> Late
                </span>
                <strong>{attendance.filter(a => a.status === 'Late').length}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <AlertTriangle size={14} color="var(--accent-rose)" /> Absent
                </span>
                <strong>{attendance.filter(a => a.status === 'Absent').length}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '1.25rem' }}>Quick Actions</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button 
              className="btn btn-primary" 
              style={{ justifyContent: 'center', padding: '0.875rem' }}
              onClick={() => setActiveTab('students')}
            >
              <UserPlus size={16} /> Manage Students
            </button>
            <button 
              className="btn btn-secondary" 
              style={{ justifyContent: 'center', padding: '0.875rem' }}
              onClick={() => setActiveTab('attendance')}
            >
              <CheckCircle2 size={16} /> Take Attendance
            </button>
            <button 
              className="btn btn-secondary" 
              style={{ justifyContent: 'center', padding: '0.875rem' }}
              onClick={() => setActiveTab('grades')}
            >
              <TrendingUp size={16} /> View Gradebook
            </button>
            <button 
              className="btn btn-secondary" 
              style={{ justifyContent: 'center', padding: '0.875rem' }}
              onClick={() => setActiveTab('courses')}
            >
              <BookOpen size={16} /> Course Catalog
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
