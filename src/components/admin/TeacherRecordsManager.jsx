import React, { useState, useEffect } from 'react';
import { 
  UserCheck, 
  Plus, 
  Search, 
  KeyRound, 
  UserX, 
  Copy, 
  Check, 
  Edit2, 
  Sparkles,
  Briefcase,
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

export const TeacherRecordsManager = () => {
  const { token } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCredentialModalOpen, setIsCredentialModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [copied, setCopied] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [showAddPassword, setShowAddPassword] = useState(false);

  // Secure Password Generator for initial teacher provisioning
  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pass = 'Edu@';
    for (let i = 0; i < 6; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass + '!';
  };

  // Form State for creating teacher
  const [addForm, setAddForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    phone: '',
    department: 'Computer Science',
    qualification: 'M.Sc. Education',
    employeeId: '',
    password: ''
  });

  const handleOpenAddModal = () => {
    setAddForm({
      first_name: '',
      last_name: '',
      username: '',
      email: '',
      phone: '',
      department: 'Computer Science',
      qualification: 'M.Sc. Education',
      employeeId: '',
      password: generateStrongPassword()
    });
    setShowAddPassword(true);
    setIsAddModalOpen(true);
  };

  // Form State for editing teacher
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Computer Science',
    qualification: 'M.Sc. Education',
    status: 'Active'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tchRes, userRes] = await Promise.all([
        api.get('/records/teachers', token),
        api.get('/admin/users?role=TEACHER', token)
      ]);

      if (tchRes.success) setTeachers(tchRes.teachers || []);
      if (userRes.success) setUsers(userRes.users || []);
    } catch (err) {
      setError('Unable to load faculty records.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeacher = async (e) => {
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
        role: 'TEACHER',
        department: addForm.department,
        qualification: addForm.qualification,
        employeeId: addForm.employeeId || `EMP-${Date.now().toString().slice(-4)}`,
        password: addForm.password,
        temporaryPassword: addForm.password
      }, token);

      if (res.success) {
        setIsAddModalOpen(false);
        setCreatedCredentials({
          name: `${addForm.first_name} ${addForm.last_name}`,
          username: res.user?.username || username,
          temporaryPassword: res.tempPassword || addForm.password,
          role: 'TEACHER'
        });
        setIsCredentialModalOpen(true);
        setAddForm({
          first_name: '',
          last_name: '',
          username: '',
          email: '',
          phone: '',
          department: 'Computer Science',
          qualification: 'M.Sc. Education',
          employeeId: '',
          password: ''
        });
        await fetchData();
      } else {
        setError(res.message || 'Failed to create teacher.');
      }
    } catch (err) {
      setError('An error occurred during teacher registration.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenEdit = (teacher) => {
    setSelectedTeacher(teacher);
    setEditForm({
      name: teacher.name || '',
      email: teacher.email || '',
      phone: teacher.phone || '',
      department: teacher.department || 'Computer Science',
      qualification: teacher.qualification || 'M.Sc. Education',
      status: teacher.status || 'Active'
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateTeacher = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.put(`/records/teachers/${selectedTeacher.id}`, editForm, token);
      if (res.success) {
        setIsEditModalOpen(false);
        setMessage('Faculty profile updated successfully.');
        setTimeout(() => setMessage(''), 4000);
        fetchData();
      } else {
        setError(res.message || 'Failed to update teacher.');
      }
    } catch (err) {
      setError('Failed to update teacher.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (teacher) => {
    const newStatus = teacher.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await api.put(`/records/teachers/${teacher.id}`, { status: newStatus }, token);
      if (teacher.userId) {
        await api.patch(`/admin/users/${teacher.userId}/status`, { is_active: newStatus === 'Active' }, token);
      }
      setMessage(`Teacher status updated to ${newStatus}.`);
      setTimeout(() => setMessage(''), 3000);
      fetchData();
    } catch (err) {
      setError('Could not update faculty status.');
    }
  };

  const handleResetPassword = async () => {
    if (!selectedTeacher?.userId) return;
    setActionLoading(true);
    try {
      const res = await api.post(`/admin/users/${selectedTeacher.userId}/reset-password`, {}, token);
      if (res.success) {
        setIsResetModalOpen(false);
        setCreatedCredentials({
          name: selectedTeacher.name,
          username: selectedTeacher.name,
          temporaryPassword: res.tempPassword,
          role: 'TEACHER'
        });
        setIsCredentialModalOpen(true);
      }
    } catch (err) {
      setError('Failed to reset teacher password.');
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Filtered Teachers
  const filteredTeachers = teachers.filter(t => {
    const matchesSearch = 
      (t.name && t.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.employeeId && t.employeeId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.department && t.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.email && t.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDept = departmentFilter === 'ALL' || t.department === departmentFilter;
    const matchesStatus = statusFilter === 'ALL' || (t.status || 'Active') === statusFilter;

    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Bar */}
      <div className="glass-card" style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <UserCheck size={24} color="#22d3ee" /> Faculty & Teachers Directory
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Manage instructors, credentials, department affiliations, and academic teaching assignments.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={16} /> Register Faculty Member
        </button>
      </div>

      {message && <Alert type="success" message={message} />}
      {error && <Alert type="error" message={error} />}

      {/* Filter Toolbar */}
      <div className="glass-card" style={{ padding: '1rem 1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search faculty by name, department, or ID..."
            className="form-input"
            style={{ paddingLeft: '2.25rem' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>Status:</span>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 'auto', padding: '0.4rem 0.75rem' }}
          >
            <option value="ALL">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Teacher Table */}
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem' }}>
            <LoadingSpinner text="Retrieving faculty roster..." />
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            No faculty members found matching current filters.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>Employee ID</th>
                  <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>Faculty Name</th>
                  <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>Department</th>
                  <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>Qualification</th>
                  <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.map((teacher) => {
                  const isActive = (teacher.status || 'Active') === 'Active';

                  return (
                    <tr key={teacher.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontFamily: 'monospace', fontWeight: '700', color: '#818cf8', fontSize: '0.875rem' }}>
                          {teacher.employeeId || teacher.id}
                        </div>
                      </td>

                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '600', color: '#ffffff' }}>{teacher.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{teacher.email}</div>
                      </td>

                      <td style={{ padding: '1rem', color: '#e2e8f0', fontSize: '0.875rem' }}>
                        {teacher.department}
                      </td>

                      <td style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                        {teacher.qualification || 'M.Ed / B.Sc'}
                      </td>

                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          backgroundColor: isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: isActive ? '#34d399' : '#f87171'
                        }}>
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleOpenEdit(teacher)}
                            className="btn btn-secondary btn-icon"
                            title="Edit Faculty Info"
                          >
                            <Edit2 size={15} />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(teacher)}
                            className={`btn ${isActive ? 'btn-danger' : 'btn-primary'} btn-icon`}
                            title={isActive ? 'Deactivate Teacher' : 'Activate Teacher'}
                          >
                            {isActive ? <UserX size={15} /> : <UserCheck size={15} />}
                          </button>

                          {teacher.userId && (
                            <button
                              onClick={() => {
                                setSelectedTeacher(teacher);
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

      {/* CREATE TEACHER MODAL */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register Faculty Member"
      >
        <form onSubmit={handleCreateTeacher} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Robert"
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
                placeholder="e.g. Vance"
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
                placeholder="e.g. robert.vance"
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
                placeholder="teacher@school.com"
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Department *</label>
              <input
                type="text"
                required
                className="form-input"
                value={addForm.department}
                onChange={(e) => setAddForm({ ...addForm, department: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Qualification</label>
              <input
                type="text"
                className="form-input"
                value={addForm.qualification}
                onChange={(e) => setAddForm({ ...addForm, qualification: e.target.value })}
              />
            </div>
          </div>

          {/* Required Encrypted Faculty Account Password */}
          <div className="form-group" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="form-label" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Lock size={14} color="#22d3ee" />
                <span>Account Password *</span>
                <span style={{ fontSize: '0.7rem', color: '#22d3ee', backgroundColor: 'rgba(34, 211, 238, 0.12)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '600' }}>
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
              <span>🔐 Encrypted with bcrypt (10 rounds). Faculty member must change it upon their first login.</span>
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
              {actionLoading ? 'Creating Account...' : 'Register Faculty'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CREDENTIALS ISSUED MODAL */}
      <Modal
        isOpen={isCredentialModalOpen}
        onClose={() => setIsCredentialModalOpen(false)}
        title="Faculty Account Provisioned"
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
              Teacher Credentials Issued
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
              Provide these temporary credentials to the faculty member.
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

      {/* EDIT TEACHER MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Faculty Profile: ${selectedTeacher?.name}`}
      >
        <form onSubmit={handleUpdateTeacher} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
              className="form-input"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Department</label>
            <input
              type="text"
              required
              className="form-input"
              value={editForm.department}
              onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
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
        title="Reset Faculty Password"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
            Generate a new temporary password for <strong>{selectedTeacher?.name}</strong>?
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
