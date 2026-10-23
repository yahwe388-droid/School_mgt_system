import React from 'react';
import { Sun, Moon, LogOut, Shield, UserCheck, GraduationCap, Users, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Topbar = ({ onMenuClick }) => {
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
    <header className="topbar">
      <div className="topbar-left">
        {/* Hamburger — only visible on mobile */}
        <button
          onClick={onMenuClick}
          className="btn btn-secondary btn-icon topbar-menu-btn"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="topbar-title">
          <h1 style={{ fontSize: '1.125rem', color: 'var(--text-main)', fontWeight: '700' }}>{user?.role} Portal</h1>
          <p className="topbar-subtitle" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {user?.email}
          </p>
        </div>
      </div>

      <div className="topbar-right">
        {/* Role Badge — hidden on very small screens */}
        <span className="topbar-role-badge" style={{
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', paddingLeft: '0.5rem', borderLeft: '1px solid var(--border-color)' }}>
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250'}
            alt={user?.name}
            style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
          />
          <div className="topbar-user-info">
            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-main)', lineHeight: '1.2' }}>{user?.name}</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user?.id}</span>
          </div>

          <button
            onClick={logout}
            className="btn btn-danger btn-icon"
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
