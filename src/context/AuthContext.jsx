import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('schoolMgt_token'));
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('schoolMgt_theme') || 'dark');
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname || '/login');

  // Navigate helper that updates browser history and local state
  const navigate = useCallback((path) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
  }, []);

  // Listen to browser forward/backward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Compute default dashboard based on backend-stored user role
  const getRoleDashboardPath = (role) => {
    const normalized = (role || '').toUpperCase();
    switch (normalized) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'TEACHER':
        return '/teacher/dashboard';
      case 'STUDENT':
        return '/student/dashboard';
      case 'PARENT':
        return '/parent/dashboard';
      default:
        return '/login';
    }
  };

  // Verify token on initial load
  useEffect(() => {
    const verifySession = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        if (currentPath !== '/login' && currentPath !== '/forgot-password') {
          navigate('/login');
        }
        return;
      }

      try {
        const data = await api.get('/auth/me', token);
        if (data.success && data.user) {
          setUser(data.user);
          if (data.user.must_change_password) {
            navigate('/change-password');
          }
        } else {
          // Token invalid or expired
          logout();
        }
      } catch (err) {
        console.error('Session verification failed:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [token]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('schoolMgt_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const login = async (usernameOrEmail, password) => {
    try {
      const data = await api.post('/auth/login', { usernameOrEmail, password });
      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('schoolMgt_token', data.token);

        if (data.must_change_password || data.user.must_change_password) {
          navigate('/change-password');
        } else {
          navigate(getRoleDashboardPath(data.user.role));
        }
        return { success: true, user: data.user, must_change_password: data.must_change_password };
      } else {
        return { success: false, message: data.message || 'Invalid username/email or password.' };
      }
    } catch (err) {
      return { success: false, message: 'Invalid username/email or password.' };
    }
  };

  const changePassword = async (currentPassword, newPassword, confirmPassword) => {
    try {
      const data = await api.post(
        '/auth/change-password',
        { currentPassword, newPassword, confirmPassword },
        token
      );
      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('schoolMgt_token', data.token);
        navigate(getRoleDashboardPath(data.user.role));
        return { success: true, message: data.message, user: data.user };
      } else {
        return { success: false, message: data.message || 'Password update failed.' };
      }
    } catch (err) {
      return { success: false, message: 'Failed to update password.' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('schoolMgt_token');
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        currentPath,
        navigate,
        login,
        changePassword,
        logout,
        isAuthenticated: !!user,
        role: user?.role ? user.role.toUpperCase() : null,
        getRoleDashboardPath,
        theme,
        toggleTheme
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

