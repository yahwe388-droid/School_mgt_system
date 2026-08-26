import React, { useState, useEffect } from 'react';
import { Award, Plus, Printer, CheckCircle } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { DataTable } from '../common/DataTable';
import { Modal } from '../common/Modal';

export const ResultManager = () => {
  const { token, user } = useAuth();
  const [results, setResults] = useState([]);
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    examId: 'EXM-001',
    studentId: 'STU-1001',
    studentName: 'Alex Morgan',
    subjectCode: 'CS-401',
    marksObtained: 94,
    totalMarks: 100
  });

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    const res = await api.get('/academic/exams', token);
    if (res.success) {
      setResults(res.results);
      setExams(res.exams);
    }

    const stuRes = await api.get('/records/students', token);
    if (stuRes.success) setStudents(stuRes.students);
  };

  const handleStudentSelect = (e) => {
    const sId = e.target.value;
    const stu = students.find((s) => s.id === sId);
    setForm({ ...form, studentId: sId, studentName: stu ? stu.name : '' });
  };

  const handleSaveResult = async (e) => {
    e.preventDefault();
    const res = await api.post('/academic/results', form, token);
    if (res.success) {
      setIsModalOpen(false);
      fetchResults();
    }
  };

  const columns = [
    { header: 'Student ID', accessor: 'studentId', cell: (r) => <strong style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{r.studentId}</strong> },
    { header: 'Student Name', accessor: 'studentName', cell: (r) => <strong>{r.studentName}</strong> },
    { header: 'Subject', accessor: 'subjectCode', cell: (r) => <span className="badge badge-info">{r.subjectCode}</span> },
    { header: 'Marks', accessor: 'marksObtained', cell: (r) => `${r.marksObtained} / ${r.totalMarks}` },
    { header: 'Percentage', accessor: 'percentage', cell: (r) => <strong>{r.percentage}%</strong> },
    { header: 'Grade', accessor: 'letterGrade', cell: (r) => <span className="badge badge-success" style={{ fontWeight: '800' }}>Grade {r.letterGrade}</span> },
    { header: 'Remarks', accessor: 'remarks' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <DataTable
        title="Student Marks & Report Card Generator"
        columns={columns}
        data={results}
        searchPlaceholder="Search results by student name or subject..."
        onAddClick={(user?.role === 'Admin' || user?.role === 'Teacher') ? () => setIsModalOpen(true) : null}
        addButtonText="Enter Student Marks"
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Enter Student Marks & Evaluation">
        <form onSubmit={handleSaveResult}>
          <div className="form-group">
            <label className="form-label">Select Student</label>
            <select className="form-select" value={form.studentId} onChange={handleStudentSelect}>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.id} - {s.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Subject Code</label>
              <input type="text" required className="form-input" value={form.subjectCode} onChange={(e) => setForm({ ...form, subjectCode: e.target.value })} />
            </div>

            <div className="form-group">
              <label className="form-label">Marks Obtained</label>
              <input type="number" min="0" max="100" required className="form-input" value={form.marksObtained} onChange={(e) => setForm({ ...form, marksObtained: parseInt(e.target.value) })} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Compute & Save Result</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
