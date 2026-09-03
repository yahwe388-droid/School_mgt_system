import React, { useState, useRef } from 'react';
import { Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck, HelpCircle, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '../common/Alert';

export const LoginForm = () => {
  const { login } = useAuth();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const isSubmittingRef = useRef(false);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (isSubmittingRef.current || submitting) return;

    if (!usernameOrEmail.trim() || !password) {
      setError('Please provide both username/email and password.');
      return;
    }

    isSubmittingRef.current = true;
    setSubmitting(true);
    setError('');

    try {
      const res = await login(usernameOrEmail.trim(), password);
      if (!res.success) {
        setError(res.message || 'Invalid username/email or password.');
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      isSubmittingRef.current = false;
      setSubmitting(false);
    }
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
        boxShadow: 'var(--shadow-xl)',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            padding: '3px',
            background: 'rgba(99, 102, 241, 0.1)',
            marginBottom: '1rem',
            border: '2px solid rgba(99, 102, 241, 0.25)',
            boxShadow: '0 8px 25px rgba(99,102,241,0.25)',
            overflow: 'hidden'
          }}>
            <img src="/logo.png" alt="EduCore Logo" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
          </div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)', fontWeight: '700' }}>EduCore Management Portal</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Secure Role-Based Authentication Portal
          </p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {/* Single Secure Login Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" htmlFor="usernameOrEmail">Username or Email</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              <input
                id="usernameOrEmail"
                type="text"
                required
                disabled={submitting}
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Enter your username or email"
                value={usernameOrEmail}
                onChange={(e) => setUsernameOrEmail(e.target.value)}
                autoComplete="username"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
              <label className="form-label" htmlFor="password" style={{ marginBottom: 0 }}>Password</label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--primary)',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                Forgot Password?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                disabled={submitting}
                className="form-input"
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.875rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '2px'
                }}
                title={showPassword ? 'Hide Password' : 'Show Password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '0.875rem',
              marginTop: '0.5rem',
              fontSize: '0.9375rem',
              opacity: submitting ? 0.7 : 1,
              cursor: submitting ? 'not-allowed' : 'pointer'
            }}
          >
            {submitting ? 'Authenticating...' : 'Sign In to Portal'} <ArrowRight size={18} />
          </button>
        </form>

        {/* Security Notice Footer */}
        <div style={{
          marginTop: '1.75rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          color: 'var(--text-muted)',
          fontSize: '0.75rem'
        }}>
          <ShieldCheck size={16} color="var(--primary)" />
          <span>Role-Based Access Control • 256-bit Encrypted</span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="glass-card" style={{
            width: '100%',
            maxWidth: '420px',
            padding: '2rem',
            boxShadow: 'var(--shadow-xl)',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowForgotModal(false)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <HelpCircle size={24} color="var(--primary)" />
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', margin: 0 }}>Password Reset Assistance</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '1.25rem' }}>
              To maintain institutional security, self-service password reset is disabled. Please reach out to the school <strong>System Administrator</strong> to generate a secure temporary password.
            </p>
            <div style={{
              backgroundColor: 'rgba(99, 102, 241, 0.08)',
              padding: '0.875rem',
              borderRadius: '8px',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              fontSize: '0.8125rem',
              color: 'var(--text-main)',
              marginBottom: '1.5rem'
            }}>
              <strong>Contact Admin:</strong> admin@school.com<br />
              <strong>Administration Office:</strong> Ext. 101 / Room 100
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowForgotModal(false)}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

