import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Award, 
  BookOpen, 
  CalendarCheck, 
  Calendar, 
  Activity, 
  MessageSquare, 
  User, 
  Clock, 
  CheckCircle, 
  TrendingUp, 
  ArrowRight,
  Printer
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { StudentCoursesManager } from '../student/StudentCoursesManager';
import { StudentAssignmentsManager } from '../student/StudentAssignmentsManager';
import { StudentGradesManager } from '../student/StudentGradesManager';
import { StudentAttendanceManager } from '../student/StudentAttendanceManager';
import { StudentProfileManager } from '../student/StudentProfileManager';
import { TimetableManager } from '../academic/TimetableManager';
import { UnifiedMessageCenter } from '../common/UnifiedMessageCenter';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const StudentDashboard = () => {
  const { user, token, currentPath, navigate } = useAuth();

  // Map browser URL to active sub-view
  const getTabFromPath = () => {
    if (currentPath === '/student/courses') return 'courses';
    if (currentPath === '/student/assignments') return 'assignments';
    if (currentPath === '/student/grades') return 'grades';
    if (currentPath === '/student/attendance') return 'attendance';
    if (currentPath === '/student/schedule') return 'schedule';
    if (currentPath === '/student/messages') return 'messages';
    if (currentPath === '/student/profile') return 'profile';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath());
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [currentPath]);

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchStudentDashboard();
    }
  }, [activeTab]);

  const fetchStudentDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/student/dashboard', token);
      if (res.success) {
        setDashboardData(res);
      }
    } catch (err) {
      console.error('Error fetching student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNavClick = (tabId, path) => {
    setActiveTab(tabId);
    if (path) {
      navigate(path);
    }
  };

  const navButtons = [
    { id: 'overview', label: 'Student Overview', icon: Activity, path: '/student/dashboard' },
    { id: 'courses', label: 'My Courses', icon: BookOpen, path: '/student/courses' },
    { id: 'assignments', label: 'Assignments', icon: BookOpen, path: '/student/assignments' },
    { id: 'grades', label: 'Grades & GPA', icon: Award, path: '/student/grades' },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck, path: '/student/attendance' },
    { id: 'schedule', label: 'Schedule', icon: Calendar, path: '/student/schedule' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/student/messages' },
    { id: 'profile', label: 'Profile', icon: User, path: '/student/profile' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'courses':
        return <StudentCoursesManager />;
      case 'assignments':
        return <StudentAssignmentsManager />;
      case 'grades':
        return <StudentGradesManager />;
      case 'attendance':
        return <StudentAttendanceManager />;
      case 'schedule':
        return <TimetableManager />;
      case 'messages':
        return <UnifiedMessageCenter apiBase="/student" />;
      case 'profile':
        return <StudentProfileManager />;
      case 'overview':
      default:
        if (loading && !dashboardData) {
          return <LoadingSpinner text="Retrieving student portal..." />;
        }

        const metrics = dashboardData?.metrics || {
          coursesCount: 4,
          attendancePercentage: 100,
          assignmentsCount: 0,
          averageGrade: 'N/A'
        };

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Student Hero Banner */}
            <div className="glass-card" style={{
              padding: '2rem',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 182, 212, 0.12) 100%)',
              borderLeft: '4px solid #10b981',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.5rem'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#10b981', letterSpacing: '0.08em' }}>
                  STUDENT LEARNING PORTAL
                </span>
                <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff', marginTop: '0.25rem' }}>
                  Welcome, {user?.name}
                </h1>
                <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.35rem' }}>
                  Student ID: <strong style={{ color: '#e2e8f0', fontFamily: 'monospace' }}>{dashboardData?.student?.studentId || user?.studentId || 'STU-1001'}</strong> • Class: <strong style={{ color: '#e2e8f0' }}>{dashboardData?.student?.classId || 'Class 12'}</strong>
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  className="btn btn-primary"
                  onClick={() => handleNavClick('assignments', '/student/assignments')}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <BookOpen size={16} /> View Homework
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => handleNavClick('grades', '/student/grades')}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Award size={16} /> View Grades
                </button>
              </div>
            </div>

            {/* Metric KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: '500' }}>Enrolled Courses</span>
                  <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                    <BookOpen size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.875rem', fontWeight: '800', color: '#ffffff' }}>
                  {metrics.coursesCount}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                  Active subjects this semester
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: '500' }}>Attendance Rate</span>
                  <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                    <CalendarCheck size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.875rem', fontWeight: '800', color: '#ffffff' }}>
                  {metrics.attendancePercentage}%
                </div>
                <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginTop: '0.25rem' }}>
                  Institutional roll-call compliance
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: '500' }}>Pending Homework</span>
                  <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                    <Clock size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.875rem', fontWeight: '800', color: '#ffffff' }}>
                  {metrics.assignmentsCount}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                  Published tasks for your class
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: '500' }}>Overall Average</span>
                  <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
                    <TrendingUp size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.875rem', fontWeight: '800', color: '#ffffff' }}>
                  {metrics.averageGrade}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                  Recorded exam average
                </div>
              </div>
            </div>

            {/* Quick Preview Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {/* Upcoming Assignments */}
              <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BookOpen size={18} color="#10b981" /> Course Assignments
                  </h3>
                  <button 
                    onClick={() => handleNavClick('assignments', '/student/assignments')}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                  >
                    View All
                  </button>
                </div>

                {dashboardData?.upcomingAssignments && dashboardData.upcomingAssignments.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {dashboardData.upcomingAssignments.slice(0, 4).map((asn) => (
                      <div key={asn.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem 1rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '8px',
                        borderLeft: '3px solid #10b981'
                      }}>
                        <div>
                          <div style={{ color: '#ffffff', fontWeight: '600', fontSize: '0.875rem' }}>
                            {asn.title}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                            Due: {asn.dueDate || 'Soon'} • Points: {asn.totalPoints || 100}
                          </div>
                        </div>
                        <button
                          onClick={() => handleNavClick('assignments', '/student/assignments')}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                        >
                          Submit
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                    No pending homework assignments found.
                  </div>
                )}
              </div>

              {/* Recent Examination Results */}
              <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Award size={18} color="#fbbf24" /> Recent Exam Marks
                  </h3>
                  <button 
                    onClick={() => handleNavClick('grades', '/student/grades')}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                  >
                    View Report Card
                  </button>
                </div>

                {dashboardData?.recentGrades && dashboardData.recentGrades.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {dashboardData.recentGrades.slice(0, 4).map((grade, idx) => (
                      <div key={idx} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem 1rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '8px',
                        borderLeft: '3px solid #fbbf24'
                      }}>
                        <div>
                          <div style={{ color: '#ffffff', fontWeight: '600', fontSize: '0.875rem' }}>
                            {grade.subjectCode || 'GEN-101'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                            Marks: {grade.marksObtained} / {grade.totalMarks || 100}
                          </div>
                        </div>
                        <span style={{
                          fontSize: '0.8125rem',
                          fontWeight: '800',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(251, 191, 36, 0.15)',
                          color: '#fbbf24'
                        }}>
                          {grade.letterGrade || 'A'} ({grade.percentage}%)
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                    No recent test scores recorded yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Navigation Tab Bar */}
      <div className="glass-card" style={{ padding: '0.5rem 0.75rem', display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
        {navButtons.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleNavClick(tab.id, tab.path)}
              className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.8125rem', padding: '0.5rem 0.875rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
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
