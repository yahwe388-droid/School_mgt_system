import React, { useState, useEffect } from 'react';
import { CalendarCheck, Calendar, Clock, CheckCircle2, XCircle, AlertTriangle, Filter } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../common/Alert';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const StudentAttendanceManager = () => {
  const { token } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    percentage: 100
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/student/attendance', token);
      if (res.success) {
        setAttendance(res.attendance || []);
        if (res.stats) {
          setStats(res.stats);
        }
      } else {
        setError(res.message || 'Failed to retrieve attendance logs.');
      }
    } catch (err) {
      setError('An error occurred retrieving attendance information.');
    } finally {
      setLoading(false);
    }
  };

  const filteredAttendance = attendance.filter(item => {
    if (statusFilter === 'ALL') return true;
    return (item.status || '').toUpperCase() === statusFilter;
  });

  if (loading) {
    return <LoadingSpinner text="Retrieving attendance records..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="glass-card" style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <CalendarCheck size={24} color="#10b981" /> Attendance Record & Compliance
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Daily roll-call records, classroom attendance percentage, and institutional compliance.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select
            className="input-field"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ fontSize: '0.8125rem', padding: '0.45rem 1rem' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="PRESENT">Present</option>
            <option value="LATE">Late</option>
            <option value="ABSENT">Absent</option>
          </select>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* KPI Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Attendance Rate</span>
            <div style={{ padding: '0.4rem', borderRadius: '6px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#ffffff' }}>
            {stats.percentage}%
          </div>
          <div style={{ fontSize: '0.75rem', color: stats.percentage >= 80 ? '#34d399' : '#f87171', marginTop: '0.25rem', fontWeight: '600' }}>
            {stats.percentage >= 80 ? 'Compliant with School Policy (≥80%)' : 'Attendance Warning (<80%)'}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Present Days</span>
            <div style={{ padding: '0.4rem', borderRadius: '6px', backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <CalendarCheck size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#ffffff' }}>
            {stats.present}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Attended lecture periods
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Late Arrivals</span>
            <div style={{ padding: '0.4rem', borderRadius: '6px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#ffffff' }}>
            {stats.late}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Tardy entries recorded
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Unexcused Absences</span>
            <div style={{ padding: '0.4rem', borderRadius: '6px', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
              <XCircle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#ffffff' }}>
            {stats.absent}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Missed instructional sessions
          </div>
        </div>
      </div>

      {/* Attendance History Log */}
      <div className="glass-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', marginBottom: '1.25rem' }}>
          Session Attendance Log
        </h3>

        {filteredAttendance.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
            <CalendarCheck size={48} style={{ opacity: 0.3, margin: '0 auto 1rem auto' }} />
            <div style={{ color: '#ffffff', fontWeight: '600', marginBottom: '0.25rem' }}>No Attendance Records Found</div>
            <p style={{ fontSize: '0.8125rem' }}>Classroom roll-call records for your selected filter will appear here.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                <th style={{ padding: '0.75rem 1rem' }}>Class / Subject</th>
                <th style={{ padding: '0.75rem 1rem' }}>Attendance Status</th>
                <th style={{ padding: '0.75rem 1rem' }}>Faculty Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.map((rec, idx) => {
                const status = (rec.status || 'Present').toUpperCase();
                return (
                  <tr
                    key={rec.id || idx}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.015)'
                    }}
                  >
                    <td style={{ padding: '1rem', color: '#ffffff', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Calendar size={15} color="#94a3b8" />
                      {rec.date}
                    </td>
                    <td style={{ padding: '1rem', color: '#cbd5e1' }}>
                      {rec.classId || 'Enrolled Class'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        backgroundColor: status === 'PRESENT' ? 'rgba(16, 185, 129, 0.2)' : status === 'LATE' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: status === 'PRESENT' ? '#34d399' : status === 'LATE' ? '#fbbf24' : '#f87171'
                      }}>
                        {status === 'PRESENT' ? <CheckCircle2 size={12} /> : status === 'LATE' ? <Clock size={12} /> : <XCircle size={12} />}
                        {rec.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: '#94a3b8', fontStyle: 'italic' }}>
                      {rec.remarks || 'Regular attendance session'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
