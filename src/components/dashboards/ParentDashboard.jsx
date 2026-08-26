import React, { useState } from 'react';
import { HeartHandshake, GraduationCap, Award, CalendarCheck, Calendar, BookOpen, Activity, Bell, Printer } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AttendanceManager } from '../academic/AttendanceManager';
import { AssignmentManager } from '../academic/AssignmentManager';
import { TimetableManager } from '../academic/TimetableManager';
import { ExamManager } from '../academic/ExamManager';
import { ResultManager } from '../academic/ResultManager';
import { AnnouncementManager } from '../communication/AnnouncementManager';
import { NotificationCenter } from '../communication/NotificationCenter';
import { ReportGenerator } from '../communication/ReportGenerator';

export const ParentDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Child Overview', icon: Activity },
    { id: 'notices', label: 'School Notices', icon: Bell },
    { id: 'notifications', label: 'Parent Alerts', icon: Bell },
    { id: 'report-card', label: 'Child Report Card', icon: Printer },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'results', label: 'Exam Results', icon: Award },
    { id: 'assignments', label: 'Homework', icon: BookOpen },
    { id: 'timetable', label: 'Schedule', icon: Calendar },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'notices': return <AnnouncementManager />;
      case 'notifications': return <NotificationCenter />;
      case 'report-card': return <ReportGenerator />;
      case 'attendance': return <AttendanceManager />;
      case 'results': return <ResultManager />;
      case 'assignments': return <AssignmentManager />;
      case 'timetable': return <TimetableManager />;
      case 'overview':
      default:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Banner */}
            <div className="glass-card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(99, 102, 241, 0.1))', borderLeft: '4px solid var(--accent-amber)' }}>
              <h2 style={{ fontSize: '1.25rem' }}>Welcome, {user?.name} (Parent Monitoring Portal)</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Monitoring linked student: <strong>Alex Morgan (Senior - Computer Science)</strong>
              </p>
            </div>

            {/* Quick Monitoring Navigation Cards */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Child Monitoring & Communication</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <button className="btn btn-secondary" onClick={() => setActiveTab('report-card')} style={{ padding: '1rem', justifyContent: 'flex-start' }}>
                  <Printer size={20} color="var(--accent-emerald)" /> Print Official Child Report Card
                </button>
                <button className="btn btn-secondary" onClick={() => setActiveTab('notices')} style={{ padding: '1rem', justifyContent: 'flex-start' }}>
                  <Bell size={20} color="var(--primary)" /> View School Announcements
                </button>
                <button className="btn btn-secondary" onClick={() => setActiveTab('attendance')} style={{ padding: '1rem', justifyContent: 'flex-start' }}>
                  <CalendarCheck size={20} color="var(--accent-cyan)" /> Inspect Attendance Register
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-card" style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.8125rem', padding: '0.5rem 0.875rem' }}
            >
              <Icon size={15} /> {tab.label}
            </button>
          );
        })}
      </div>
      {renderContent()}
    </div>
  );
};
