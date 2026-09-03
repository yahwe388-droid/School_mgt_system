import React, { useState, useEffect } from 'react';
import { Award, BookOpen, TrendingUp, CheckCircle, FileText, Printer, Star } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../common/Alert';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const ParentGradesManager = () => {
  const { token } = useAuth();
  const [children, setChildren] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInitial();
  }, []);

  const fetchInitial = async () => {
    setLoading(true);
    setError('');
    try {
      const childRes = await api.get('/parent/children', token);
      if (childRes.success && childRes.children && childRes.children.length > 0) {
        setChildren(childRes.children);
        const primaryId = childRes.children[0].id;
        setSelectedStudentId(primaryId);
        await fetchGradesForStudent(primaryId);
      } else {
        setError('No linked student profiles found for this account.');
      }
    } catch (err) {
      setError('An error occurred retrieving child grade records.');
    } finally {
      setLoading(false);
    }
  };

  const fetchGradesForStudent = async (studentId) => {
    try {
      const res = await api.get(`/parent/grades?studentId=${encodeURIComponent(studentId)}`, token);
      if (res.success && res.results) {
        setGrades(res.results);
      } else {
        setError(res.message || 'Failed to load grade reports.');
      }
    } catch (err) {
      setError('Error loading student grades.');
    }
  };

  const handleStudentChange = async (e) => {
    const studentId = e.target.value;
    setSelectedStudentId(studentId);
    await fetchGradesForStudent(studentId);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving official report cards..." />;
  }

  const selectedChild = children.find(c => c.id === selectedStudentId);
  const totalExams = grades.length;
  const avgPercentage = totalExams > 0
    ? (grades.reduce((acc, g) => acc + (Number(g.percentage) || 0), 0) / totalExams).toFixed(1)
    : 0;

  const avgGpa = totalExams > 0
    ? (grades.reduce((acc, g) => acc + (Number(g.gpa) || 3.0), 0) / totalExams).toFixed(2)
    : '0.00';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header & Child Selector */}
      <div className="glass-card" style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Award size={24} color="#f59e0b" /> Official Academic Transcript & Report Card
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Periodic examination assessments, letter grades, and faculty remarks for {selectedChild?.name || 'your child'}.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {children.length > 1 && (
            <select
              className="input-field"
              value={selectedStudentId}
              onChange={handleStudentChange}
              style={{ fontSize: '0.8125rem', padding: '0.45rem 1rem' }}
            >
              {children.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.studentId || c.id})</option>
              ))}
            </select>
          )}

          <button
            className="btn btn-secondary"
            onClick={handlePrint}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}
          >
            <Printer size={16} /> Print Report Card
          </button>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* KPI Highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Cumulative GPA</span>
            <div style={{ padding: '0.4rem', borderRadius: '6px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <Award size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#ffffff' }}>
            {avgGpa} <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: '500' }}>/ 4.00</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '0.25rem', fontWeight: '600' }}>
            Academic Standing: Good
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Average Score</span>
            <div style={{ padding: '0.4rem', borderRadius: '6px', backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#ffffff' }}>
            {avgPercentage}%
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Classroom assessment average
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Published Exams</span>
            <div style={{ padding: '0.4rem', borderRadius: '6px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <FileText size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#ffffff' }}>
            {totalExams}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Graded course examinations
          </div>
        </div>
      </div>

      {/* Grades Table */}
      <div className="glass-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', marginBottom: '1.25rem' }}>
          Subject Transcript {selectedChild ? `for ${selectedChild.name}` : ''}
        </h3>

        {grades.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
            <Award size={48} style={{ opacity: 0.3, margin: '0 auto 1rem auto' }} />
            <div style={{ color: '#ffffff', fontWeight: '600', marginBottom: '0.25rem' }}>No Exam Results Published</div>
            <p style={{ fontSize: '0.8125rem' }}>Official grades will be posted here as soon as teachers complete grading.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Subject Code</th>
                <th style={{ padding: '0.75rem 1rem' }}>Assessment Title</th>
                <th style={{ padding: '0.75rem 1rem' }}>Marks Obtained</th>
                <th style={{ padding: '0.75rem 1rem' }}>Percentage</th>
                <th style={{ padding: '0.75rem 1rem' }}>Letter Grade</th>
                <th style={{ padding: '0.75rem 1rem' }}>Grade Points (GPA)</th>
                <th style={{ padding: '0.75rem 1rem' }}>Faculty Remarks</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((grade, idx) => (
                <tr
                  key={grade.id || idx}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255, 255, 255, 0.015)'
                  }}
                >
                  <td style={{ padding: '1rem', fontWeight: '600', color: '#ffffff' }}>
                    {grade.subjectCode || 'GEN-101'}
                  </td>
                  <td style={{ padding: '1rem', color: '#cbd5e1' }}>
                    {grade.examId || 'Midterm / Final'}
                  </td>
                  <td style={{ padding: '1rem', color: '#ffffff' }}>
                    <strong>{grade.marksObtained}</strong> / {grade.totalMarks || 100}
                  </td>
                  <td style={{ padding: '1rem', color: '#38bdf8', fontWeight: '600' }}>
                    {grade.percentage}%
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{
                      fontWeight: '800',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '4px',
                      backgroundColor: ['A+', 'A', 'A-'].includes(grade.letterGrade) ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: ['A+', 'A', 'A-'].includes(grade.letterGrade) ? '#34d399' : '#fbbf24'
                    }}>
                      {grade.letterGrade || 'A'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: '#fbbf24', fontWeight: '700' }}>
                    {grade.gpa ? Number(grade.gpa).toFixed(1) : '3.5'}
                  </td>
                  <td style={{ padding: '1rem', color: '#94a3b8', fontStyle: 'italic' }}>
                    {grade.remarks || 'Standard academic performance'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
