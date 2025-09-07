
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const storedToken = localStorage.getItem('auth_token');
      if (storedToken) {
        console.log('Found stored token, checking validity...');
        await checkAuth(storedToken);
      } else {
        console.log('No stored token found');
        setLoading(false);
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setLoading(false);
    }
  };

  const checkAuth = async (authToken) => {
    try {
      console.log('Checking auth with token...');
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Auth check response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Auth check successful:', data.user.username);
        setUser(data.user);
        setToken(authToken);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.log('Auth check failed:', errorData);
        // Token is invalid, remove it
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check network error:', error);
      localStorage.removeItem('auth_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      console.log('Attempting login for:', username);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log('Login response:', response.status, data.success ? 'Success' : data.error);

      if (response.ok) {
        localStorage.setItem('auth_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Login network error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const register = async (userData) => {
    try {
      console.log('Attempting registration for:', userData.username);
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      console.log('Registration response:', response.status, data.success ? 'Success' : data.error);

      if (response.ok) {
        localStorage.setItem('auth_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Registration network error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    console.log('Logging out user');
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
    checkAuth // Expose for manual token refresh
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
