import React, { createContext, useState, useEffect } from 'react';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  useEffect(() => {
    const verifyToken = async () => {
      setLoading(true);
      try {
        const response = await api.get('/auth/verify');
        setUser(response.data.user);
        setIsAuthenticated(true);
      } catch (err) {
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    verifyToken();
  }, [token]);

  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/register', { name, email, password });
      setUser(response.data.user);
      setIsAuthenticated(true);
      setLoading(false);
      if (response.data.requiresMFA) {
        return { mfa: true };
      }
      return { success: true };
    } catch (err) {
      const backendError = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg;
      setError(backendError || 'Registration failed');
      setIsAuthenticated(false);
      setLoading(false);
      if (err.response?.data?.requiresMFA) {
        return { mfa: true };
      }
      return { success: false, error: backendError || 'Registration failed' };
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      setUser(response.data.user);
      setIsAuthenticated(true);
      setLoading(false);
      return { success: true };
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      setIsAuthenticated(false);
      setLoading(false);
      if (err.response?.data?.requiresMFA) {
        return {
          success: false,
          mfa: true,
          tempToken: err.response.data.tempToken
        };
      }
      return {
        success: false
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  };

  const value = {
    user,
    token,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 