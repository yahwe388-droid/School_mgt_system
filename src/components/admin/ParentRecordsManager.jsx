import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { DataTable } from '../common/DataTable';
import { Modal } from '../common/Modal';

export const ParentRecordsManager = () => {
  const { token } = useAuth();
  const [parents, setParents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    occupation: '',
    address: ''
  });

  useEffect(() => {
    fetchParents();
  }, []);

  const fetchParents = async () => {
    const res = await api.get('/records/parents', token);
    if (res.success) setParents(res.parents);
  };

  const handleOpenAdd = () => {
    setForm({ name: '', email: '', phone: '', occupation: '', address: '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post('/records/parents', form, token);
    setIsModalOpen(false);
    fetchParents();
  };

  const columns = [
    { header: 'Parent ID', accessor: 'id', cell: (r) => <strong style={{ fontFamily: 'monospace', color: 'var(--accent-amber)' }}>{r.id}</strong> },
    { header: 'Parent / Guardian Name', accessor: 'name', cell: (r) => <strong>{r.name}</strong> },
    { header: 'Email', accessor: 'email' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Occupation', accessor: 'occupation' }
  ];

  return (
    <div>
      <DataTable
        title="Parent & Guardian Records"
        columns={columns}
        data={parents}
        searchPlaceholder="Search parents by name, email, or phone..."
        onAddClick={handleOpenAdd}
        addButtonText="New Parent Registration"
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Parent Registration">
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="text"
                required
                className="form-input"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Occupation</label>
            <input
              type="text"
              className="form-input"
              value={form.occupation}
              onChange={(e) => setForm({ ...form, occupation: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Parent</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
