// src/context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '@service/api-client';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: any) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Función para verificar si hay sesión al cargar la página
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // Usamos el id guardado o un endpoint 'me' si lo tienes
      // Por ahora simulamos con el token existente
      setUser({ authenticated: true }); 
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials: any) => {
    const response = await apiClient.auth.login(credentials);
    if (response.token) {
      localStorage.setItem('token', response.token);
      setUser(response.user || { authenticated: true });
      router.push('/dashboard');
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return context;
};