import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('auth_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' | 'register'
  const [sessionExpiredMessage, setSessionExpiredMessage] = useState('');

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }, []);

  // Validate token with backend on mount
  useEffect(() => {
    let cancelled = false;
    async function verifySession() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await api.getMe();
        if (cancelled) return;
        setUser(data.user);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
      } catch {
        // Token invalid or expired
        if (!cancelled) logout();
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    verifySession();

    // Listen for 401 expired event from api client
    const handleExpired = () => {
      logout();
      setSessionExpiredMessage('Your session has expired. Please log in again.');
      setAuthModalTab('login');
      setAuthModalOpen(true);
    };

    window.addEventListener('auth:expired', handleExpired);
    return () => { cancelled = true; window.removeEventListener('auth:expired', handleExpired); };
  }, [token, logout]);

  const login = async (email, password) => {
    const data = await api.login({ email, password });
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));
    setAuthModalOpen(false);
    setSessionExpiredMessage('');
    return data;
  };

  const register = async (name, email, password) => {
    const data = await api.register({ name, email, password });
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_user', JSON.stringify(data.user));
    setAuthModalOpen(false);
    setSessionExpiredMessage('');
    return data;
  };



  const openAuthModal = (tab = 'login') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
    setSessionExpiredMessage('');
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    isAdmin: Boolean(user && user.role === 'admin'),
    loading,
    authModalOpen,
    authModalTab,
    sessionExpiredMessage,
    openAuthModal,
    closeAuthModal,
    setAuthModalTab,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
