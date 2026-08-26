import React, { useState, useEffect } from 'react';
import { Award, Plus, Calendar, Clock } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { DataTable } from '../common/DataTable';
import { Modal } from '../common/Modal';

export const ExamManager = () => {
  const { token, user } = useAuth();
  const [exams, setExams] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    title: '',
    subjectCode: 'CS-401',
    examDate: '2026-10-15',
    timeSlot: '09:00 - 11:00 AM',
    durationMinutes: 120,
    totalMarks: 100,
    type: 'Midterm'
  });

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    const res = await api.get('/academic/exams', token);
    if (res.success) setExams(res.exams);
  };

  const handleAddExam = async (e) => {
    e.preventDefault();
    const res = await api.post('/academic/exams', form, token);
    if (res.success) {
      setIsModalOpen(false);
      fetchExams();
    }
  };

  const columns = [
    { header: 'Assessment Title', accessor: 'title', cell: (r) => <strong>{r.title}</strong> },
    { header: 'Subject', accessor: 'subjectCode', cell: (r) => <span className="badge badge-info">{r.subjectCode}</span> },
    { header: 'Type', accessor: 'type' },
    { header: 'Exam Date', accessor: 'examDate' },
    { header: 'Duration', accessor: 'durationMinutes', cell: (r) => `${r.durationMinutes} mins` },
    { header: 'Total Marks', accessor: 'totalMarks' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <DataTable
        title="Exams & Assessments Schedule"
        columns={columns}
        data={exams}
        searchPlaceholder="Search exams by subject or title..."
        onAddClick={(user?.role === 'Admin' || user?.role === 'Teacher') ? () => setIsModalOpen(true) : null}
        addButtonText="Schedule Exam / Assessment"
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule Exam / Assessment">
        <form onSubmit={handleAddExam}>
          <div className="form-group">
            <label className="form-label">Exam Title</label>
            <input type="text" required className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Subject Code</label>
              <input type="text" required className="form-input" value={form.subjectCode} onChange={(e) => setForm({ ...form, subjectCode: e.target.value })} />
            </div>

            <div className="form-group">
              <label className="form-label">Assessment Type</label>
              <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="Quiz">Quiz</option>
                <option value="Midterm">Midterm</option>
                <option value="Final">Final Exam</option>
                <option value="Practical">Practical</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Exam Date</label>
              <input type="date" required className="form-input" value={form.examDate} onChange={(e) => setForm({ ...form, examDate: e.target.value })} />
            </div>

            <div className="form-group">
              <label className="form-label">Duration (Minutes)</label>
              <input type="number" required className="form-input" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: parseInt(e.target.value) })} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Schedule Assessment</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
