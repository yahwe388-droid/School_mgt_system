import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, 
  Plus, 
  Search, 
  KeyRound, 
  UserX, 
  UserCheck, 
  Copy, 
  Check, 
  Edit2, 
  GraduationCap,
  Eye,
  EyeOff,
  Lock,
  RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { Alert } from '../common/Alert';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const ParentRecordsManager = () => {
  const { token } = useAuth();
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCredentialModalOpen, setIsCredentialModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [copied, setCopied] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [showAddPassword, setShowAddPassword] = useState(false);

  // Secure Password Generator for initial parent provisioning
  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pass = 'Edu@';
    for (let i = 0; i < 6; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass + '!';
  };

  // Form State for creating parent
  const [addForm, setAddForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    phone: '',
    address: '',
    studentIds: [],
    password: ''
  });

  const handleOpenAddModal = () => {
    setAddForm({
      first_name: '',
      last_name: '',
      username: '',
      email: '',
      phone: '',
      address: '',
      studentIds: [],
      password: generateStrongPassword()
    });
    setShowAddPassword(true);
    setIsAddModalOpen(true);
  };

  // Form State for editing parent
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prnRes, stuRes] = await Promise.all([
        api.get('/records/parents', token),
        api.get('/records/students', token)
      ]);

      if (prnRes.success) setParents(prnRes.parents || []);
      if (stuRes.success) setStudents(stuRes.students || []);
    } catch (err) {
      setError('Unable to load parent directory.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateParent = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    setError('');
    setMessage('');

    if (!addForm.password || addForm.password.length < 8) {
      setError('Account password is required and must be at least 8 characters long.');
      setActionLoading(false);
      return;
    }

    try {
      const username = addForm.username || `${addForm.first_name.toLowerCase()}.${addForm.last_name.toLowerCase()}`;
      const res = await api.post('/admin/users', {
        first_name: addForm.first_name,
        last_name: addForm.last_name,
        username,
        email: addForm.email,
        phone: addForm.phone,
        role: 'PARENT',
        address: addForm.address,
        studentIds: addForm.studentIds,
        password: addForm.password,
        temporaryPassword: addForm.password
      }, token);

      if (res.success) {
        setIsAddModalOpen(false);
        setCreatedCredentials({
          name: `${addForm.first_name} ${addForm.last_name}`,
          username: res.user?.username || username,
          temporaryPassword: res.tempPassword || addForm.password,
          role: 'PARENT'
        });
        setIsCredentialModalOpen(true);
        setAddForm({
          first_name: '',
          last_name: '',
          username: '',
          email: '',
          phone: '',
          address: '',
          studentIds: [],
          password: ''
        });
        await fetchData();
      } else {
        setError(res.message || 'Failed to create parent.');
      }
    } catch (err) {
      setError('An error occurred during parent registration.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenEdit = (parent) => {
    setSelectedParent(parent);
    setEditForm({
      name: parent.name || '',
      email: parent.email || '',
      phone: parent.phone || '',
      address: parent.address || ''
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateParent = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.put(`/records/parents/${selectedParent.id}`, editForm, token);
      if (res.success) {
        setIsEditModalOpen(false);
        setMessage('Parent profile updated successfully.');
        setTimeout(() => setMessage(''), 4000);
        fetchData();
      } else {
        setError(res.message || 'Failed to update parent.');
      }
    } catch (err) {
      setError('Failed to update parent.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (parent) => {
    const newStatus = parent.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await api.put(`/records/parents/${parent.id}`, { status: newStatus }, token);
      if (parent.userId) {
        await api.patch(`/admin/users/${parent.userId}/status`, { is_active: newStatus === 'Active' }, token);
      }
      setMessage(`Parent status updated to ${newStatus}.`);
      setTimeout(() => setMessage(''), 3000);
      fetchData();
    } catch (err) {
      setError('Could not update parent status.');
    }
  };

  const handleResetPassword = async () => {
    if (!selectedParent?.userId) return;
    setActionLoading(true);
    try {
      const res = await api.post(`/admin/users/${selectedParent.userId}/reset-password`, {}, token);
      if (res.success) {
        setIsResetModalOpen(false);
        setCreatedCredentials({
          name: selectedParent.name,
          username: selectedParent.name,
          temporaryPassword: res.tempPassword,
          role: 'PARENT'
        });
        setIsCredentialModalOpen(true);
      }
    } catch (err) {
      setError('Failed to reset parent password.');
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const filteredParents = parents.filter(p => {
    return (
      (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.email && p.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.phone && p.phone.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Bar */}
      <div className="glass-card" style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <HeartHandshake size={24} color="#f59e0b" /> Parents & Guardians Directory
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Manage family accounts, guardian contact channels, and student relationships.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={16} /> Register Parent / Guardian
        </button>
      </div>

      {message && <Alert type="success" message={message} />}
      {error && <Alert type="error" message={error} />}

      {/* Filter Toolbar */}
      <div className="glass-card" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search parents by name, email, or phone..."
            className="form-input"
            style={{ paddingLeft: '2.25rem' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Parent Table */}
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem' }}>
            <LoadingSpinner text="Retrieving parent records..." />
          </div>
        ) : filteredParents.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            No parent/guardian records found.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>Parent Name</th>
                  <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>Contact Email</th>
                  <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>Phone Number</th>
                  <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>Associated Children</th>
                  <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredParents.map((parent) => {
                  const studentIds = parent.studentIds || [];
                  const associatedStudents = students.filter(s => studentIds.includes(s.id) || studentIds.includes(s.studentId));

                  return (
                    <tr key={parent.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '600', color: '#ffffff' }}>{parent.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{parent.address || 'Address on file'}</div>
                      </td>

                      <td style={{ padding: '1rem', color: '#e2e8f0', fontSize: '0.875rem' }}>
                        {parent.email}
                      </td>

                      <td style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                        {parent.phone || 'N/A'}
                      </td>

                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                          {associatedStudents.length > 0 ? (
                            associatedStudents.map(s => (
                              <span key={s.id} style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                padding: '0.2rem 0.5rem',
                                borderRadius: '6px',
                                background: 'rgba(34, 211, 238, 0.1)',
                                color: '#22d3ee',
                                fontSize: '0.75rem',
                                fontWeight: '600'
                              }}>
                                <GraduationCap size={12} /> {s.name} ({s.studentId || s.admissionNo})
                              </span>
                            ))
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>No students linked</span>
                          )}
                        </div>
                      </td>

                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleOpenEdit(parent)}
                            className="btn btn-secondary btn-icon"
                            title="Edit Parent Info"
                          >
                            <Edit2 size={15} />
                          </button>

                          {parent.userId && (
                            <button
                              onClick={() => {
                                setSelectedParent(parent);
                                setIsResetModalOpen(true);
                              }}
                              className="btn btn-secondary btn-icon"
                              title="Reset Password"
                            >
                              <KeyRound size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE PARENT MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register Parent / Guardian"
      >
        <form onSubmit={handleCreateParent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. David"
                value={addForm.first_name}
                onChange={(e) => setAddForm({ ...addForm, first_name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Morgan"
                value={addForm.last_name}
                onChange={(e) => setAddForm({ ...addForm, last_name: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Username (Leave blank for auto)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. david.morgan"
                value={addForm.username}
                onChange={(e) => setAddForm({ ...addForm, username: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="parent@school.com"
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="+1 (555) 000-0000"
                value={addForm.phone}
                onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Campus Physical Address</label>
              <input
                type="text"
                className="form-input"
                placeholder="Residential Address"
                value={addForm.address}
                onChange={(e) => setAddForm({ ...addForm, address: e.target.value })}
              />
            </div>
          </div>

          {/* Required Encrypted Parent Account Password */}
          <div className="form-group" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="form-label" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Lock size={14} color="#f59e0b" />
                <span>Account Password *</span>
                <span style={{ fontSize: '0.7rem', color: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.12)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '600' }}>
                  Bcrypt Encrypted
                </span>
              </label>
              <button
                type="button"
                onClick={() => setAddForm(prev => ({ ...prev, password: generateStrongPassword() }))}
                style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: '600' }}
              >
                <RefreshCw size={12} /> Auto-Generate
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showAddPassword ? "text" : "password"}
                required
                minLength={8}
                className="form-input"
                style={{ paddingRight: '2.5rem', fontFamily: 'monospace', letterSpacing: showAddPassword ? '0.05em' : 'normal' }}
                placeholder="Enter account password (minimum 8 characters)"
                value={addForm.password}
                onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowAddPassword(!showAddPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
                title={showAddPassword ? "Hide password" : "Show password"}
              >
                {showAddPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.375rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span>🔐 Encrypted with bcrypt (10 rounds). Parent will be required to change it on first login.</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={actionLoading}
            >
              {actionLoading ? 'Creating Account...' : 'Register Parent'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CREDENTIALS MODAL */}
      <Modal
        isOpen={isCredentialModalOpen}
        onClose={() => setIsCredentialModalOpen(false)}
        title="Parent Account Provisioned"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#10b981',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.75rem'
            }}>
              <Check size={32} />
            </div>
            <h3 style={{ fontSize: '1.2rem', color: '#ffffff', fontWeight: '700' }}>
              Parent Account Created
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
              Provide these temporary credentials to the parent/guardian.
            </p>
          </div>

          <div style={{
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.875rem'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Name</span>
              <div style={{ fontSize: '1rem', fontWeight: '600', color: '#ffffff' }}>{createdCredentials?.name}</div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Username</span>
              <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: '700', color: '#22d3ee' }}>
                {createdCredentials?.username}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Temporary Password</span>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.625rem 0.75rem',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                marginTop: '0.25rem'
              }}>
                <code style={{ fontSize: '1.05rem', color: '#f59e0b', fontWeight: '700' }}>
                  {createdCredentials?.temporaryPassword}
                </code>
                <button
                  onClick={() => copyToClipboard(createdCredentials?.temporaryPassword)}
                  className="btn btn-secondary btn-icon"
                >
                  {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsCredentialModalOpen(false)}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            I Have Shared These Credentials
          </button>
        </div>
      </Modal>

      {/* EDIT PARENT MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Parent Profile: ${selectedParent?.name}`}
      >
        <form onSubmit={handleUpdateParent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              required
              className="form-input"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              required
              className="form-input"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone</label>
            <input
              type="text"
              required
              className="form-input"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={actionLoading}
            >
              {actionLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* RESET PASSWORD MODAL */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Reset Parent Password"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
            Generate a new temporary password for <strong>{selectedParent?.name}</strong>?
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsResetModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              disabled={actionLoading}
              onClick={handleResetPassword}
            >
              {actionLoading ? 'Generating...' : 'Reset Password'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
