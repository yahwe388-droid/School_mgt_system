import React from 'react';
import { Sun, Moon, LogOut, Shield, UserCheck, GraduationCap, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Topbar = () => {
  const { user, logout, theme, toggleTheme } = useAuth();

  const getRoleBadge = (role) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN': return { bg: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', icon: Shield };
      case 'TEACHER': return { bg: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee', icon: UserCheck };
      case 'STUDENT': return { bg: 'rgba(16, 185, 129, 0.15)', color: '#34d399', icon: GraduationCap };
      case 'PARENT': return { bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', icon: Users };
      default: return { bg: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8', icon: Shield };
    }
  };

  const badge = getRoleBadge(user?.role);
  const RoleIcon = badge.icon;

  return (
    <header style={{
      height: '70px',
      borderBottom: '1px solid var(--border-color)',
      backgroundColor: 'var(--bg-card)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div>
        <h1 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>{user?.role} Portal</h1>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Authenticated Session: {user?.email}</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Role Badge */}
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.375rem',
          padding: '0.375rem 0.75rem',
          borderRadius: '9999px',
          backgroundColor: badge.bg,
          color: badge.color,
          fontSize: '0.75rem',
          fontWeight: '700'
        }}>
          <RoleIcon size={14} /> {user?.role}
        </span>

        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          className="btn btn-secondary btn-icon"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} color="#f59e0b" />}
        </button>

        {/* Profile Card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '0.5rem', borderLeft: '1px solid var(--border-color)' }}>
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250'}
            alt={user?.name}
            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-main)', lineHeight: '1.2' }}>{user?.name}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.id}</span>
          </div>

          <button
            onClick={logout}
            className="btn btn-danger btn-icon"
            style={{ marginLeft: '0.5rem' }}
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
