import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { ChangePasswordModal } from './ChangePasswordModal';

export const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { user, isAuthenticated, loading, navigate, getRoleDashboardPath } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen text="Verifying credentials & authorization..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  // Force password change before allowing access to operational dashboard
  if (user?.must_change_password) {
    return <ChangePasswordModal />;
  }

  const userRole = (user?.role || '').toUpperCase();
  const normalizedAllowed = allowedRoles.map(r => r.toUpperCase());

  if (normalizedAllowed.length > 0 && !normalizedAllowed.includes(userRole)) {
    return (
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem'
      }}>
        <div className="glass-card" style={{
          maxWidth: '480px',
          width: '100%',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid rgba(239, 68, 68, 0.3)'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            color: '#ef4444',
            marginBottom: '1rem'
          }}>
            <ShieldAlert size={36} />
          </div>
          <h2 style={{ fontSize: '1.25rem', color: '#ef4444', fontWeight: '700' }}>
            403 - Access Denied
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: '1.5' }}>
            You do not have permission to access this resource. Your authenticated role (<strong>{userRole}</strong>) is not authorized for this module.
          </p>
          <button
            onClick={() => navigate(getRoleDashboardPath(userRole))}
            className="btn btn-primary"
            style={{ marginTop: '1.5rem', width: '100%', justifyContent: 'center' }}
          >
            <ArrowLeft size={16} /> Return to Your Authorized Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

