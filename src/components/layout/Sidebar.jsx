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
  Settings, 
  Bell, 
  Calendar,
  LogOut,
  MessageSquare,
  User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = () => {
  const { user, currentPath, navigate, logout } = useAuth();
  const role = (user?.role || '').toUpperCase();

  // Role-aware navigation definitions matching specifications
  const getNavItems = () => {
    switch (role) {
      case 'ADMIN':
        return [
          { label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
          { label: 'Users & Accounts', icon: ShieldCheck, path: '/admin/users' },
          { label: 'Teachers', icon: UserCheck, path: '/admin/teachers' },
          { label: 'Students', icon: GraduationCap, path: '/admin/students' },
          { label: 'Parents/Guardians', icon: HeartHandshake, path: '/admin/parents' },
          { label: 'School Settings', icon: Settings, path: '/admin/settings' },
        ];
      case 'TEACHER':
        return [
          { label: 'Dashboard', icon: LayoutDashboard, path: '/teacher/dashboard' },
          { label: 'My Classes', icon: BookOpen, path: '/teacher/classes' },
          { label: 'My Students', icon: Users, path: '/teacher/students' },
          { label: 'Attendance', icon: CalendarCheck, path: '/teacher/attendance' },
          { label: 'Assignments', icon: BookOpen, path: '/teacher/assignments' },
          { label: 'Grades', icon: Award, path: '/teacher/grades' },
          { label: 'Schedule', icon: Calendar, path: '/teacher/schedule' },
          { label: 'Messages', icon: MessageSquare, path: '/teacher/messages' },
          { label: 'Profile', icon: User, path: '/teacher/profile' },
        ];
      case 'STUDENT':
        return [
          { label: 'Dashboard', icon: LayoutDashboard, path: '/student/dashboard' },
          { label: 'My Courses', icon: BookOpen, path: '/student/courses' },
          { label: 'Assignments', icon: BookOpen, path: '/student/assignments' },
          { label: 'Grades', icon: Award, path: '/student/grades' },
          { label: 'Attendance', icon: CalendarCheck, path: '/student/attendance' },
          { label: 'Schedule', icon: Calendar, path: '/student/schedule' },
          { label: 'Messages', icon: MessageSquare, path: '/student/messages' },
          { label: 'Profile', icon: User, path: '/student/profile' },
        ];
      case 'PARENT':
        return [
          { label: 'Dashboard', icon: LayoutDashboard, path: '/parent/dashboard' },
          { label: 'My Children', icon: HeartHandshake, path: '/parent/children' },
          { label: 'Attendance', icon: CalendarCheck, path: '/parent/attendance' },
          { label: 'Grades', icon: Award, path: '/parent/grades' },
          { label: 'Assignments', icon: BookOpen, path: '/parent/assignments' },
          { label: 'Schedule', icon: Calendar, path: '/parent/schedule' },
          { label: 'Messages', icon: MessageSquare, path: '/parent/messages' },
          { label: 'Profile', icon: User, path: '/parent/profile' },
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
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '500' }}>Management Portal</span>
        </div>
      </div>

      {/* Role Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: '700', padding: '0.5rem', marginBottom: '0.25rem' }}>
          {role} Portal
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = (() => {
            if (currentPath === item.path) return true;
            if (item.path === '/admin/dashboard' && (currentPath === '/admin' || currentPath === '/admin/dashboard' || currentPath === '/')) return true;
            if (item.path === '/teacher/dashboard' && (currentPath === '/teacher' || currentPath === '/teacher/dashboard')) return true;
            if (item.path === '/student/dashboard' && (currentPath === '/student' || currentPath === '/student/dashboard')) return true;
            if (item.path === '/parent/dashboard' && (currentPath === '/parent' || currentPath === '/parent/dashboard')) return true;
            return false;
          })();
          return (
            <div
              key={item.label}
              onClick={() => navigate(item.path)}
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
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={18} color={isActive ? '#818cf8' : '#64748b'} />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>

      {/* Sign Out Action */}
      <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button
          onClick={logout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 0.875rem',
            borderRadius: '8px',
            background: 'none',
            border: 'none',
            color: '#ef4444',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

