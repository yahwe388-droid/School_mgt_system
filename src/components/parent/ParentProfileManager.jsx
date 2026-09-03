import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, HeartHandshake, Shield, CheckCircle, Save, MapPin, Lock, GraduationCap } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../common/Alert';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const ParentProfileManager = () => {
  const { token, user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    phone: '',
    address: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/parent/profile', token);
      if (res.success && res.profile) {
        setProfile(res.profile);
        setFormData({
          phone: res.profile.phone || res.profile.parent?.phone || '',
          address: res.profile.address || res.profile.parent?.address || '742 Evergreen Terrace, Springfield'
        });
      } else {
        setError(res.message || 'Failed to retrieve guardian profile.');
      }
    } catch (err) {
      setError('An error occurred retrieving parent profile.');
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
      const res = await api.put('/parent/profile', formData, token);
      if (res.success) {
        setSuccess('Guardian contact preferences updated successfully.');
        if (updateUser) {
          updateUser({ phone: formData.phone });
        }
      } else {
        setError(res.message || 'Failed to update parent profile.');
      }
    } catch (err) {
      setError('An error occurred submitting profile updates.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving guardian credentials..." />;
  }

  const children = profile?.children || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px' }}>
      {/* Header */}
      <div className="glass-card" style={{ padding: '1.5rem 2rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#ffffff', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <HeartHandshake size={24} color="#f59e0b" /> Parent & Guardian Profile
        </h2>
        <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '0.25rem' }}>
          Manage your verified family contact details and linked student dependents.
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
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              border: '2px solid rgba(245, 158, 11, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fbbf24',
              fontWeight: 'bold',
              fontSize: '1.5rem'
            }}>
              {(user?.name || 'P')[0].toUpperCase()}
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', color: '#ffffff', fontWeight: '600' }}>{user?.name}</h3>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.75rem',
                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                color: '#fbbf24',
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px',
                marginTop: '0.35rem',
                fontWeight: '600'
              }}>
                <HeartHandshake size={12} /> VERIFIED GUARDIAN
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={15} /> Registered Email
              </span>
              <span style={{ color: '#ffffff' }}>{user?.email || 'parent@educore.edu'}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Lock size={15} /> System Role
              </span>
              <span style={{ color: '#f59e0b', fontWeight: '600' }}>PARENT (Read-Only Authorization)</span>
            </div>

            <div style={{ padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <GraduationCap size={15} /> Linked Dependents ({children.length})
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {children.map(c => (
                  <span key={c.id} style={{
                    fontSize: '0.75rem',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    color: '#e2e8f0',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '4px',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}>
                    {c.name} ({c.studentId || c.id})
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0' }}>
              <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={15} /> Account Security
              </span>
              <span style={{ color: '#34d399', fontWeight: '600' }}>Verified by Registrar</span>
            </div>
          </div>
        </div>

        {/* Edit Contact Details Card */}
        <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.0625rem', color: '#ffffff', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={18} color="#f59e0b" /> Contact Information
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '0.375rem', fontWeight: '500' }}>
                Emergency Contact Phone
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  className="input-field"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 234-5678"
                  style={{ width: '100%', paddingLeft: '2.4rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '0.375rem', fontWeight: '500' }}>
                Residential / Mailing Address
              </label>
              <div style={{ position: 'relative' }}>
                <MapPin size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input
                  type="text"
                  className="input-field"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street Address, City, State, ZIP"
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
                <Save size={16} /> {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
