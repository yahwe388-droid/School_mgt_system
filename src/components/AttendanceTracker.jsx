import React from 'react';
import { CheckCircle2, Clock, XCircle, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AttendanceTracker = () => {
  const { attendance, updateAttendance, searchQuery } = useApp();

  const filteredAttendance = attendance.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Date Header */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Calendar size={20} color="var(--primary)" />
          <div>
            <h3 style={{ fontSize: '1rem' }}>Daily Attendance Register</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Date: {new Date().toISOString().split('T')[0]}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <CheckCircle2 size={16} color="var(--accent-emerald)" /> Present: {attendance.filter(a => a.status === 'Present').length}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Clock size={16} color="var(--accent-amber)" /> Late: {attendance.filter(a => a.status === 'Late').length}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <XCircle size={16} color="var(--accent-rose)" /> Absent: {attendance.filter(a => a.status === 'Absent').length}
          </span>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Name</th>
                <th>Status</th>
                <th>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.map((item) => (
                <tr key={item.studentId}>
                  <td style={{ fontFamily: 'monospace', fontWeight: '600', color: 'var(--primary)' }}>{item.studentId}</td>
                  <td style={{ fontWeight: '600' }}>{item.name}</td>
                  <td>
                    <span className={`badge ${
                      item.status === 'Present' ? 'badge-success' : item.status === 'Late' ? 'badge-warning' : 'badge-danger'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className={`btn ${item.status === 'Present' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ fontSize: '0.75rem', padding: '0.375rem 0.625rem' }}
                        onClick={() => updateAttendance(item.studentId, 'Present')}
                      >
                        Present
                      </button>
                      <button
                        className={`btn ${item.status === 'Late' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ fontSize: '0.75rem', padding: '0.375rem 0.625rem' }}
                        onClick={() => updateAttendance(item.studentId, 'Late')}
                      >
                        Late
                      </button>
                      <button
                        className={`btn ${item.status === 'Absent' ? 'btn-danger' : 'btn-secondary'}`}
                        style={{ fontSize: '0.75rem', padding: '0.375rem 0.625rem' }}
                        onClick={() => updateAttendance(item.studentId, 'Absent')}
                      >
                        Absent
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
