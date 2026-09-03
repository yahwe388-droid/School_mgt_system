import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle, Shield, Hash, Building2, Mail, Phone, MapPin } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../common/Alert';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const SchoolSettingsManager = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [settings, setSettings] = useState({
    name: '',
    motto: '',
    logoUrl: '',
    studentIdPrefix: 'KM',
    studentIdSequence: 34567,
    studentIdYear: '18',
    email: '',
    phone: '',
    address: '',
    academicYear: '',
    term: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError('');
    const res = await api.get('/admin/settings', token);
    if (res.success && res.settings) {
      setSettings(res.settings);
    } else {
      setError(res.message || 'Unable to load school settings.');
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    const res = await api.put('/admin/settings', settings, token);
    setSaving(false);
    if (res.success) {
      setMessage('School & System configuration saved successfully!');
      if (res.settings) setSettings(res.settings);
      setTimeout(() => setMessage(''), 4000);
    } else {
      setError(res.message || 'Failed to update school settings.');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading School & System Configuration..." />;
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div className="glass-card" style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          color: '#818cf8'
        }}>
          <Settings size={28} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.35rem', color: '#ffffff', fontWeight: '700' }}>School & System Settings</h2>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Configure institutional profile, academic term parameters, and automatic Student ID sequencing.
          </p>
        </div>
      </div>

      {message && <Alert type="success" message={message} />}
      {error && <Alert type="error" message={error} />}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Institutional Profile */}
        <div className="glass-card" style={{ padding: '1.75rem 2rem' }}>
          <h3 style={{ fontSize: '1.05rem', color: '#ffffff', fontWeight: '600', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={18} color="#818cf8" /> Institutional Identity
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">School Name *</label>
              <input
                type="text"
                required
                className="form-input"
                value={settings.name}
                onChange={(e) => setSettings({ ...settings, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Motto / Tagline</label>
              <input
                type="text"
                className="form-input"
                value={settings.motto}
                onChange={(e) => setSettings({ ...settings, motto: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Logo Path / URL</label>
              <input
                type="text"
                className="form-input"
                value={settings.logoUrl}
                onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Email</label>
              <input
                type="email"
                className="form-input"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input
                type="text"
                className="form-input"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Campus Physical Address</label>
              <input
                type="text"
                className="form-input"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Student ID Generation Configuration */}
        <div className="glass-card" style={{ padding: '1.75rem 2rem' }}>
          <h3 style={{ fontSize: '1.05rem', color: '#ffffff', fontWeight: '600', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Hash size={18} color="#22d3ee" /> Student ID Generation Parameters
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
            Template: <strong>[PREFIX]/[SEQUENCE]/[YEAR]</strong> (e.g. <code>{settings.studentIdPrefix || 'KM'}/{settings.studentIdSequence || 34567}/{settings.studentIdYear || '18'}</code>).
            New students are assigned sequential numbers in alphabetical order of registration. Existing assigned IDs are immutable.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">ID Prefix</label>
              <input
                type="text"
                required
                className="form-input"
                style={{ fontFamily: 'monospace', fontWeight: '700' }}
                value={settings.studentIdPrefix}
                onChange={(e) => setSettings({ ...settings, studentIdPrefix: e.target.value.toUpperCase() })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Year Suffix</label>
              <input
                type="text"
                required
                className="form-input"
                style={{ fontFamily: 'monospace', fontWeight: '700' }}
                value={settings.studentIdYear}
                onChange={(e) => setSettings({ ...settings, studentIdYear: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Sequence Baseline</label>
              <input
                type="number"
                required
                className="form-input"
                style={{ fontFamily: 'monospace' }}
                value={settings.studentIdSequence}
                onChange={(e) => setSettings({ ...settings, studentIdSequence: parseInt(e.target.value, 10) || 0 })}
              />
            </div>
          </div>
        </div>

        {/* Academic Term Parameters */}
        <div className="glass-card" style={{ padding: '1.75rem 2rem' }}>
          <h3 style={{ fontSize: '1.05rem', color: '#ffffff', fontWeight: '600', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={18} color="#10b981" /> Academic Session
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div className="form-group">
              <label className="form-label">Active Academic Year</label>
              <input
                type="text"
                className="form-input"
                value={settings.academicYear}
                onChange={(e) => setSettings({ ...settings, academicYear: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Active Semester / Term</label>
              <input
                type="text"
                className="form-input"
                value={settings.term}
                onChange={(e) => setSettings({ ...settings, term: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
            style={{ padding: '0.875rem 2rem', fontSize: '0.95rem' }}
          >
            <Save size={18} /> {saving ? 'Saving Changes...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
};
