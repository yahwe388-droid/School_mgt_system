import React, { useState, useEffect } from 'react';
import { UserCheck } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { DataTable } from '../common/DataTable';
import { Modal } from '../common/Modal';

export const TeacherRecordsManager = () => {
  const { token } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    employeeId: '',
    name: '',
    email: '',
    department: 'Computer Science',
    qualification: 'M.Sc. Education',
    phone: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    const res = await api.get('/records/teachers', token);
    if (res.success) setTeachers(res.teachers);
  };

  const handleOpenAdd = () => {
    setForm({ employeeId: `EMP-${Date.now()}`, name: '', email: '', department: 'Computer Science', qualification: 'M.Sc. Education', phone: '', status: 'Active' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/records/teachers', form, token);
    setIsModalOpen(false);
    fetchTeachers();
  };

  const columns = [
    { header: 'Employee ID', accessor: 'employeeId', cell: (r) => <strong style={{ fontFamily: 'monospace', color: 'var(--accent-cyan)' }}>{r.employeeId || r.id}</strong> },
    { header: 'Faculty Name', accessor: 'name', cell: (r) => <strong>{r.name}</strong> },
    { header: 'Email', accessor: 'email' },
    { header: 'Department', accessor: 'department' },
    { header: 'Qualification', accessor: 'qualification' },
    { header: 'Status', accessor: 'status', cell: (r) => <span className="badge badge-info">{r.status}</span> }
  ];

  return (
    <div>
      <DataTable
        title="Faculty & Teacher Records"
        columns={columns}
        data={teachers}
        searchPlaceholder="Search faculty by name, department, or ID..."
        onAddClick={handleOpenAdd}
        addButtonText="New Faculty Member"
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Faculty Member Registration">
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
              <label className="form-label">Department</label>
              <input
                type="text"
                required
                className="form-input"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Qualification</label>
              <input
                type="text"
                required
                className="form-input"
                value={form.qualification}
                onChange={(e) => setForm({ ...form, qualification: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Faculty</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
