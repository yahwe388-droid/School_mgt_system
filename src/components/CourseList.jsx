import React from 'react';
import { BookOpen, User, Users, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CourseList = () => {
  const { courses, searchQuery } = useApp();

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
      {filteredCourses.map((c) => {
        const fillRate = Math.round((c.enrolled / c.capacity) * 100);
        return (
          <div key={c.code} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {c.code} • {c.department}
                </span>
                <h3 style={{ fontSize: '1.125rem', marginTop: '0.25rem' }}>{c.title}</h3>
              </div>
              <span className="badge badge-info">{c.credits} Credits</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <User size={16} /> Instructor: <strong style={{ color: 'var(--text-main)' }}>{c.instructor}</strong>
            </div>

            {/* Capacity Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.375rem' }}>
                <span>Enrolled Capacity</span>
                <span>{c.enrolled} / {c.capacity} Students ({fillRate}%)</span>
              </div>
              <div style={{ width: '100%', height: '8px', borderRadius: '4px', backgroundColor: 'var(--border-color)', overflow: 'hidden' }}>
                <div style={{
                  width: `${fillRate}%`,
                  height: '100%',
                  backgroundColor: fillRate > 90 ? 'var(--accent-rose)' : 'var(--primary)',
                  borderRadius: '4px',
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
