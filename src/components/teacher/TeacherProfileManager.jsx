import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Award, Shield, CheckCircle, Save, Briefcase, Building } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../common/Alert';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const TeacherProfileManager = () => {
  const { token, user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    phone: '',
    department: '',
    qualification: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/teacher/profile', token);
      if (res.success && res.profile) {
        setProfile(res.profile);
        setFormData({
          phone: res.profile.phone || res.profile.teacher?.phone || '',
          department: res.profile.teacher?.department || res.profile.department || 'Computer Science & Engineering',
          qualification: res.profile.teacher?.qualification || 'M.Sc. Computer Science'
        });
      } else {
        setError(res.message || 'Failed to retrieve faculty profile.');
      }
    } catch (err) {
      setError('An error occurred retrieving faculty profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.put('/teacher/profile', formData, token);
      if (res.success) {
        setSuccess('Faculty profile details updated successfully.');
        if (updateUser) {
          updateUser({ phone: formData.phone });
        }
      } else {
        setError(res.message || 'Failed to update faculty profile.');
      }
    } catch (err) {
      setError('An error occurred submitting profile changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving faculty credentials..." />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px' }}>
      {/* Header */}
      <div className="glass-card" style={{ padding: '1.5rem 2rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <User size={24} color="#38bdf8" /> Faculty Staff Profile & Academic Credentials
        </h2>
        <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '0.25rem' }}>
          Manage your verified institutional contact information and pedagogical qualifications.
        </p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Verification Card */}
        <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              border: '2px solid rgba(56, 189, 248, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#38bdf8',
              fontWeight: 'bold',
              fontSize: '1.5rem'
            }}>
              {(user?.name || 'T')[0].toUpperCase()}
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', color: '#ffffff', fontWeight: '600' }}>{user?.name}</h3>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                backgroundColor: 'rgba(56, 189, 248, 0.2)',
                color: '#38bdf8',
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px',
                marginTop: '0.35rem',
                fontWeight: '600'
              }}>
                <Shield size={12} /> VERIFIED INSTRUCTOR
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Briefcase size={15} /> System Staff ID
              </span>
              <span style={{ color: '#ffffff', fontWeight: '600', fontFamily: 'monospace' }}>
                {profile?.teacher?.id || `TCH-${user?.id}`}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={15} /> Institutional Email
              </span>
              <span style={{ color: '#ffffff' }}>{user?.email || 'faculty@educore.edu'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={15} /> Assigned Role
              </span>
              <span style={{ color: '#38bdf8', fontWeight: '600' }}>TEACHER (Read-Only Security Constraint)</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0' }}>
              <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={15} /> Account Security
              </span>
              <span style={{ color: '#34d399', fontWeight: '600' }}>Active & Compliant</span>
            </div>
          </div>
        </div>

        {/* Edit Details Card */}
        <div className="glass-card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.0625rem', color: '#ffffff', fontWeight: '600', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={18} color="#38bdf8" /> Faculty Details & Contact
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '0.375rem', fontWeight: '500' }}>
                Assigned Department / Division
              </label>
              <div style={{ position: 'relative' }}>
                <Building size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  className="input-field"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g. Mathematics, Computer Science"
                  style={{ width: '100%', paddingLeft: '2.4rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '0.375rem', fontWeight: '500' }}>
                Highest Academic Qualification
              </label>
              <div style={{ position: 'relative' }}>
                <Award size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  className="input-field"
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  placeholder="e.g. Ph.D. in Software Engineering, M.Sc."
                  style={{ width: '100%', paddingLeft: '2.4rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '0.375rem', fontWeight: '500' }}>
                Contact Phone Number
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  className="input-field"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 019-2834"
                  style={{ width: '100%', paddingLeft: '2.4rem' }}
                />
              </div>
            </div>

            <div style={{ marginTop: '0.5rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
                style={{ width: '100%', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem' }}
              >
                <Save size={16} /> {saving ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
