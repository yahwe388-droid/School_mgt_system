import React from 'react';
import { 
  LayoutDashboard, 
  GraduationCap, 
  Users, 
  BookOpen, 
  CalendarCheck, 
  Award, 
  Settings, 
  BookMarked 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Sidebar = () => {
  const { activeTab, setActiveTab, students } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Students', icon: GraduationCap, badge: students.length },
    { id: 'teachers', label: 'Faculty', icon: Users },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'grades', label: 'Gradebook', icon: Award },
  ];

  return (
    <aside style={{
      width: '260px',
      backgroundColor: 'var(--bg-sidebar)',
      color: 'var(--text-sidebar)',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem 1rem',
      flexShrink: 0,
      borderRight: '1px solid rgba(255,255,255,0.05)'
    }}>
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 0.5rem 2rem 0.5rem' }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
          border: '2px solid rgba(255,255,255,0.15)',
          overflow: 'hidden',
          flexShrink: 0
        }}>
          <img src="/logo.png" alt="EduCore Logo" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
        </div>
        <div>
          <h2 style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: '700', lineHeight: '1.2' }}>EduCore</h2>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '500' }}>Management System</span>
        </div>
      </div>

      {/* Main Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', flex: 1 }}>
        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', fontWeight: '700', padding: '0.5rem', marginBottom: '0.25rem' }}>
          Main Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 0.875rem',
                borderRadius: '8px',
                border: 'none',
                background: isActive ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.05))' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-sidebar)',
                borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
                cursor: 'pointer',
                fontWeight: isActive ? '600' : '500',
                fontSize: '0.875rem',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Icon size={18} color={isActive ? '#818cf8' : '#64748b'} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span style={{
                  background: isActive ? '#6366f1' : '#1e293b',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '9999px',
                  fontWeight: '600'
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Profile Mini Card */}
      <div style={{
        marginTop: 'auto',
        padding: '0.875rem',
        borderRadius: '12px',
        backgroundColor: '#1e293b',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          backgroundColor: '#6366f1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '700',
          color: '#ffffff'
        }}>
          AD
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ color: '#ffffff', fontSize: '0.875rem', fontWeight: '600', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
            Admin User
          </div>
          <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
            admin@school.edu
          </div>
        </div>
      </div>
    </aside>
  );
};
