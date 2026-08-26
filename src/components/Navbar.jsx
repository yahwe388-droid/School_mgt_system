import React from 'react';
import { Search, Sun, Moon, Bell, HelpCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Navbar = () => {
  const { theme, toggleTheme, activeTab, searchQuery, setSearchQuery } = useApp();

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Executive Dashboard';
      case 'students': return 'Student Directory';
      case 'teachers': return 'Faculty & Staff';
      case 'courses': return 'Course Catalog';
      case 'attendance': return 'Daily Attendance Tracker';
      case 'grades': return 'Academic Gradebook';
      default: return 'Management System';
    }
  };

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
      {/* Title Breadcrumb */}
      <div>
        <h1 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>{getTitle()}</h1>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AcademiX Portal / {activeTab}</p>
      </div>

      {/* Search and Right Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Search Input */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          <input
            type="text"
            placeholder="Search students, faculty, courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.375rem', borderRadius: '20px', fontSize: '0.8125rem' }}
          />
        </div>

        {/* Dark/Light Toggle */}
        <button
          onClick={toggleTheme}
          className="btn btn-secondary btn-icon"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} color="#f59e0b" />}
        </button>

        {/* Notifications */}
        <button className="btn btn-secondary btn-icon" title="Notifications">
          <Bell size={18} />
        </button>
      </div>
    </header>
  );
};
