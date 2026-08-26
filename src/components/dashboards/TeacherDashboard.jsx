import React, { useState } from 'react';
import { UserCheck, BookOpen, Users, CalendarCheck, Award, Calendar, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AttendanceManager } from '../academic/AttendanceManager';
import { AssignmentManager } from '../academic/AssignmentManager';
import { TimetableManager } from '../academic/TimetableManager';
import { ExamManager } from '../academic/ExamManager';
import { ResultManager } from '../academic/ResultManager';

export const TeacherDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Workload Overview', icon: Activity },
    { id: 'attendance', label: 'Class Attendance', icon: CalendarCheck },
    { id: 'assignments', label: 'Homework & Grading', icon: BookOpen },
    { id: 'timetable', label: 'My Teaching Schedule', icon: Calendar },
    { id: 'exams', label: 'Exams & Quizzes', icon: Award },
    { id: 'results', label: 'Student Results', icon: Award },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'attendance': return <AttendanceManager />;
      case 'assignments': return <AssignmentManager />;
      case 'timetable': return <TimetableManager />;
      case 'exams': return <ExamManager />;
      case 'results': return <ResultManager />;
      case 'overview':
      default:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Banner */}
            <div className="glass-card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(99, 102, 241, 0.1))', borderLeft: '4px solid var(--accent-cyan)' }}>
              <h2 style={{ fontSize: '1.25rem' }}>Welcome, {user?.name} (Faculty Portal)</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Department: {user?.department || 'Computer Science'} • Phase 3 Academic Operations Active
              </p>
            </div>

            {/* Quick Workload Action Grid */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Faculty Workload Shortcuts</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <button className="btn btn-secondary" onClick={() => setActiveTab('attendance')} style={{ padding: '1rem', justifyContent: 'flex-start' }}>
                  <CalendarCheck size={20} color="var(--accent-emerald)" /> Mark Today's Attendance
                </button>
                <button className="btn btn-secondary" onClick={() => setActiveTab('assignments')} style={{ padding: '1rem', justifyContent: 'flex-start' }}>
                  <BookOpen size={20} color="var(--primary)" /> Grade Homework Submissions
                </button>
                <button className="btn btn-secondary" onClick={() => setActiveTab('timetable')} style={{ padding: '1rem', justifyContent: 'flex-start' }}>
                  <Calendar size={20} color="var(--accent-cyan)" /> View Teaching Schedule
                </button>
                <button className="btn btn-secondary" onClick={() => setActiveTab('results')} style={{ padding: '1rem', justifyContent: 'flex-start' }}>
                  <Award size={20} color="var(--accent-amber)" /> Enter Student Marks
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
