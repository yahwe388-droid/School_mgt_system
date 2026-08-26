import React, { useState } from 'react';
import { Lock, Mail, GraduationCap, ShieldCheck, UserCheck, Users, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../common/Alert';

export const LoginForm = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const demoAccounts = [
    { role: 'Admin', email: 'admin@school.com', pass: 'admin123', icon: ShieldCheck, color: '#6366f1' },
    { role: 'Teacher', email: 'teacher@school.com', pass: 'teacher123', icon: UserCheck, color: '#06b6d4' },
    { role: 'Student', email: 'student@school.com', pass: 'student123', icon: GraduationCap, color: '#10b981' },
    { role: 'Parent', email: 'parent@school.com', pass: 'parent123', icon: Users, color: '#f59e0b' },
  ];

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError('');
    setSubmitting(true);

    const res = await login(email, password);
    setSubmitting(false);

    if (!res.success) {
      setError(res.message);
    }
  };

  const handleDemoClick = (account) => {
    setEmail(account.email);
    setPassword(account.pass);
    setError('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-main)',
      padding: '1.5rem'
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '460px',
        padding: '2.5rem 2rem',
        boxShadow: 'var(--shadow-xl)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            marginBottom: '1rem',
            boxShadow: '0 8px 20px rgba(99,102,241,0.3)'
          }}>
            <GraduationCap size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)' }}>School Management System</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Phase 1: Secure Role-Based Authentication Portal
          </p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              <input
                type="email"
                required
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="name@school.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              <input
                type="password"
                required
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', marginTop: '0.5rem', fontSize: '0.9375rem' }}
          >
            {submitting ? 'Authenticating...' : 'Sign In to Portal'} <ArrowRight size={18} />
          </button>
        </form>

        {/* Demo Fast-Login Section */}
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', display: 'block', marginBottom: '0.75rem', textAlign: 'center' }}>
            Quick Demo Login Accounts (Phase 1)
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
            {demoAccounts.map((acc) => {
              const Icon = acc.icon;
              return (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleDemoClick(acc)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-main)',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Icon size={16} color={acc.color} />
                  <span>{acc.role}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
