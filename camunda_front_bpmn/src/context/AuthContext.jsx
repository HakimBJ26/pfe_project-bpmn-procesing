import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (username, password) => {
    const response = await authService.login(username, password);
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    return response;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const register = async (username, email, password) => {
    const response = await authService.register(username, email, password);
    return response;
  };

  const value = {
    user,
    login,
    logout,
    register,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
