import React, { useState } from 'react';
import { GraduationCap, Award, BookOpen, CalendarCheck, Calendar, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { TimetableManager } from '../academic/TimetableManager';
import { AssignmentManager } from '../academic/AssignmentManager';
import { ExamManager } from '../academic/ExamManager';
import { ResultManager } from '../academic/ResultManager';
import { AttendanceManager } from '../academic/AttendanceManager';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Academic Overview', icon: Activity },
    { id: 'timetable', label: 'My Timetable', icon: Calendar },
    { id: 'assignments', label: 'My Homework', icon: BookOpen },
    { id: 'exams', label: 'Exams Schedule', icon: Award },
    { id: 'results', label: 'My Results & Grades', icon: Award },
    { id: 'attendance', label: 'My Attendance', icon: CalendarCheck },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'timetable': return <TimetableManager />;
      case 'assignments': return <AssignmentManager />;
      case 'exams': return <ExamManager />;
      case 'results': return <ResultManager />;
      case 'attendance': return <AttendanceManager />;
      case 'overview':
      default:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Banner */}
            <div className="glass-card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.1))', borderLeft: '4px solid var(--accent-emerald)' }}>
              <h2 style={{ fontSize: '1.25rem' }}>Welcome, {user?.name} (Student Portal)</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                ID: {user?.id} • Year: {user?.grade || 'Senior'} • Department: {user?.department || 'Computer Science'}
              </p>
            </div>

            {/* Quick Portal Navigation Cards */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Student Academic Modules</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <button className="btn btn-secondary" onClick={() => setActiveTab('timetable')} style={{ padding: '1rem', justifyContent: 'flex-start' }}>
                  <Calendar size={20} color="var(--primary)" /> View Class Schedule
                </button>
                <button className="btn btn-secondary" onClick={() => setActiveTab('assignments')} style={{ padding: '1rem', justifyContent: 'flex-start' }}>
                  <BookOpen size={20} color="var(--accent-cyan)" /> View Pending Homework
                </button>
                <button className="btn btn-secondary" onClick={() => setActiveTab('results')} style={{ padding: '1rem', justifyContent: 'flex-start' }}>
                  <Award size={20} color="var(--accent-emerald)" /> View Exam Report Card
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
