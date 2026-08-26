import React, { useState, useEffect } from 'react';
import { GraduationCap, Trash2, Edit2 } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { DataTable } from '../common/DataTable';
import { Modal } from '../common/Modal';

export const StudentRecordsManager = () => {
  const { token } = useAuth();
  const [students, setStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    admissionNo: '',
    name: '',
    email: '',
    grade: 'Senior',
    gpa: 3.5,
    status: 'Active'
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const res = await api.get('/records/students', token);
    if (res.success) setStudents(res.students);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({ admissionNo: `ADM-${Date.now()}`, name: '', email: '', grade: 'Senior', gpa: 3.5, status: 'Active' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await api.post(`/records/students`, { id: editingId, ...form }, token);
    } else {
      await api.post('/records/students', form, token);
    }
    setIsModalOpen(false);
    fetchStudents();
  };

  const columns = [
    { header: 'Admission No', accessor: 'admissionNo', cell: (r) => <strong style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{r.admissionNo || r.id}</strong> },
    { header: 'Student Name', accessor: 'name', cell: (r) => <strong>{r.name}</strong> },
    { header: 'Email', accessor: 'email' },
    { header: 'Grade', accessor: 'grade' },
    { header: 'GPA', accessor: 'gpa', cell: (r) => <strong>{r.gpa?.toFixed ? r.gpa.toFixed(2) : r.gpa}</strong> },
    { header: 'Status', accessor: 'status', cell: (r) => <span className="badge badge-success">{r.status}</span> }
  ];

  return (
    <div>
      <DataTable
        title="Student Records"
        columns={columns}
        data={students}
        searchPlaceholder="Search students by name, email, or admission no..."
        onAddClick={handleOpenAdd}
        addButtonText="New Student Admission"
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Student Profile' : 'New Student Admission'}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              required
              className="form-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              required
              className="form-input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Grade / Level</label>
              <select
                className="form-select"
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
              >
                <option value="Freshman">Freshman</option>
                <option value="Sophomore">Sophomore</option>
                <option value="Junior">Junior</option>
                <option value="Senior">Senior</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">GPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="4"
                className="form-input"
                value={form.gpa}
                onChange={(e) => setForm({ ...form, gpa: parseFloat(e.target.value) })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Student</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
