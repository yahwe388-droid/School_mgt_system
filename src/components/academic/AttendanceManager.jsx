import React, { useState, useEffect } from 'react';
import { CalendarCheck, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { DataTable } from '../common/DataTable';

export const AttendanceManager = () => {
  const { token, user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, excused: 0, percentage: 100 });

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    const res = await api.get('/academic/attendance', token);
    if (res.success) {
      setAttendance(res.attendance);
      if (res.stats) setStats(res.stats);
    }

    const stuRes = await api.get('/records/students', token);
    if (stuRes.success) setStudents(stuRes.students);
  };

  const handleMarkStatus = async (student, status) => {
    const recordData = {
      date: selectedDate,
      studentId: student.id,
      studentName: student.name,
      classId: student.classId || 'CLS-12',
      status,
      remarks: `Marked by ${user?.name}`
    };

    const res = await api.post('/academic/attendance', recordData, token);
    if (res.success) fetchData();
  };

  const columns = [
    { header: 'Student ID', accessor: 'id', cell: (r) => <strong style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{r.id}</strong> },
    { header: 'Student Name', accessor: 'name', cell: (r) => <strong>{r.name}</strong> },
    {
      header: 'Today Status',
      accessor: 'status',
      cell: (r) => {
        const log = attendance.find((a) => a.studentId === r.id && a.date === selectedDate);
        const st = log ? log.status : 'Not Marked';
        return (
          <span className={`badge ${
            st === 'Present' ? 'badge-success' : st === 'Late' ? 'badge-warning' : st === 'Absent' ? 'badge-danger' : 'badge-info'
          }`}>
            {st}
          </span>
        );
      }
    }
  ];

  const renderActions = (student) => {
    if (user?.role !== 'Admin' && user?.role !== 'Teacher') return null;

    return (
      <div style={{ display: 'flex', gap: '0.375rem' }}>
        <button className="btn btn-primary" style={{ fontSize: '0.75rem', padding: '0.375rem 0.625rem' }} onClick={() => handleMarkStatus(student, 'Present')}>
          Present
        </button>
        <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.375rem 0.625rem' }} onClick={() => handleMarkStatus(student, 'Late')}>
          Late
        </button>
        <button className="btn btn-danger" style={{ fontSize: '0.75rem', padding: '0.375rem 0.625rem' }} onClick={() => handleMarkStatus(student, 'Absent')}>
          Absent
        </button>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Register */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <CalendarCheck size={24} color="var(--accent-emerald)" />
          <div>
            <h3 style={{ fontSize: '1.125rem' }}>Daily Student Attendance Register</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Class Attendance Rate: {stats.percentage}%</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.8125rem', fontWeight: '600', color: 'var(--text-muted)' }}>Register Date:</label>
            <input
              type="date"
              className="form-input"
              style={{ width: '160px', padding: '0.375rem 0.625rem' }}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      <DataTable
        title="Students Register"
        columns={columns}
        data={students}
        searchPlaceholder="Search student to mark attendance..."
        renderActions={renderActions}
      />
    </div>
  );
};
