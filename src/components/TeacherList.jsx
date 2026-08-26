import React from 'react';
import { Mail, BookOpen, Building } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const TeacherList = () => {
  const { teachers, searchQuery } = useApp();

  const filteredTeachers = teachers.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
      {filteredTeachers.map((t) => (
        <div key={t.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--accent-cyan), var(--primary))',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              fontWeight: '700'
            }}>
              {t.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem' }}>{t.name}</h3>
              <span className="badge badge-info" style={{ marginTop: '0.25rem' }}>{t.role}</span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
              <Building size={16} color="var(--primary)" /> {t.department}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
              <Mail size={16} color="var(--primary)" /> {t.email}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
              <BookOpen size={16} color="var(--primary)" /> {t.coursesAssigned} Active Courses
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
