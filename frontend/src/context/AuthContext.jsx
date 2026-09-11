import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState(() => {
    const access = localStorage.getItem('sentinel_access_token');
    const refresh = localStorage.getItem('sentinel_refresh_token');
    return access && refresh ? { access, refresh } : null;
  });
  const [loading, setLoading] = useState(true);

  const clearAuth = useCallback(() => {
    localStorage.removeItem('sentinel_access_token');
    localStorage.removeItem('sentinel_refresh_token');
    setTokens(null);
    setUser(null);
  }, []);

  const saveTokens = useCallback((access, refresh) => {
    localStorage.setItem('sentinel_access_token', access);
    localStorage.setItem('sentinel_refresh_token', refresh);
    setTokens({ access, refresh });
  }, []);

  const fetchCurrentUser = useCallback(async (accessToken) => {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    return res.json();
  }, []);

  // Load user on mount if we have a token
  useEffect(() => {
    async function init() {
      if (!tokens?.access) {
        setLoading(false);
        return;
      }
      const userData = await fetchCurrentUser(tokens.access);
      if (userData) {
        setUser(userData);
      } else {
        // Access token expired, try refresh
        try {
          const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: tokens.refresh }),
          });
          if (refreshRes.ok) {
            const { access_token, refresh_token } = await refreshRes.json();
            saveTokens(access_token, refresh_token);
            const refreshedUser = await fetchCurrentUser(access_token);
            setUser(refreshedUser);
          } else {
            clearAuth();
          }
        } catch {
          clearAuth();
        }
      }
      setLoading(false);
    }
    init();
  }, []);

  const login = async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Login failed');
    }
    const { access_token, refresh_token } = await res.json();
    saveTokens(access_token, refresh_token);
    const userData = await fetchCurrentUser(access_token);
    setUser(userData);
    return userData;
  };

  const register = async ({ name, email, password, org_id }) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, org_id }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Registration failed');
    }
    const { access_token, refresh_token } = await res.json();
    saveTokens(access_token, refresh_token);
    const userData = await fetchCurrentUser(access_token);
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    if (tokens?.access) {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokens.access}` },
      }).catch(() => {});
    }
    clearAuth();
  };

  const getAuthHeader = () =>
    tokens?.access ? { Authorization: `Bearer ${tokens.access}` } : {};

  const value = {
    user,
    tokens,
    loading,
    login,
    register,
    logout,
    clearAuth,
    getAuthHeader,
    isAuthenticated: !!user,
    orgId: user?.org_id,
    role: user?.role,
    isAdmin: user?.role === 'admin',
    isAnalyst: user?.role === 'admin' || user?.role === 'analyst',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export default AuthContext;