import React, { useState, useEffect } from 'react';
import { Building, Save, Check } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../common/Alert';

export const SchoolProfileManager = () => {
  const { token } = useAuth();
  const [profile, setProfile] = useState({
    name: '',
    motto: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    activeAcademicYear: '',
    activeTerm: ''
  });
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const data = await api.get('/school/profile');
    if (data.success && data.profile) {
      setProfile(data.profile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    const data = await api.post('/school/profile', profile, token);
    setSaving(false);
    if (data.success) {
      setMessage('School Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="glass-card" style={{ padding: '1.5rem', maxWidth: '800px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
        <Building size={24} color="var(--primary)" />
        <div>
          <h3 style={{ fontSize: '1.125rem' }}>School Basic Setup & Configuration</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Manage institutional metadata and active term parameters.</p>
        </div>
      </div>

      {message && <Alert type="success" message={message} />}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label">School Name</label>
            <input
              type="text"
              required
              className="form-input"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Motto / Tagline</label>
            <input
              type="text"
              className="form-input"
              value={profile.motto}
              onChange={(e) => setProfile({ ...profile, motto: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contact Email</label>
            <input
              type="email"
              className="form-input"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contact Phone</label>
            <input
              type="text"
              className="form-input"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ gridColumn: 'span 2' }}>
            <label className="form-label">Campus Physical Address</label>
            <input
              type="text"
              className="form-input"
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Active Academic Year</label>
            <input
              type="text"
              className="form-input"
              value={profile.activeAcademicYear}
              onChange={(e) => setProfile({ ...profile, activeAcademicYear: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Active Term / Semester</label>
            <input
              type="text"
              className="form-input"
              value={profile.activeTerm}
              onChange={(e) => setProfile({ ...profile, activeTerm: e.target.value })}
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary" disabled={saving} style={{ marginTop: '1rem' }}>
          <Save size={18} /> {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </form>
    </div>
  );
};
