import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, 
  GraduationCap, 
  Award, 
  CalendarCheck, 
  Calendar, 
  BookOpen, 
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
import { ParentChildrenManager } from '../parent/ParentChildrenManager';
import { ParentAttendanceManager } from '../parent/ParentAttendanceManager';
import { ParentGradesManager } from '../parent/ParentGradesManager';
import { ParentAssignmentsManager } from '../parent/ParentAssignmentsManager';
import { ParentProfileManager } from '../parent/ParentProfileManager';
import { TimetableManager } from '../academic/TimetableManager';
import { UnifiedMessageCenter } from '../common/UnifiedMessageCenter';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const ParentDashboard = () => {
  const { user, token, currentPath, navigate } = useAuth();

  // Map browser URL to active sub-view
  const getTabFromPath = () => {
    if (currentPath === '/parent/children') return 'children';
    if (currentPath === '/parent/attendance') return 'attendance';
    if (currentPath === '/parent/grades') return 'grades';
    if (currentPath === '/parent/assignments') return 'assignments';
    if (currentPath === '/parent/schedule') return 'schedule';
    if (currentPath === '/parent/messages') return 'messages';
    if (currentPath === '/parent/profile') return 'profile';
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
      fetchParentDashboard();
    }
  }, [activeTab]);

  const fetchParentDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/parent/dashboard', token);
      if (res.success) {
        setDashboardData(res);
      }
    } catch (err) {
      console.error('Error fetching parent dashboard:', err);
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
    { id: 'overview', label: 'Child Overview', icon: Activity, path: '/parent/dashboard' },
    { id: 'children', label: 'My Children', icon: HeartHandshake, path: '/parent/children' },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck, path: '/parent/attendance' },
    { id: 'grades', label: 'Grades & Reports', icon: Award, path: '/parent/grades' },
    { id: 'assignments', label: 'Homework', icon: BookOpen, path: '/parent/assignments' },
    { id: 'schedule', label: 'Schedule', icon: Calendar, path: '/parent/schedule' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/parent/messages' },
    { id: 'profile', label: 'Profile', icon: User, path: '/parent/profile' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'children':
        return <ParentChildrenManager />;
      case 'attendance':
        return <ParentAttendanceManager />;
      case 'grades':
        return <ParentGradesManager />;
      case 'assignments':
        return <ParentAssignmentsManager />;
      case 'schedule':
        return <TimetableManager />;
      case 'messages':
        return <UnifiedMessageCenter apiBase="/parent" />;
      case 'profile':
        return <ParentProfileManager />;
      case 'overview':
      default:
        if (loading && !dashboardData) {
          return <LoadingSpinner text="Retrieving parent portal..." />;
        }

        const metrics = dashboardData?.metrics || {
          childrenCount: 1,
          recentGradesCount: 0,
          upcomingAssignmentsCount: 0,
          unreadMessagesCount: 0
        };

        const children = dashboardData?.children || [];
        const primaryChild = children[0];

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Parent Hero Banner */}
            <div className="glass-card" style={{
              padding: '2rem',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%)',
              borderLeft: '4px solid #f59e0b',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.5rem'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#fbbf24', letterSpacing: '0.08em' }}>
                  PARENT & GUARDIAN MONITORING PORTAL
                </span>
                <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff', marginTop: '0.25rem' }}>
                  Welcome, {user?.name}
                </h1>
                <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.35rem' }}>
                  Monitoring Dependents: <strong style={{ color: '#e2e8f0' }}>{children.map(c => c.name).join(', ') || 'Alex Morgan'}</strong> • Read-Only Security Mode Active
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  className="btn btn-primary"
                  onClick={() => handleNavClick('grades', '/parent/grades')}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <Award size={16} /> Child Grades
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => handleNavClick('attendance', '/parent/attendance')}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <CalendarCheck size={16} /> Attendance Log
                </button>
              </div>
            </div>

            {/* Metric KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: '500' }}>Linked Children</span>
                  <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                    <HeartHandshake size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.875rem', fontWeight: '800', color: '#ffffff' }}>
                  {metrics.childrenCount}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                  Enrolled student wards
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: '500' }}>Recorded Grades</span>
                  <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                    <Award size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.875rem', fontWeight: '800', color: '#ffffff' }}>
                  {metrics.recentGradesCount}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '0.25rem' }}>
                  Published exam & test reports
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: '500' }}>Active Assignments</span>
                  <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                    <BookOpen size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.875rem', fontWeight: '800', color: '#ffffff' }}>
                  {metrics.upcomingAssignmentsCount}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                  Coursework tasks assigned
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: '500' }}>Unread Inquiries</span>
                  <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>
                    <MessageSquare size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.875rem', fontWeight: '800', color: '#ffffff' }}>
                  {metrics.unreadMessagesCount}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                  Faculty & admin communications
                </div>
              </div>
            </div>

            {/* Quick Preview Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {/* Recent Grades Preview */}
              <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Award size={18} color="#f59e0b" /> Recent Child Assessment Scores
                  </h3>
                  <button 
                    onClick={() => handleNavClick('grades', '/parent/grades')}
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
                        borderLeft: '3px solid #f59e0b'
                      }}>
                        <div>
                          <div style={{ color: '#ffffff', fontWeight: '600', fontSize: '0.875rem' }}>
                            {grade.subjectCode || 'GEN-101'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                            Marks: {grade.marksObtained} / {grade.totalMarks || 100} ({grade.percentage}%)
                          </div>
                        </div>
                        <span style={{
                          fontSize: '0.8125rem',
                          fontWeight: '800',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(245, 158, 11, 0.15)',
                          color: '#fbbf24'
                        }}>
                          Grade: {grade.letterGrade || 'A'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                    No recent test scores recorded for your linked dependents.
                  </div>
                )}
              </div>

              {/* Child Homework Preview */}
              <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BookOpen size={18} color="#38bdf8" /> Upcoming Homework Tasks
                  </h3>
                  <button 
                    onClick={() => handleNavClick('assignments', '/parent/assignments')}
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
                        borderLeft: '3px solid #38bdf8'
                      }}>
                        <div>
                          <div style={{ color: '#ffffff', fontWeight: '600', fontSize: '0.875rem' }}>
                            {asn.title}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                            Due: {asn.dueDate || 'Open'} • Class: {asn.classId || 'Cohort'}
                          </div>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: '600' }}>
                          {asn.totalPoints || 100} pts
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                    No pending homework tasks assigned to your child's cohort.
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
      {/* Top Tab Bar */}
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
