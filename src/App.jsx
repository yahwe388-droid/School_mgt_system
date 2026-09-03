import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ChangePasswordModal } from './components/auth/ChangePasswordModal';
import { AppShell } from './components/layout/AppShell';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { TeacherDashboard } from './components/dashboards/TeacherDashboard';
import { StudentDashboard } from './components/dashboards/StudentDashboard';
import { ParentDashboard } from './components/dashboards/ParentDashboard';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { ErrorBoundary } from './components/common/ErrorBoundary';

const MainContent = () => {
  const { user, isAuthenticated, loading, currentPath, getRoleDashboardPath } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen text="Initializing EduCore Portal..." />;
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  // Force password change on first login
  if (user?.must_change_password || currentPath === '/change-password') {
    return <ChangePasswordModal />;
  }

  const role = (user?.role || '').toUpperCase();

  // Route & Role Matching
  const renderDashboardByRoute = () => {
    // Check if accessing admin route
    if (currentPath.startsWith('/admin')) {
      return (
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <AdminDashboard />
        </ProtectedRoute>
      );
    }

    // Check if accessing teacher route
    if (currentPath.startsWith('/teacher')) {
      return (
        <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
          <TeacherDashboard />
        </ProtectedRoute>
      );
    }

    // Check if accessing student route
    if (currentPath.startsWith('/student')) {
      return (
        <ProtectedRoute allowedRoles={['STUDENT', 'ADMIN']}>
          <StudentDashboard />
        </ProtectedRoute>
      );
    }

    // Check if accessing parent route
    if (currentPath.startsWith('/parent')) {
      return (
        <ProtectedRoute allowedRoles={['PARENT', 'ADMIN']}>
          <ParentDashboard />
        </ProtectedRoute>
      );
    }

    // Default route mapping based on user's authenticated database role
    switch (role) {
      case 'ADMIN':
        return (
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        );
      case 'TEACHER':
        return (
          <ProtectedRoute allowedRoles={['TEACHER']}>
            <TeacherDashboard />
          </ProtectedRoute>
        );
      case 'STUDENT':
        return (
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentDashboard />
          </ProtectedRoute>
        );
      case 'PARENT':
        return (
          <ProtectedRoute allowedRoles={['PARENT']}>
            <ParentDashboard />
          </ProtectedRoute>
        );
      default:
        return (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
            Invalid or Unrecognized System Role
          </div>
        );
    }
  };

  return <AppShell>{renderDashboardByRoute()}</AppShell>;
};

export const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <MainContent />
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;

