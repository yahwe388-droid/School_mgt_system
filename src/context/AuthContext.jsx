import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('schoolMgt_token'));
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('schoolMgt_theme') || 'light');

  // Verify token on initial load
  useEffect(() => {
    const verifySession = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const data = await api.get('/auth/me', token);
        if (data.success) {
          setUser(data.user);
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

  const login = async (email, password) => {
    try {
      const data = await api.post('/auth/login', { email, password });
      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('schoolMgt_token', data.token);
        return { success: true, user: data.user };
      } else {
        return { success: false, message: data.message || 'Login failed' };
      }
    } catch (err) {
      return { success: false, message: 'Network error or backend server unreachable.' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('schoolMgt_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        role: user?.role || null,
        theme,
        toggleTheme
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
