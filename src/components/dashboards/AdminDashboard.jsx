import React, { useState, useEffect } from 'react';
import { 
  Building, 
  GraduationCap, 
  Users, 
  BookOpen, 
  Layers, 
  HeartHandshake, 
  Activity,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { SchoolProfileManager } from '../admin/SchoolProfileManager';
import { AcademicStructureManager } from '../admin/AcademicStructureManager';
import { StudentRecordsManager } from '../admin/StudentRecordsManager';
import { TeacherRecordsManager } from '../admin/TeacherRecordsManager';
import { ParentRecordsManager } from '../admin/ParentRecordsManager';

export const AdminDashboard = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [summary, setSummary] = useState({
    totalStudents: 2,
    totalTeachers: 1,
    totalParents: 1,
    totalClasses: 4,
    totalSubjects: 4,
    activeAcademicYear: 'AY 2025-2026',
    activeTerm: 'Fall Term 2026'
  });

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    const res = await api.get('/records/summary', token);
    if (res.success && res.summary) {
      setSummary(res.summary);
    }
  };

  const tabs = [
    { id: 'overview', label: 'System Overview', icon: Activity },
    { id: 'school', label: 'School Setup', icon: Building },
    { id: 'academic', label: 'Classes & Subjects', icon: Layers },
    { id: 'students', label: 'Student Records', icon: GraduationCap },
    { id: 'teachers', label: 'Faculty Records', icon: Users },
    { id: 'parents', label: 'Parent Records', icon: HeartHandshake },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'school': return <SchoolProfileManager />;
      case 'academic': return <AcademicStructureManager />;
      case 'students': return <StudentRecordsManager />;
      case 'teachers': return <TeacherRecordsManager />;
      case 'parents': return <ParentRecordsManager />;
      case 'overview':
      default:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* KPI Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Total Students</span>
                  <h3 style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}>{summary.totalStudents}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)' }}>Active Records</span>
                </div>
                <GraduationCap size={28} color="var(--primary)" />
              </div>

              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Total Faculty</span>
                  <h3 style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}>{summary.totalTeachers}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>Teachers</span>
                </div>
                <Users size={28} color="var(--accent-cyan)" />
              </div>

              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Total Parents</span>
                  <h3 style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}>{summary.totalParents}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-amber)' }}>Linked Guardians</span>
                </div>
                <HeartHandshake size={28} color="var(--accent-amber)" />
              </div>

              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Classes / Grades</span>
                  <h3 style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}>{summary.totalClasses}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-violet)' }}>Grades 9-12</span>
                </div>
                <Layers size={28} color="var(--accent-violet)" />
              </div>

              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Active Subjects</span>
                  <h3 style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}>{summary.totalSubjects}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>Catalog</span>
                </div>
                <BookOpen size={28} color="var(--primary)" />
              </div>

              <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>Active Term</span>
                  <h3 style={{ fontSize: '1.1rem', marginTop: '0.25rem', color: 'var(--accent-emerald)' }}>{summary.activeTerm}</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{summary.activeAcademicYear}</span>
                </div>
                <Calendar size={28} color="var(--accent-emerald)" />
              </div>
            </div>

            {/* Quick Record Management Nav Shortcuts */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Phase 2 Record Management Modules</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <button className="btn btn-secondary" onClick={() => setActiveTab('school')} style={{ padding: '1rem', justifyContent: 'flex-start' }}>
                  <Building size={20} color="var(--primary)" /> School Profile & Term Setup
                </button>
                <button className="btn btn-secondary" onClick={() => setActiveTab('academic')} style={{ padding: '1rem', justifyContent: 'flex-start' }}>
                  <Layers size={20} color="var(--accent-cyan)" /> Manage Classes & Subjects
                </button>
                <button className="btn btn-secondary" onClick={() => setActiveTab('students')} style={{ padding: '1rem', justifyContent: 'flex-start' }}>
                  <GraduationCap size={20} color="var(--accent-emerald)" /> Manage Student Records
                </button>
                <button className="btn btn-secondary" onClick={() => setActiveTab('teachers')} style={{ padding: '1rem', justifyContent: 'flex-start' }}>
                  <Users size={20} color="var(--accent-amber)" /> Manage Faculty Records
                </button>
                <button className="btn btn-secondary" onClick={() => setActiveTab('parents')} style={{ padding: '1rem', justifyContent: 'flex-start' }}>
                  <HeartHandshake size={20} color="var(--accent-violet)" /> Manage Parent Records
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Sub Navigation Bar */}
      <div className="glass-card" style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.8125rem', padding: '0.5rem 1rem', whiteSpace: 'nowrap' }}
            >
              <Icon size={16} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Tab Content */}
      {renderTabContent()}
    </div>
  );
};
