import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Search, 
  ShieldCheck, 
  Key, 
  CheckCircle, 
  XCircle, 
  Edit3, 
  RefreshCw, 
  Copy, 
  Check, 
  X, 
  AlertCircle,
  UserCheck,
  GraduationCap,
  Users,
  Shield,
  Phone,
  Mail,
  Calendar,
  Clock,
  Eye,
  EyeOff,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Alert } from '../common/Alert';

export const AdminUserManagement = () => {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals & Creation State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State for Creation
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    phone: '',
    role: 'TEACHER',
    department: '',
    grade: '',
    temporaryPassword: ''
  });

  const [showCreatePassword, setShowCreatePassword] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [selectedRole]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    const queryParam = selectedRole !== 'All' ? `?role=${selectedRole}` : '';
    const res = await api.get(`/admin/users${queryParam}`, token);
    setLoading(false);

    if (res.success && res.users) {
      setUsers(res.users);
    } else {
      setError(res.message || 'Failed to load user records.');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      fetchUsers();
      return;
    }
    const filtered = users.filter(u => 
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q))
    );
    setUsers(filtered);
  };

  const generateAutoTempPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let pass = 'Edu@';
    for (let i = 0; i < 6; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, temporaryPassword: pass }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!formData.first_name || !formData.last_name || (!formData.username && formData.role !== 'STUDENT') || !formData.role) {
      setError('Please fill in First Name, Last Name, and Role (Student ID/Username is automatically generated for students).');
      return;
    }

    if (!formData.temporaryPassword || formData.temporaryPassword.length < 8) {
      setError('Password is required and must be at least 8 characters long.');
      return;
    }

    setSubmitting(true);
    const res = await api.post('/admin/users', {
      ...formData,
      password: formData.temporaryPassword
    }, token);
    setSubmitting(false);

    if (res.success) {
      setCreatedCredentials({
        username: res.user.username,
        role: res.user.role,
        tempPassword: res.tempPassword
      });
      setShowCreateModal(false);
      setFormData({
        first_name: '',
        last_name: '',
        username: '',
        email: '',
        phone: '',
        role: 'TEACHER',
        department: '',
        grade: '',
        temporaryPassword: ''
      });
      fetchUsers();
    } else {
      setError(res.message || 'Failed to create user account.');
    }
  };

  const handleToggleStatus = async (user) => {
    const targetStatus = !user.is_active;
    const actionName = targetStatus ? 'activate' : 'deactivate';
    if (!window.confirm(`Are you sure you want to ${actionName} the account for ${user.name} (@${user.username})?`)) {
      return;
    }

    const res = await api.patch(`/admin/users/${user.id}/status`, { isActive: targetStatus }, token);
    if (res.success) {
      setSuccessMsg(`Account for ${user.name} has been ${targetStatus ? 'activated' : 'deactivated'}.`);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: targetStatus } : u));
    } else {
      setError(res.message || 'Failed to update account status.');
    }
  };

  const handleResetPassword = async (user) => {
    if (!window.confirm(`Generate a new temporary password for ${user.name} (@${user.username})? The user will be forced to change it on next login.`)) {
      return;
    }

    const res = await api.post(`/admin/users/${user.id}/reset-password`, {}, token);
    if (res.success) {
      setCreatedCredentials({
        username: user.username,
        role: user.role,
        tempPassword: res.tempPassword,
        isReset: true
      });
      fetchUsers();
    } else {
      setError(res.message || 'Failed to reset password.');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    setSubmitting(true);
    const res = await api.put(`/admin/users/${selectedUser.id}`, {
      first_name: selectedUser.first_name,
      last_name: selectedUser.last_name,
      email: selectedUser.email,
      phone: selectedUser.phone,
      department: selectedUser.department
    }, token);
    setSubmitting(false);

    if (res.success) {
      setSuccessMsg(`User ${selectedUser.name} updated successfully.`);
      setShowEditModal(false);
      setSelectedUser(null);
      fetchUsers();
    } else {
      setError(res.message || 'Failed to update user.');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getRoleIcon = (role) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN': return <Shield size={14} color="#6366f1" />;
      case 'TEACHER': return <UserCheck size={14} color="#06b6d4" />;
      case 'STUDENT': return <GraduationCap size={14} color="#10b981" />;
      case 'PARENT': return <Users size={14} color="#f59e0b" />;
      default: return <Shield size={14} />;
    }
  };

  const getRoleBadgeStyle = (role) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN': return { bg: 'rgba(99, 102, 241, 0.12)', color: '#818cf8', border: 'rgba(99, 102, 241, 0.3)' };
      case 'TEACHER': return { bg: 'rgba(6, 182, 212, 0.12)', color: '#22d3ee', border: 'rgba(6, 182, 212, 0.3)' };
      case 'STUDENT': return { bg: 'rgba(16, 185, 129, 0.12)', color: '#34d399', border: 'rgba(16, 185, 129, 0.3)' };
      case 'PARENT': return { bg: 'rgba(245, 158, 11, 0.12)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)' };
      default: return { bg: 'rgba(148, 163, 184, 0.12)', color: '#94a3b8', border: 'rgba(148, 163, 184, 0.3)' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Action Header & Filtering */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={22} color="var(--primary)" />
              Account & RBAC User Management
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Only System Administrators can provision user accounts. Roles are strictly stored in the database.
            </p>
          </div>

          <button
            onClick={() => {
              generateAutoTempPassword();
              setShowCreateModal(true);
            }}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <UserPlus size={18} /> Provision New User
          </button>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {successMsg && <Alert type="success" message={successMsg} onClose={() => setSuccessMsg('')} />}

        {/* Search & Filter Controls */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', flex: '1 1 300px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '2.5rem', fontSize: '0.875rem' }}
                placeholder="Search by name, username, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-secondary" style={{ fontSize: '0.875rem' }}>
              Search
            </button>
          </form>

          {/* Role Filter Pills */}
          <div style={{ display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
            {['All', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT'].map((r) => {
              const isActive = selectedRole === r;
              return (
                <button
                  key={r}
                  onClick={() => setSelectedRole(r)}
                  className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
                >
                  {r}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="glass-card" style={{ padding: '1rem', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
              <th style={{ padding: '0.75rem 1rem' }}>User Profile</th>
              <th style={{ padding: '0.75rem 1rem' }}>Username</th>
              <th style={{ padding: '0.75rem 1rem' }}>System Role</th>
              <th style={{ padding: '0.75rem 1rem' }}>Status</th>
              <th style={{ padding: '0.75rem 1rem' }}>Created / Last Login</th>
              <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Security Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Loading user records...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No users found matching the selected criteria.
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const badge = getRoleBadgeStyle(u.role);
                return (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={u.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250'}
                          alt={u.name}
                          style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{u.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '0.875rem 1rem', color: 'var(--text-main)', fontFamily: 'monospace' }}>
                      @{u.username}
                    </td>

                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        padding: '0.25rem 0.625rem',
                        borderRadius: '9999px',
                        backgroundColor: badge.bg,
                        color: badge.color,
                        border: `1px solid ${badge.border}`,
                        fontSize: '0.75rem',
                        fontWeight: '700'
                      }}>
                        {getRoleIcon(u.role)}
                        {u.role}
                      </span>
                    </td>

                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        backgroundColor: u.is_active !== false ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: u.is_active !== false ? '#10b981' : '#ef4444',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        {u.is_active !== false ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {u.is_active !== false ? 'Active' : 'Deactivated'}
                      </span>
                      {u.must_change_password && (
                        <span style={{ display: 'block', fontSize: '0.6875rem', color: '#f59e0b', marginTop: '0.25rem' }}>
                          • Temp Password Pending
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '0.875rem 1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <div>Created: {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}</div>
                      <div>Login: {u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never'}</div>
                    </td>

                    <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => {
                            setSelectedUser({ ...u });
                            setShowEditModal(true);
                          }}
                          className="btn btn-secondary btn-icon"
                          title="Edit User Info"
                          style={{ padding: '0.375rem' }}
                        >
                          <Edit3 size={15} />
                        </button>

                        <button
                          onClick={() => handleResetPassword(u)}
                          className="btn btn-secondary btn-icon"
                          title="Generate Temporary Password (Reset)"
                          style={{ padding: '0.375rem', color: '#f59e0b' }}
                        >
                          <Key size={15} />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`btn ${u.is_active !== false ? 'btn-danger' : 'btn-secondary'} btn-icon`}
                          title={u.is_active !== false ? 'Deactivate Account' : 'Activate Account'}
                          style={{ padding: '0.375rem' }}
                        >
                          {u.is_active !== false ? <XCircle size={15} /> : <CheckCircle size={15} color="#10b981" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Account Creation Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '540px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            position: 'relative',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <button
              onClick={() => setShowCreateModal(false)}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <UserPlus size={24} color="var(--primary)" />
              <div>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', margin: 0 }}>Provision New User Account</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Admin-Only Role Assignment</span>
              </div>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">First Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Jane"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Last Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Smith"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Username *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. jane.smith"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Assigned Role *</label>
                  <select
                    className="form-input"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="TEACHER">Teacher</option>
                    <option value="STUDENT">Student</option>
                    <option value="PARENT">Parent</option>
                    <option value="ADMIN">Administrator</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="e.g. jane@school.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              {formData.role === 'TEACHER' && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Department / Specialization</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Computer Science, Mathematics"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>
              )}

              {formData.role === 'STUDENT' && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Grade / Year Level</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Senior, Grade 12"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  />
                </div>
              )}

              {/* Required Temporary Password Generator */}
              <div className="form-group" style={{ marginBottom: 0, backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '0.875rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label className="form-label" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Lock size={14} color="#6366f1" />
                    <span>Temporary Password *</span>
                    <span style={{ fontSize: '0.7rem', color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.12)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '600' }}>
                      Bcrypt Encrypted
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={generateAutoTempPassword}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: '600' }}
                  >
                    <RefreshCw size={12} /> Regenerate
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showCreatePassword ? "text" : "password"}
                    required
                    minLength={8}
                    className="form-input"
                    style={{ paddingRight: '2.5rem', fontFamily: 'monospace', letterSpacing: showCreatePassword ? '0.05em' : 'normal' }}
                    value={formData.temporaryPassword}
                    onChange={(e) => setFormData({ ...formData, temporaryPassword: e.target.value })}
                    placeholder="Enter password (minimum 8 characters)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCreatePassword(!showCreatePassword)}
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
                    title={showCreatePassword ? "Hide password" : "Show password"}
                  >
                    {showCreatePassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.375rem' }}>
                  🔐 Encrypted with bcrypt (10 rounds). The user must change this password upon their first login.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                >
                  {submitting ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Account Created / Password Reset Notification Modal */}
      {createdCredentials && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1050,
          padding: '1rem'
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '460px',
            padding: '2rem',
            position: 'relative',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                color: '#10b981',
                marginBottom: '1rem',
                border: '2px solid rgba(16, 185, 129, 0.3)'
              }}>
                <CheckCircle size={32} />
              </div>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', margin: 0 }}>
                {createdCredentials.isReset ? 'Password Reset Successfully' : 'Account Created Successfully'}
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Provide these initial credentials to the user.
              </p>
            </div>

            <div style={{
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '8px',
              padding: '1.25rem',
              border: '1px solid var(--border-color)',
              marginBottom: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Username:</span>
                <span style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)', fontFamily: 'monospace' }}>
                  {createdCredentials.username}
                </span>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Temporary Password:</span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                  <span style={{ fontSize: '1.125rem', fontWeight: '700', color: '#f59e0b', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                    {createdCredentials.tempPassword}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(createdCredentials.tempPassword)}
                    className="btn btn-secondary"
                    style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                  >
                    {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>

            <div style={{
              padding: '0.75rem',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '6px',
              color: '#f87171',
              fontSize: '0.75rem',
              marginBottom: '1.5rem',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'flex-start'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>IMPORTANT:</strong> For security, this temporary password is shown only once and will never be displayed in plaintext again.
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setCreatedCredentials(null)}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '480px',
            padding: '2rem',
            position: 'relative'
          }}>
            <button
              onClick={() => {
                setShowEditModal(false);
                setSelectedUser(null);
              }}
              style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '1rem' }}>
              Edit User: {selectedUser.name}
            </h3>

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={selectedUser.first_name || ''}
                    onChange={(e) => setSelectedUser({ ...selectedUser, first_name: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={selectedUser.last_name || ''}
                    onChange={(e) => setSelectedUser({ ...selectedUser, last_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={selectedUser.email || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  value={selectedUser.phone || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, phone: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
