import React, { useState, useEffect } from 'react';
import { Printer, Award, CheckCircle2, User, Building } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const ReportGenerator = () => {
  const { token, user } = useAuth();
  const [report, setReport] = useState(null);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    const res = await api.get('/communication/reports/student/STU-1001', token);
    if (res.success) setReport(res.report);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!report) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Actions */}
      <div className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Printer size={24} color="var(--primary)" />
          <div>
            <h3 style={{ fontSize: '1.125rem' }}>Official Student Progress Report Card</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Print-ready layout & institutional metadata</span>
          </div>
        </div>

        <button className="btn btn-primary" onClick={handlePrint}>
          <Printer size={16} /> Print Report Card
        </button>
      </div>

      {/* Report Card Document Shell */}
      <div className="glass-card" style={{ padding: '2.5rem', backgroundColor: '#ffffff', color: '#0f172a', borderRadius: '16px' }} id="printable-report">
        {/* School Header */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '1.75rem', color: '#1e293b', fontFamily: 'serif' }}>{report.school?.name}</h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', fontStyle: 'italic' }}>"{report.school?.motto}"</p>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.5rem' }}>
            {report.school?.address} • Phone: {report.school?.phone} • Email: {report.school?.email}
          </div>
        </div>

        {/* Student & Parent Info */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem', backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '8px' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Student Profile</div>
            <div style={{ fontSize: '1.125rem', fontWeight: '700', marginTop: '0.25rem' }}>{report.student?.name}</div>
            <div style={{ fontSize: '0.875rem', color: '#475569' }}>Admission No: {report.student?.admissionNo}</div>
            <div style={{ fontSize: '0.875rem', color: '#475569' }}>Grade: {report.student?.grade}</div>
          </div>

          <div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Academic Standing & Parent</div>
            <div style={{ fontSize: '1.125rem', fontWeight: '700', color: '#10b981', marginTop: '0.25rem' }}>{report.academicStanding}</div>
            <div style={{ fontSize: '0.875rem', color: '#475569' }}>Cumulative GPA: <strong>{report.student?.gpa?.toFixed(2)}</strong></div>
            <div style={{ fontSize: '0.875rem', color: '#475569' }}>Guardian: {report.parent?.name || 'David Morgan'}</div>
          </div>
        </div>

        {/* Grades Table */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>Subject Marks & Evaluation</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', textAlign: 'left' }}>
                <th style={{ padding: '0.625rem', borderBottom: '1px solid #cbd5e1' }}>Subject Code</th>
                <th style={{ padding: '0.625rem', borderBottom: '1px solid #cbd5e1' }}>Marks Obtained</th>
                <th style={{ padding: '0.625rem', borderBottom: '1px solid #cbd5e1' }}>Percentage</th>
                <th style={{ padding: '0.625rem', borderBottom: '1px solid #cbd5e1' }}>Letter Grade</th>
                <th style={{ padding: '0.625rem', borderBottom: '1px solid #cbd5e1' }}>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {report.results.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.625rem', fontWeight: '600' }}>{r.subjectCode}</td>
                  <td style={{ padding: '0.625rem' }}>{r.marksObtained} / {r.totalMarks}</td>
                  <td style={{ padding: '0.625rem' }}>{r.percentage}%</td>
                  <td style={{ padding: '0.625rem', fontWeight: '700', color: '#6366f1' }}>{r.letterGrade}</td>
                  <td style={{ padding: '0.625rem' }}>{r.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Signatures */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0', textAlign: 'center', fontSize: '0.75rem', color: '#64748b' }}>
          <div>_______________________<br />Class Teacher Signature</div>
          <div>_______________________<br />Principal Signature</div>
          <div>_______________________<br />Official Seal & Date</div>
        </div>
      </div>
    </div>
  );
};
