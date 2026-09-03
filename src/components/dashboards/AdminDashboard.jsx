import React, { useState, useEffect } from 'react';
import { 
  Building, 
  GraduationCap, 
  Users, 
  BookOpen, 
  Layers, 
  HeartHandshake, 
  Activity,
  Calendar,
  CalendarCheck,
  Award,
  Bell,
  Printer,
  BarChart3
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { SchoolSettingsManager } from '../admin/SchoolSettingsManager';
import { AcademicStructureManager } from '../admin/AcademicStructureManager';
import { StudentRecordsManager } from '../admin/StudentRecordsManager';
import { TeacherRecordsManager } from '../admin/TeacherRecordsManager';
import { ParentRecordsManager } from '../admin/ParentRecordsManager';
import { TimetableManager } from '../academic/TimetableManager';
import { AttendanceManager } from '../academic/AttendanceManager';
import { AssignmentManager } from '../academic/AssignmentManager';
import { ExamManager } from '../academic/ExamManager';
import { ResultManager } from '../academic/ResultManager';
import { AnnouncementManager } from '../communication/AnnouncementManager';
import { NotificationCenter } from '../communication/NotificationCenter';
import { ReportGenerator } from '../communication/ReportGenerator';
import { AnalyticsDashboard } from '../communication/AnalyticsDashboard';
import { AdminUserManagement } from '../admin/AdminUserManagement';
import { ShieldAlert, UserCheck, Clock, CheckCircle2, ShieldCheck } from 'lucide-react';

export const AdminDashboard = () => {
  const { user, token, currentPath, navigate } = useAuth();
  
  // Synchronize internal tab state with browser URL
  const getTabFromPath = () => {
    if (currentPath === '/admin/users') return 'users';
    if (currentPath === '/admin/teachers') return 'teachers';
    if (currentPath === '/admin/students') return 'students';
    if (currentPath === '/admin/parents') return 'parents';
    if (currentPath === '/admin/settings') return 'school';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath());
  const [summary, setSummary] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalParents: 0,
    totalClasses: 0,
    totalSubjects: 0,
    activeAcademicYear: '',
    activeTerm: ''
  });
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalTeachers: 0,
    totalStudents: 0,
    totalParents: 0,
    activeAccounts: 0,
    inactiveAccounts: 0,
    recentCreations: [],
    recentLogins: [],
    recentAuthLogs: []
  });

  useEffect(() => {
    setActiveTab(getTabFromPath());
  }, [currentPath]);

  useEffect(() => {
    fetchSummary();
    fetchAdminMetrics();
  }, [activeTab]);

  const fetchSummary = async () => {
    const res = await api.get('/records/summary', token);
    if (res.success && res.summary) {
      setSummary(res.summary);
    }
  };

  const fetchAdminMetrics = async () => {
    const res = await api.get('/admin/metrics', token);
    if (res.success && res.metrics) {
      setMetrics(res.metrics);
    }
  };

  const handleTabClick = (tabId, tabPath) => {
    setActiveTab(tabId);
    if (tabPath) {
      navigate(tabPath);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: Activity, path: '/admin/dashboard' },
    { id: 'users', label: 'Users & Accounts', icon: ShieldCheck, path: '/admin/users' },
    { id: 'teachers', label: 'Teachers', icon: UserCheck, path: '/admin/teachers' },
    { id: 'students', label: 'Students', icon: GraduationCap, path: '/admin/students' },
    { id: 'parents', label: 'Parents/Guardians', icon: HeartHandshake, path: '/admin/parents' },
    { id: 'school', label: 'School Settings', icon: Building, path: '/admin/settings' },
    { id: 'academic', label: 'Classes & Subjects', icon: Layers },
    { id: 'timetable', label: 'Timetable', icon: Calendar },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'assignments', label: 'Assignments', icon: BookOpen },
    { id: 'exams', label: 'Exams', icon: Award },
    { id: 'results', label: 'Results', icon: Award },
    { id: 'notices', label: 'Notices', icon: Bell },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'reports', label: 'Reports', icon: Printer },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users': return <AdminUserManagement />;
      case 'notices': return <AnnouncementManager />;
      case 'notifications': return <NotificationCenter />;
      case 'reports': return <ReportGenerator />;
      case 'analytics': return <AnalyticsDashboard />;
      case 'school': return <SchoolSettingsManager />;
      case 'academic': return <AcademicStructureManager />;
      case 'students': return <StudentRecordsManager />;
      case 'teachers': return <TeacherRecordsManager />;
      case 'parents': return <ParentRecordsManager />;
      case 'timetable': return <TimetableManager />;
      case 'attendance': return <AttendanceManager />;
      case 'assignments': return <AssignmentManager />;
      case 'exams': return <ExamManager />;
      case 'results': return <ResultManager />;
      case 'overview':
      default:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Top Stat KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Total System Users</span>
                  <h3 style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}>{metrics.totalUsers}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>Admin Managed</span>
                </div>
                <Users size={28} color="var(--primary)" />
              </div>

              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Active Accounts</span>
                  <h3 style={{ fontSize: '1.5rem', marginTop: '0.25rem', color: 'var(--accent-emerald)' }}>{metrics.activeAccounts}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{metrics.inactiveAccounts} inactive</span>
                </div>
                <CheckCircle2 size={28} color="var(--accent-emerald)" />
              </div>

              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Total Faculty</span>
                  <h3 style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}>{metrics.totalTeachers}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>Teachers</span>
                </div>
                <UserCheck size={28} color="var(--accent-cyan)" />
              </div>

              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Total Students</span>
                  <h3 style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}>{metrics.totalStudents}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>Enrolled</span>
                </div>
                <GraduationCap size={28} color="var(--accent-emerald)" />
              </div>

              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Total Parents</span>
                  <h3 style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}>{metrics.totalParents}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-amber)' }}>Guardians</span>
                </div>
                <HeartHandshake size={28} color="var(--accent-amber)" />
              </div>
            </div>

            {/* Live Security & Activity Grids */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {/* Recent Account Creation */}
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={18} color="var(--primary)" /> Recent Account Provisions
                  </h3>
                  <button 
                    onClick={() => handleTabClick('users', '/admin/users')} 
                    className="btn btn-secondary" 
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', fontWeight: '600' }}
                  >
                    View & Manage All
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {metrics.recentCreations?.length > 0 ? (
                    metrics.recentCreations.map((acc) => (
                      <div key={acc.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '0.875rem', color: '#ffffff' }}>{acc.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{acc.username} • <strong style={{ color: '#818cf8' }}>{acc.role}</strong></div>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {acc.created_at ? new Date(acc.created_at).toLocaleDateString() : 'Baseline'}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No recent account creations logged.</div>
                  )}
                </div>
              </div>

              {/* Recent Authentication Activity Audit Log */}
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Clock size={18} color="var(--accent-emerald)" /> Recent Authentication Activity
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: '600' }}>Live Audit Log</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {metrics.recentAuthLogs?.length > 0 ? (
                    metrics.recentAuthLogs.map((log) => {
                      const isSuccess = log.status === 'SUCCESS';
                      return (
                        <div key={log.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}>
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '0.875rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span>{log.name || log.username}</span>
                              <span style={{
                                padding: '0.1rem 0.4rem',
                                borderRadius: '4px',
                                fontSize: '0.65rem',
                                fontWeight: '700',
                                backgroundColor: isSuccess ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                color: isSuccess ? '#34d399' : '#f87171'
                              }}>
                                {log.type.replace('_', ' ')}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              @{log.username} • {log.role} {log.ip && `• IP: ${log.ip}`}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right', fontSize: '0.75rem', color: isSuccess ? 'var(--accent-emerald)' : '#f87171' }}>
                            {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                              {log.timestamp ? new Date(log.timestamp).toLocaleDateString() : ''}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No authentication events recorded yet.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Fast Management Actions */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Quick Operational Modules</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <button className="btn btn-secondary" onClick={() => handleTabClick('users', '/admin/users')} style={{ padding: '1rem', justifyContent: 'flex-start' }}>
                  <Users size={20} color="var(--primary)" /> Manage User Accounts & Passwords
                </button>
                <button className="btn btn-secondary" onClick={() => handleTabClick('students', '/admin/students')} style={{ padding: '1rem', justifyContent: 'flex-start' }}>
                  <GraduationCap size={20} color="var(--accent-emerald)" /> Student Admissions & IDs
                </button>
                <button className="btn btn-secondary" onClick={() => handleTabClick('teachers', '/admin/teachers')} style={{ padding: '1rem', justifyContent: 'flex-start' }}>
                  <UserCheck size={20} color="var(--accent-cyan)" /> Faculty & Teacher Roster
                </button>
                <button className="btn btn-secondary" onClick={() => handleTabClick('school', '/admin/settings')} style={{ padding: '1rem', justifyContent: 'flex-start' }}>
                  <Building size={20} color="var(--accent-amber)" /> School & System Configuration
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Navigation Sub-header Tabs Synchronized with URL */}
      <div className="glass-card" style={{ padding: '0.5rem 0.75rem', display: 'flex', gap: '0.375rem', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id, tab.path)}
              className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.8125rem', padding: '0.45rem 0.875rem', whiteSpace: 'nowrap' }}
            >
              <Icon size={15} /> {tab.label}
            </button>
          );
        })}
      </div>

      {renderTabContent()}
    </div>
  );
};
