'use client';

import React, { createContext, useContext, useState, useMemo, useCallback, ReactNode } from 'react';
import { PublicUser } from '@/features/auth/types/auth.types';
import { useRouter } from 'next/navigation';
import { authService } from '@/features/auth/services/auth.service';

interface AuthContextType {
  user: PublicUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: PublicUser, token: string) => void;
  logout: () => void;
  updateUser: (user: PublicUser) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { readonly children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? (JSON.parse(storedUser) as PublicUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('token');
    } catch {
      return null;
    }
  });
  const [isLoading] = useState(false);
  const router = useRouter();

  const login = useCallback((newUser: PublicUser, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    document.cookie = `token=${newToken}; path=/; max-age=604800; SameSite=Strict`;
    router.push('/profile');
  }, [router]);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    document.cookie = `token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    router.push('/login');
  }, [router]);

  const updateUser = useCallback((updatedUser: PublicUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }, []);

  const contextValue = useMemo<AuthContextType>(
    () => ({ user, token, isAuthenticated: !!token, isLoading, login, logout, updateUser }),
    [user, token, isLoading, login, logout, updateUser],
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
