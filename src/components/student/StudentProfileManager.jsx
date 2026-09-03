import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, GraduationCap, Shield, CheckCircle, Save, Hash, Lock, Building } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../common/Alert';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const StudentProfileManager = () => {
  const { token, user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    phone: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/student/profile', token);
      if (res.success && res.profile) {
        setProfile(res.profile);
        setFormData({
          phone: res.profile.phone || res.profile.student?.phone || ''
        });
      } else {
        setError(res.message || 'Failed to retrieve student profile.');
      }
    } catch (err) {
      setError('An error occurred retrieving student profile.');
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
      const res = await api.put('/student/profile', formData, token);
      if (res.success) {
        setSuccess('Student profile contact updated successfully.');
        if (updateUser) {
          updateUser({ phone: formData.phone });
        }
      } else {
        setError(res.message || 'Failed to update student profile.');
      }
    } catch (err) {
      setError('An error occurred submitting profile updates.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving student credentials..." />;
  }

  const student = profile?.student || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px' }}>
      {/* Header */}
      <div className="glass-card" style={{ padding: '1.5rem 2rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <GraduationCap size={24} color="#10b981" /> Official Student Profile & Academic Identity
        </h2>
        <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '0.25rem' }}>
          Institutional identification, enrolled class cohort, and verified student credentials.
        </p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Identity & Credentials Card */}
        <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '2px solid rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34d399',
              fontWeight: 'bold',
              fontSize: '1.5rem'
            }}>
              {(user?.name || 'S')[0].toUpperCase()}
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', color: '#ffffff', fontWeight: '600' }}>{user?.name}</h3>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                color: '#34d399',
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px',
                marginTop: '0.35rem',
                fontWeight: '600'
              }}>
                <GraduationCap size={12} /> ENROLLED SCHOLAR
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Hash size={15} /> Student ID
              </span>
              <span style={{ color: '#ffffff', fontWeight: '600', fontFamily: 'monospace' }}>
                {student.studentId || student.id || user?.studentId || 'STU-1001'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building size={15} /> Enrolled Class
              </span>
              <span style={{ color: '#10b981', fontWeight: '600' }}>
                {student.classId || user?.grade || 'Class 12 - Senior'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={15} /> Institutional Email
              </span>
              <span style={{ color: '#ffffff' }}>{user?.email || 'student@educore.edu'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Lock size={15} /> Security Role
              </span>
              <span style={{ color: '#38bdf8', fontWeight: '600' }}>STUDENT (Immutable)</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0' }}>
              <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={15} /> Enrollment Status
              </span>
              <span style={{ color: '#34d399', fontWeight: '600' }}>Active & Registered</span>
            </div>
          </div>
        </div>

        {/* Edit Contact Details Card */}
        <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.0625rem', color: '#ffffff', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={18} color="#10b981" /> Contact Preferences
          </h3>

          <div style={{ padding: '0.85rem', backgroundColor: 'rgba(16, 185, 129, 0.08)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: '0.8125rem', color: '#94a3b8' }}>
            <strong style={{ color: '#34d399' }}>Institutional Security Notice:</strong> Student ID, Academic Class, and System Role are verified and locked by the central administration. For cohort transfers, please contact the School Registrar.
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '0.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '0.375rem', fontWeight: '500' }}>
                Emergency / Personal Phone Number
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  className="input-field"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 012-3456"
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
                <Save size={16} /> {saving ? 'Saving...' : 'Update Contact Info'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
