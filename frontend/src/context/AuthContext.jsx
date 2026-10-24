import React, { createContext, useContext, useState, useEffect } from 'react';
import { checkBackendHealth } from '../api/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('stockwear_current_user') || localStorage.getItem('stockline_current_user');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  const [backendOnline, setBackendOnline] = useState(false);

  useEffect(() => {
    const verifyBackend = async () => {
      const isOnline = await checkBackendHealth();
      setBackendOnline(isOnline);
    };
    verifyBackend();
    const interval = setInterval(verifyBackend, 15000);
    return () => clearInterval(interval);
  }, []);

  const login = async (email, password) => {
    if (!email || !password) {
      return { success: false, message: 'Please enter both email and password.' };
    }

    const cleanEmail = email.trim().toLowerCase();

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.accessToken) {
        const authedUser = data.user || {
          userID: data.userID,
          email,
          firstName: data.firstName || 'Staff',
          lastName: data.lastName || 'User',
          role_name: data.roleName || 'cashier',
          branchID: data.branchID || null,
          branchName: data.branchName || 'Assigned Branch'
        };

        setCurrentUser(authedUser);
        setBackendOnline(true);
        localStorage.setItem('stockwear_token', data.accessToken);
        localStorage.setItem('stockwear_current_user', JSON.stringify(authedUser));
        localStorage.setItem('stockline_token', data.accessToken);
        localStorage.setItem('stockline_current_user', JSON.stringify(authedUser));
        return { success: true };
      }

      return {
        success: false,
        message: data.message || 'Invalid email or password.'
      };
    } catch (err) {
      return {
        success: false,
        message: 'Backend is offline. Please start the server and try again.'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('stockwear_token');
    localStorage.removeItem('stockwear_current_user');
    localStorage.removeItem('stockline_token');
    localStorage.removeItem('stockline_current_user');
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        logout,
        backendOnline
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
