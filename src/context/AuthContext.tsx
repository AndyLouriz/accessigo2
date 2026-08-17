import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  signup: (fullName: string, email: string, password: string, disabilityType: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // true on mount while we check session
  const [authError, setAuthError] = useState<string | null>(null);

  // On mount: try to restore session from cookie via /api/auth/me
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
        }
      } catch {
        // Network error or server down — remain logged out
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();
  }, []);

  const signup = useCallback(async (
    fullName: string,
    email: string,
    password: string,
    disabilityType: string
  ): Promise<boolean> => {
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ fullName, email, password, disabilityType }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Signup failed. Please try again.');
        return false;
      }
      setCurrentUser(data.user);
      return true;
    } catch {
      setAuthError('Network error. Please check your connection and try again.');
      return false;
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Login failed. Please try again.');
        return false;
      }
      setCurrentUser(data.user);
      return true;
    } catch {
      setAuthError('Network error. Please check your connection and try again.');
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // Best-effort logout — clear client state regardless
    }
    setCurrentUser(null);
  }, []);

  const clearAuthError = useCallback(() => setAuthError(null), []);

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAuthenticated: !!currentUser,
      isLoading,
      authError,
      signup,
      login,
      logout,
      clearAuthError,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
