import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Users, 
  CalendarCheck, 
  Award, 
  Calendar, 
  Activity, 
  MessageSquare, 
  User, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { TeacherClassesManager } from '../teacher/TeacherClassesManager';
import { TeacherStudentsManager } from '../teacher/TeacherStudentsManager';
import { TeacherAttendanceManager } from '../teacher/TeacherAttendanceManager';
import { TeacherAssignmentsManager } from '../teacher/TeacherAssignmentsManager';
import { TeacherGradesManager } from '../teacher/TeacherGradesManager';
import { TeacherProfileManager } from '../teacher/TeacherProfileManager';
import { TimetableManager } from '../academic/TimetableManager';
import { UnifiedMessageCenter } from '../common/UnifiedMessageCenter';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const TeacherDashboard = () => {
  const { user, token, currentPath, navigate } = useAuth();

  // Map browser URL to active sub-view
  const getTabFromPath = () => {
    if (currentPath === '/teacher/classes') return 'classes';
    if (currentPath === '/teacher/students') return 'students';
    if (currentPath === '/teacher/attendance') return 'attendance';
    if (currentPath === '/teacher/assignments') return 'assignments';
    if (currentPath === '/teacher/grades') return 'grades';
    if (currentPath === '/teacher/schedule') return 'schedule';
    if (currentPath === '/teacher/messages') return 'messages';
    if (currentPath === '/teacher/profile') return 'profile';
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
      fetchTeacherDashboard();
    }
  }, [activeTab]);

  const fetchTeacherDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/teacher/dashboard', token);
      if (res.success) {
        setDashboardData(res);
      }
    } catch (err) {
      console.error('Error fetching teacher dashboard:', err);
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
    { id: 'overview', label: 'Faculty Overview', icon: Activity, path: '/teacher/dashboard' },
    { id: 'classes', label: 'My Classes', icon: BookOpen, path: '/teacher/classes' },
    { id: 'students', label: 'My Students', icon: Users, path: '/teacher/students' },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck, path: '/teacher/attendance' },
    { id: 'assignments', label: 'Assignments', icon: BookOpen, path: '/teacher/assignments' },
    { id: 'grades', label: 'Gradebook', icon: Award, path: '/teacher/grades' },
    { id: 'schedule', label: 'Schedule', icon: Calendar, path: '/teacher/schedule' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/teacher/messages' },
    { id: 'profile', label: 'Profile', icon: User, path: '/teacher/profile' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'classes':
        return <TeacherClassesManager />;
      case 'students':
        return <TeacherStudentsManager />;
      case 'attendance':
        return <TeacherAttendanceManager />;
      case 'assignments':
        return <TeacherAssignmentsManager />;
      case 'grades':
        return <TeacherGradesManager />;
      case 'schedule':
        return <TimetableManager />;
      case 'messages':
        return <UnifiedMessageCenter apiBase="/teacher" />;
      case 'profile':
        return <TeacherProfileManager />;
      case 'overview':
      default:
        if (loading && !dashboardData) {
          return <LoadingSpinner text="Retrieving faculty dashboard..." />;
        }

        const metrics = dashboardData?.metrics || {
          assignedClassesCount: 0,
          totalStudentsCount: 0,
          assignmentsCount: 0,
          scheduleSlotsToday: 0,
          unreadMessagesCount: 0
        };

        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Faculty Hero Banner */}
            <div className="glass-card" style={{
              padding: '2rem',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%)',
              borderLeft: '4px solid #38bdf8',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.5rem'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#38bdf8', letterSpacing: '0.08em' }}>
                  FACULTY ACADEMIC WORKSPACE
                </span>
                <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#ffffff', marginTop: '0.25rem' }}>
                  Welcome back, {user?.name}
                </h1>
                <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.35rem' }}>
                  Department: <strong style={{ color: '#e2e8f0' }}>{dashboardData?.teacher?.department || user?.department || 'Computer Science'}</strong> • Teaching Role Authenticated
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  className="btn btn-primary"
                  onClick={() => handleNavClick('attendance', '/teacher/attendance')}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <CalendarCheck size={16} /> Mark Attendance
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => handleNavClick('assignments', '/teacher/assignments')}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  <BookOpen size={16} /> New Assignment
                </button>
              </div>
            </div>

            {/* Metric Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: '500' }}>Assigned Classes</span>
                  <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                    <BookOpen size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.875rem', fontWeight: '800', color: '#ffffff' }}>
                  {metrics.assignedClassesCount}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                  Active cohorts under your instruction
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: '500' }}>Active Students</span>
                  <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                    <Users size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.875rem', fontWeight: '800', color: '#ffffff' }}>
                  {metrics.totalStudentsCount}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                  Enrolled across all assigned classes
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: '500' }}>Active Assignments</span>
                  <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                    <Award size={18} />
                  </div>
                </div>
                <div style={{ fontSize: '1.875rem', fontWeight: '800', color: '#ffffff' }}>
                  {metrics.assignmentsCount}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                  Published tasks and assessments
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
                  Student & parent communications
                </div>
              </div>
            </div>

            {/* Quick Action Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {/* Teaching Schedule Preview */}
              <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Calendar size={18} color="#38bdf8" /> Upcoming Faculty Schedule
                  </h3>
                  <button 
                    onClick={() => handleNavClick('schedule', '/teacher/schedule')}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                  >
                    View Timetable
                  </button>
                </div>

                {dashboardData?.todaySchedule && dashboardData.todaySchedule.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {dashboardData.todaySchedule.slice(0, 4).map((slot, idx) => (
                      <div key={idx} style={{
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
                            {slot.subjectName || slot.subjectCode || 'Class Session'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                            {slot.day} • {slot.timeSlot || '10:00 AM - 11:30 AM'}
                          </div>
                        </div>
                        <span style={{ fontSize: '0.75rem', backgroundColor: 'rgba(56, 189, 248, 0.1)', color: '#38bdf8', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                          {slot.room || 'Room 302'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                    No scheduled lecture slots for today.
                  </div>
                )}
              </div>

              {/* Recent Assigned Tasks */}
              <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BookOpen size={18} color="#34d399" /> Current Assignments
                  </h3>
                  <button 
                    onClick={() => handleNavClick('assignments', '/teacher/assignments')}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                  >
                    View All
                  </button>
                </div>

                {dashboardData?.recentAssignments && dashboardData.recentAssignments.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {dashboardData.recentAssignments.slice(0, 4).map((asn) => (
                      <div key={asn.id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.75rem 1rem',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '8px',
                        borderLeft: '3px solid #34d399'
                      }}>
                        <div>
                          <div style={{ color: '#ffffff', fontWeight: '600', fontSize: '0.875rem' }}>
                            {asn.title}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                            Due: {asn.dueDate || 'Open'} • Class: {asn.classId || 'Assigned Cohort'}
                          </div>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: '600' }}>
                          {asn.totalPoints || 100} pts
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                    No published homework assignments found.
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
      {/* Top Quick-Navigation Tab Bar */}
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
