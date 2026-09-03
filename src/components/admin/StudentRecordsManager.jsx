import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Plus, 
  Search, 
  KeyRound, 
  UserX, 
  UserCheck, 
  Copy, 
  Check, 
  Edit2, 
  Eye,
  EyeOff,
  Lock,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  Calendar,
  Layers,
  HeartHandshake
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import { Alert } from '../common/Alert';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const StudentRecordsManager = () => {
  const { token } = useAuth();
  const [students, setStudents] = useState([]);
  const [users, setUsers] = useState([]);
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [gradeFilter, setGradeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCredentialModalOpen, setIsCredentialModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [copied, setCopied] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [showAddPassword, setShowAddPassword] = useState(false);

  // Secure Password Generator for initial provisioning
  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pass = 'Edu@';
    for (let i = 0; i < 6; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass + '!';
  };

  // Form State for creating student
  const [addForm, setAddForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    gender: 'Male',
    dob: '',
    grade: 'Senior',
    sectionId: 'SEC-A',
    parentId: '',
    password: ''
  });

  const handleOpenAddModal = () => {
    setAddForm({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      gender: 'Male',
      dob: '',
      grade: 'Senior',
      sectionId: 'SEC-A',
      parentId: '',
      password: generateStrongPassword()
    });
    setShowAddPassword(true);
    setIsAddModalOpen(true);
  };

  // Form State for editing student
  const [editForm, setEditForm] = useState({
    name: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    grade: 'Senior',
    status: 'Active'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [stuRes, userRes, prnRes] = await Promise.all([
        api.get('/records/students', token),
        api.get('/admin/users?role=STUDENT', token),
        api.get('/records/parents', token)
      ]);

      if (stuRes.success) setStudents(stuRes.students || []);
      if (userRes.success) setUsers(userRes.users || []);
      if (prnRes.success) setParents(prnRes.parents || []);
    } catch (err) {
      setError('Unable to load student directory.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStudent = async (e) => {
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
      // Provision Student via /api/admin/users which triggers KM ID generation and user account creation with encrypted password
      const res = await api.post('/admin/users', {
        first_name: addForm.first_name,
        last_name: addForm.last_name,
        username: '', // Backend auto-generates Student ID as username
        email: addForm.email,
        phone: addForm.phone,
        role: 'STUDENT',
        grade: addForm.grade,
        sectionId: addForm.sectionId,
        parentId: addForm.parentId,
        password: addForm.password,
        temporaryPassword: addForm.password
      }, token);

      if (res.success) {
        setIsAddModalOpen(false);
        setCreatedCredentials({
          name: `${addForm.first_name} ${addForm.last_name}`,
          studentId: res.studentId || res.user?.studentId || res.user?.username,
          username: res.user?.username || res.studentId,
          temporaryPassword: res.tempPassword || addForm.password,
          role: 'STUDENT'
        });
        setIsCredentialModalOpen(true);
        setAddForm({
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          gender: 'Male',
          dob: '',
          grade: 'Senior',
          sectionId: 'SEC-A',
          parentId: '',
          password: ''
        });
        await fetchData();
      } else {
        setError(res.message || 'Failed to create student.');
      }
    } catch (err) {
      setError('An error occurred during student admission.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenEdit = (student) => {
    setSelectedStudent(student);
    const names = (student.name || '').split(' ');
    setEditForm({
      name: student.name || '',
      first_name: names[0] || '',
      last_name: names.slice(1).join(' ') || '',
      email: student.email || '',
      phone: student.phone || '',
      grade: student.grade || 'Senior',
      status: student.status || 'Active'
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await api.put(`/records/students/${selectedStudent.id}`, editForm, token);
      if (res.success) {
        setIsEditModalOpen(false);
        setMessage('Student updated successfully.');
        setTimeout(() => setMessage(''), 4000);
        fetchData();
      } else {
        setError(res.message || 'Failed to update student.');
      }
    } catch (err) {
      setError('Failed to update student.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (student) => {
    const newStatus = student.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await api.put(`/records/students/${student.id}`, { status: newStatus }, token);
      // Also update linked user account if exists
      if (student.userId) {
        await api.patch(`/admin/users/${student.userId}/status`, { is_active: newStatus === 'Active' }, token);
      }
      setMessage(`Student status updated to ${newStatus}.`);
      setTimeout(() => setMessage(''), 3000);
      fetchData();
    } catch (err) {
      setError('Could not update student status.');
    }
  };

  const handleResetPassword = async () => {
    if (!selectedStudent?.userId) return;
    setActionLoading(true);
    try {
      const res = await api.post(`/admin/users/${selectedStudent.userId}/reset-password`, {}, token);
      if (res.success) {
        setIsResetModalOpen(false);
        setCreatedCredentials({
          name: selectedStudent.name,
          studentId: selectedStudent.studentId || selectedStudent.admissionNo,
          username: selectedStudent.studentId || selectedStudent.admissionNo,
          temporaryPassword: res.tempPassword,
          role: 'STUDENT'
        });
        setIsCredentialModalOpen(true);
      }
    } catch (err) {
      setError('Failed to reset student password.');
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Filtered Students
  const filteredStudents = students.filter(s => {
    const matchesSearch = 
      (s.name && s.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.studentId && s.studentId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.admissionNo && s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.email && s.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesGrade = gradeFilter === 'ALL' || s.grade === gradeFilter;
    const matchesStatus = statusFilter === 'ALL' || (s.status || 'Active') === statusFilter;

    return matchesSearch && matchesGrade && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Bar */}
      <div className="glass-card" style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <GraduationCap size={24} color="#10b981" /> Student Records Directory
          </h2>
          <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Institutional student accounts with automated <strong>KM/[SEQUENCE]/[YEAR]</strong> IDs.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={16} /> Admit New Student
        </button>
      </div>

      {message && <Alert type="success" message={message} />}
      {error && <Alert type="error" message={error} />}

      {/* Filter Toolbar */}
      <div className="glass-card" style={{ padding: '1rem 1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 260px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search by student ID, name, or email..."
            className="form-input"
            style={{ paddingLeft: '2.25rem' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Grade Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600' }}>Grade:</span>
          <select
            className="form-select"
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            style={{ width: 'auto', padding: '0.4rem 0.75rem' }}
          >
            <option value="ALL">All Grades</option>
            <option value="Freshman">Freshman</option>
            <option value="Sophomore">Sophomore</option>
            <option value="Junior">Junior</option>
            <option value="Senior">Senior</option>
          </select>
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

      {/* Student Table */}
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem' }}>
            <LoadingSpinner text="Retrieving student registry..." />
          </div>
        ) : filteredStudents.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            No students found matching current filters.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>Student ID / Username</th>
                  <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>Student Name</th>
                  <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>Grade / Level</th>
                  <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>Section</th>
                  <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => {
                  const sId = student.studentId || student.admissionNo || student.id;
                  const isActive = (student.status || 'Active') === 'Active';

                  return (
                    <tr key={student.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontFamily: 'monospace', fontWeight: '700', color: '#22d3ee', fontSize: '0.875rem' }}>
                          {sId}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Login Username</div>
                      </td>

                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '600', color: '#ffffff' }}>{student.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{student.email}</div>
                      </td>

                      <td style={{ padding: '1rem', color: '#e2e8f0', fontSize: '0.875rem' }}>
                        {student.grade || 'N/A'}
                      </td>

                      <td style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.875rem' }}>
                        {student.sectionId || 'Section A'}
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
                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEdit(student)}
                            className="btn btn-secondary btn-icon"
                            title="Edit Student Info"
                          >
                            <Edit2 size={15} />
                          </button>

                          {/* Toggle Active / Inactive */}
                          <button
                            onClick={() => handleToggleStatus(student)}
                            className={`btn ${isActive ? 'btn-danger' : 'btn-primary'} btn-icon`}
                            title={isActive ? 'Deactivate Student' : 'Activate Student'}
                          >
                            {isActive ? <UserX size={15} /> : <UserCheck size={15} />}
                          </button>

                          {/* Reset Password */}
                          {student.userId && (
                            <button
                              onClick={() => {
                                setSelectedStudent(student);
                                setIsResetModalOpen(true);
                              }}
                              className="btn btn-secondary btn-icon"
                              title="Generate Temporary Password"
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

      {/* CREATE STUDENT MODAL (No manual ID input) */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Student Admission & Account Creation"
      >
        <form onSubmit={handleCreateStudent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            background: 'rgba(34, 211, 238, 0.08)',
            border: '1px solid rgba(34, 211, 238, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontSize: '0.8125rem',
            color: '#22d3ee'
          }}>
            <Sparkles size={18} />
            <span>
              The unique <strong>Student ID</strong> will be generated automatically following institutional alphabetical allocation rules.
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Abebe"
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
                placeholder="e.g. Chala"
                value={addForm.last_name}
                onChange={(e) => setAddForm({ ...addForm, last_name: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Email (Optional)</label>
              <input
                type="email"
                className="form-input"
                placeholder="student@school.com"
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone</label>
              <input
                type="text"
                className="form-input"
                placeholder="+1 (555) 000-0000"
                value={addForm.phone}
                onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Grade / Academic Level</label>
              <select
                className="form-select"
                value={addForm.grade}
                onChange={(e) => setAddForm({ ...addForm, grade: e.target.value })}
              >
                <option value="Freshman">Freshman</option>
                <option value="Sophomore">Sophomore</option>
                <option value="Junior">Junior</option>
                <option value="Senior">Senior</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Parent / Guardian Association</label>
              <select
                className="form-select"
                value={addForm.parentId}
                onChange={(e) => setAddForm({ ...addForm, parentId: e.target.value })}
              >
                <option value="">Unassigned</option>
                {parents.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Required Encrypted Account Password */}
          <div className="form-group" style={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="form-label" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Lock size={14} color="#10b981" />
                <span>Account Password *</span>
                <span style={{ fontSize: '0.7rem', color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.12)', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: '600' }}>
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
              <span>🔐 Encrypted with bcrypt (10 rounds). Student will be required to change it on first login.</span>
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
              {actionLoading ? 'Allocating ID & Enrolling...' : 'Admit Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CREDENTIALS DISPLAY MODAL (One-Time Copy) */}
      <Modal
        isOpen={isCredentialModalOpen}
        onClose={() => setIsCredentialModalOpen(false)}
        title="Student Account & Credentials Issued"
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
              Student Account Created Successfully
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
              Please provide these credentials to the student. They will be forced to change their password on first login.
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
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Student Name</span>
              <div style={{ fontSize: '1rem', fontWeight: '600', color: '#ffffff' }}>{createdCredentials?.name}</div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Assigned Student ID / Username</span>
              <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: '700', color: '#22d3ee' }}>
                {createdCredentials?.studentId || createdCredentials?.username}
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
                  title="Copy Password"
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

      {/* EDIT STUDENT MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Student Profile: ${selectedStudent?.name}`}
      >
        <form onSubmit={handleUpdateStudent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
            <label className="form-label">Grade</label>
            <select
              className="form-select"
              value={editForm.grade}
              onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })}
            >
              <option value="Freshman">Freshman</option>
              <option value="Sophomore">Sophomore</option>
              <option value="Junior">Junior</option>
              <option value="Senior">Senior</option>
            </select>
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

      {/* RESET PASSWORD CONFIRMATION MODAL */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Reset Student Password"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: '1.5' }}>
            Are you sure you want to generate a new temporary password for <strong>{selectedStudent?.name}</strong>?
            The student will be forced to update it on their next login.
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
              {actionLoading ? 'Generating...' : 'Generate New Temporary Password'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
