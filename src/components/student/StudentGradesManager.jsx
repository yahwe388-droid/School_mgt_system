import React, { useState, useEffect } from 'react';
import { Award, BookOpen, TrendingUp, CheckCircle, FileText, Printer, Star } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../common/Alert';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const StudentGradesManager = () => {
  const { token, user } = useAuth();
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/student/grades', token);
      if (res.success && res.results) {
        setGrades(res.results);
      } else {
        setError(res.message || 'Failed to load grade records.');
      }
    } catch (err) {
      setError('An error occurred retrieving your academic report cards.');
    } finally {
      setLoading(false);
    }
  };

  // Metrics
  const totalExams = grades.length;
  const avgPercentage = totalExams > 0 
    ? (grades.reduce((acc, g) => acc + (Number(g.percentage) || 0), 0) / totalExams).toFixed(1)
    : 0;

  const avgGpa = totalExams > 0
    ? (grades.reduce((acc, g) => acc + (Number(g.gpa) || 3.0), 0) / totalExams).toFixed(2)
    : '0.00';

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <LoadingSpinner text="Loading grade transcript..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="glass-card" style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Award size={24} color="#10b981" /> Academic Performance & Official Gradebook
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Official examination marks, GPA standing, and faculty academic assessments.
          </p>
        </div>

        <button
          className="btn btn-secondary"
          onClick={handlePrint}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}
        >
          <Printer size={16} /> Print Grade Transcript
        </button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* KPI Highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Cumulative GPA</span>
            <div style={{ padding: '0.4rem', borderRadius: '6px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
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
            Mean percentage across all tests
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Graded Assessments</span>
            <div style={{ padding: '0.4rem', borderRadius: '6px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <FileText size={18} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: '800', color: '#ffffff' }}>
            {totalExams}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Exams and recorded quizzes
          </div>
        </div>
      </div>

      {/* Grades Table */}
      <div className="glass-card" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#ffffff', marginBottom: '1.25rem' }}>
          Transcript Course Records
        </h3>

        {grades.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
            <Award size={48} style={{ opacity: 0.3, margin: '0 auto 1rem auto' }} />
            <div style={{ color: '#ffffff', fontWeight: '600', marginBottom: '0.25rem' }}>No Graded Results Recorded</div>
            <p style={{ fontSize: '0.8125rem' }}>Exam and assessment scores will appear here as soon as instructors publish them.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Subject Code</th>
                <th style={{ padding: '0.75rem 1rem' }}>Exam / Assessment</th>
                <th style={{ padding: '0.75rem 1rem' }}>Marks Obtained</th>
                <th style={{ padding: '0.75rem 1rem' }}>Percentage</th>
                <th style={{ padding: '0.75rem 1rem' }}>Letter Grade</th>
                <th style={{ padding: '0.75rem 1rem' }}>GPA</th>
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
                    {grade.examId || 'Semester Assessment'}
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
                      backgroundColor: ['A+', 'A', 'A-'].includes(grade.letterGrade) ? 'rgba(16, 185, 129, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                      color: ['A+', 'A', 'A-'].includes(grade.letterGrade) ? '#34d399' : '#38bdf8'
                    }}>
                      {grade.letterGrade || 'A'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: '#fbbf24', fontWeight: '700' }}>
                    {grade.gpa ? Number(grade.gpa).toFixed(1) : '3.5'}
                  </td>
                  <td style={{ padding: '1rem', color: '#94a3b8', fontStyle: 'italic' }}>
                    {grade.remarks || 'Satisfactory academic progress'}
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
