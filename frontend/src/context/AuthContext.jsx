import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_USERS } from '../api/mockData';
import { checkBackendHealth } from '../api/apiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Start with null — user MUST log in
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
  const [isSimulatingConcurrency, setIsSimulatingConcurrency] = useState(false);

  useEffect(() => {
    // Check backend health periodically
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

    // Try live backend auth endpoint first
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data = await res.json();
        const matched = INITIAL_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
        const authedUser = matched || {
          userID: 'authed-usr-1',
          email,
          firstName: 'Verified',
          lastName: 'User',
          role_name: data.roleName || 'admin',
          branchID: data.branchID || null,
          branchName: 'Main Branch'
        };
        setCurrentUser(authedUser);
        localStorage.setItem('stockwear_token', data.accessToken);
        localStorage.setItem('stockwear_current_user', JSON.stringify(authedUser));
        localStorage.setItem('stockline_token', data.accessToken);
        localStorage.setItem('stockline_current_user', JSON.stringify(authedUser));
        return { success: true };
      }
    } catch {
      // Backend not running; fallback to demo credential validation
    }

    // Demo credentials fallback — validate both email AND password
    // Normalize email prefix so both @stockwearkicks.com and @stockline.com work interchangeably
    const normalizeEmail = (e) =>
      e.toLowerCase().trim()
        .replace('@stockwearkicks.com', '')
        .replace('@stockline.com', '')
        .replace('@stockwear-kicks.com', '');

    const matched = INITIAL_USERS.find(
      u =>
        (u.email.toLowerCase() === email.toLowerCase() ||
         normalizeEmail(u.email) === normalizeEmail(email)) &&
        u.password === password
    );
    if (matched) {
      setCurrentUser(matched);
      localStorage.setItem('stockwear_current_user', JSON.stringify(matched));
      localStorage.setItem('stockline_current_user', JSON.stringify(matched));
      return { success: true };
    }
    return { success: false, message: 'Invalid email or password. Please check your credentials and try again.' };
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
        backendOnline,
        isSimulatingConcurrency,
        setIsSimulatingConcurrency
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
