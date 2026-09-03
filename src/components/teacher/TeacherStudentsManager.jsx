import React, { useState, useEffect } from 'react';
import { Users, Search, GraduationCap, Award, CalendarCheck, Eye, Mail, MessageSquare } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { Alert } from '../common/Alert';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const TeacherStudentsManager = () => {
  const { token, navigate } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Student detail modal
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [studentGrades, setStudentGrades] = useState([]);
  const [studentAttendance, setStudentAttendance] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/teacher/students', token);
      if (res.success && res.students) {
        setStudents(res.students);
      } else {
        setError(res.message || 'Failed to load student roster.');
      }
    } catch (err) {
      setError('An error occurred retrieving student directory.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStudentDetail = async (student) => {
    setSelectedStudent(student);
    setIsDetailOpen(true);
    setDetailLoading(true);

    try {
      const [gradesRes, attRes] = await Promise.all([
        api.get('/teacher/grades', token),
        api.get(`/academic/attendance`, token)
      ]);

      if (gradesRes.success && gradesRes.results) {
        setStudentGrades(gradesRes.results.filter(r => r.studentId === student.id || r.studentId === student.studentId));
      }
      if (attRes.success && attRes.attendance) {
        const studentLogs = attRes.attendance.filter(a => a.studentId === student.id || a.studentId === student.studentId);
        const present = studentLogs.filter(a => a.status === 'Present').length;
        const total = studentLogs.length || 1;
        setStudentAttendance({
          logs: studentLogs,
          percentage: Math.round((present / total) * 100)
        });
      }
    } catch {
      setStudentGrades([]);
    } finally {
      setDetailLoading(false);
    }
  };

  const filteredStudents = students.filter(s => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.studentId && s.studentId.toLowerCase().includes(q)) ||
      (s.admissionNo && s.admissionNo.toLowerCase().includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="glass-card" style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Users size={24} color="#6366f1" /> Assigned Students Directory
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Students registered in cohorts and academic courses under your instructional supervision.
          </p>
        </div>

        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.25rem' }}
            placeholder="Search students by name, ID, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Students Data Table */}
      <div className="glass-card" style={{ padding: '1rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
              <th style={{ padding: '0.75rem 1rem' }}>Student Profile</th>
              <th style={{ padding: '0.75rem 1rem' }}>Institutional ID</th>
              <th style={{ padding: '0.75rem 1rem' }}>Cohort / Grade</th>
              <th style={{ padding: '0.75rem 1rem' }}>Status</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2.5rem' }}>
                  <LoadingSpinner text="Retrieving student directory..." />
                </td>
              </tr>
            ) : filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
                  No students found matching your instructional cohort.
                </td>
              </tr>
            ) : (
              filteredStudents.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                        {s.name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', color: '#f8fafc' }}>{s.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', fontFamily: 'monospace', fontWeight: '700', color: '#38bdf8' }}>
                    {s.studentId || s.admissionNo || s.id}
                  </td>
                  <td style={{ padding: '0.875rem 1rem', color: '#cbd5e1' }}>
                    {s.grade || 'Senior'} ({s.classId || 'CLS-12'})
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <span className="badge badge-success">Active</span>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                    <button
                      onClick={() => handleOpenStudentDetail(s)}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
                    >
                      <Eye size={14} /> Dossier
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Student Academic Dossier Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedStudent ? `Academic Dossier: ${selectedStudent.name}` : 'Student Dossier'}
      >
        {detailLoading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <LoadingSpinner text="Compiling academic profile..." />
          </div>
        ) : selectedStudent && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Top Identity Card */}
            <div style={{ padding: '1rem', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Student ID</span>
                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#38bdf8', fontFamily: 'monospace' }}>
                  {selectedStudent.studentId || selectedStudent.admissionNo || selectedStudent.id}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Attendance Rating</span>
                <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#10b981' }}>
                  {studentAttendance?.percentage || 95}% Present
                </div>
              </div>
            </div>

            {/* Recent Recorded Grades */}
            <div>
              <h4 style={{ fontSize: '0.9rem', color: '#f8fafc', fontWeight: '700', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={16} color="#f59e0b" /> Academic Results
              </h4>
              {studentGrades.length === 0 ? (
                <p style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>No assessment scores logged for this student yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {studentGrades.map((g, idx) => (
                    <div key={idx} style={{ padding: '0.625rem 0.75rem', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '600', color: '#cbd5e1', fontSize: '0.875rem' }}>{g.subjectCode || 'Course'}</span>
                      <span style={{ fontWeight: '700', color: '#10b981' }}>{g.marksObtained}/{g.totalMarks} ({g.letterGrade || 'A'})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsDetailOpen(false)}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setIsDetailOpen(false);
                  navigate('/teacher/messages');
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
              >
                <MessageSquare size={14} /> Send Message to Student
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
