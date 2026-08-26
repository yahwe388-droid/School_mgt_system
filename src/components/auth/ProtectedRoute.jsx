import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Alert } from '../common/Alert';

export const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen text="Verifying credentials & session..." />;
  }

  if (!isAuthenticated) {
    return null; // Will trigger login view in App router
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div style={{ padding: '2rem', maxWidth: '600px', margin: '3rem auto' }}>
        <Alert
          type="error"
          message={`Access Denied: Your account role (${user.role}) is not authorized to access this module.`}
        />
      </div>
    );
  }

  return <>{children}</>;
};
