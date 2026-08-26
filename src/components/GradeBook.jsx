import React from 'react';
import { Award, TrendingUp, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const GradeBook = () => {
  const { students, searchQuery } = useApp();

  const filteredStudents = students.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStanding = (gpa) => {
    if (gpa >= 3.8) return { label: 'Summa Cum Laude', color: 'badge-success' };
    if (gpa >= 3.5) return { label: 'Dean\'s List', color: 'badge-info' };
    if (gpa >= 3.0) return { label: 'Good Standing', color: 'badge-info' };
    return { label: 'Academic Warning', color: 'badge-danger' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Award size={24} color="var(--primary)" />
        <div>
          <h3 style={{ fontSize: '1.125rem' }}>Academic Performance & Gradebook</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Automated GPA records, honor roll tracking, and academic standings.</p>
        </div>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Student Name</th>
                <th>Department</th>
                <th>Cumulative GPA</th>
                <th>Letter Grade</th>
                <th>Academic Standing</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s) => {
                const standing = getStanding(s.gpa);
                let letterGrade = 'F';
                if (s.gpa >= 3.7) letterGrade = 'A';
                else if (s.gpa >= 3.3) letterGrade = 'B+';
                else if (s.gpa >= 3.0) letterGrade = 'B';
                else if (s.gpa >= 2.5) letterGrade = 'C';
                else letterGrade = 'D';

                return (
                  <tr key={s.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: '600', color: 'var(--primary)' }}>{s.id}</td>
                    <td style={{ fontWeight: '600' }}>{s.name}</td>
                    <td>{s.department}</td>
                    <td style={{ fontWeight: '700', fontSize: '1rem' }}>{s.gpa.toFixed(2)}</td>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary-light)',
                        color: 'var(--primary-text)',
                        textAlign: 'center',
                        lineHeight: '28px',
                        fontWeight: '700',
                        fontSize: '0.875rem'
                      }}>
                        {letterGrade}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${standing.color}`}>{standing.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
