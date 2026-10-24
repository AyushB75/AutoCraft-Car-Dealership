import React, { createContext, useContext, useState, useEffect } from 'react';
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

  // Validate token with backend on mount
  useEffect(() => {
    async function verifySession() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await api.getMe();
        setUser(data.user);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
      } catch (err) {
        // Token invalid or expired
        logout();
      } finally {
        setLoading(false);
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
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, [token]);

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

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
