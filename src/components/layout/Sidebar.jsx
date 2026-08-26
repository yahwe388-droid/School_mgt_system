import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  BookOpen, 
  CalendarCheck, 
  Award, 
  ShieldCheck, 
  UserCheck, 
  HeartHandshake, 
  BookMarked,
  Settings,
  Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role;

  // Role-aware navigation definitions
  const getNavItems = () => {
    switch (role) {
      case 'Admin':
        return [
          { label: 'Admin Dashboard', icon: LayoutDashboard, path: '/admin' },
          { label: 'User & Role Management', icon: ShieldCheck, path: '/admin/users' },
          { label: 'System Configuration', icon: Settings, path: '/admin/settings' },
        ];
      case 'Teacher':
        return [
          { label: 'Teacher Dashboard', icon: LayoutDashboard, path: '/teacher' },
          { label: 'Assigned Classes', icon: BookOpen, path: '/teacher/classes' },
          { label: 'Student Rosters', icon: Users, path: '/teacher/students' },
        ];
      case 'Student':
        return [
          { label: 'Student Dashboard', icon: LayoutDashboard, path: '/student' },
          { label: 'My Enrolled Courses', icon: BookOpen, path: '/student/courses' },
          { label: 'My Academic Grades', icon: Award, path: '/student/grades' },
        ];
      case 'Parent':
        return [
          { label: 'Parent Dashboard', icon: LayoutDashboard, path: '/parent' },
          { label: 'Children Overview', icon: HeartHandshake, path: '/parent/children' },
          { label: 'School Notices', icon: Bell, path: '/parent/notices' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

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
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          boxShadow: '0 4px 12px rgba(99,102,241,0.4)'
        }}>
          <BookMarked size={22} />
        </div>
        <div>
          <h2 style={{ color: '#ffffff', fontSize: '1.05rem', lineHeight: '1.2' }}>School Management</h2>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '500' }}>System Portal</span>
        </div>
      </div>

      {/* Role Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', flex: 1 }}>
        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', fontWeight: '700', padding: '0.5rem', marginBottom: '0.25rem' }}>
          {role} Navigation
        </div>

        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = index === 0; // Default active for base shell
          return (
            <div
              key={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 0.875rem',
                borderRadius: '8px',
                background: isActive ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.15), rgba(99, 102, 241, 0.05))' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-sidebar)',
                borderLeft: isActive ? '3px solid #6366f1' : '3px solid transparent',
                fontWeight: isActive ? '600' : '500',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              <Icon size={18} color={isActive ? '#818cf8' : '#64748b'} />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>
    </aside>
  );
};
