'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@hooks/useAuth';

interface AuthContextType {
  user: any | null;
  isAuthenticated: boolean;
  login: (credentials: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { login: authLogin, logout, loading: authLoading } = useAuth();
  const [user, setUser] = useState<any | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Lógica para recuperar sesión al cargar la app
    const token = localStorage.getItem('token');
    if (token) {
      // Aquí podrías llamar a apiClient.usuarios.getById('me') 
      // Por ahora simulamos el usuario
      setUser({ authenticated: true }); 
    }
    setInitializing(false);
  }, []);

  const login = async (credentials: any) => {
    const result = await authLogin(credentials);
    if (result.success) setUser({ authenticated: true });
    return result;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      logout, 
      loading: authLoading || initializing 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext debe usarse dentro de AuthProvider');
  return context;
};
