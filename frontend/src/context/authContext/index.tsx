'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@hooks/useAuth';
import { apiClient } from '@service/api-client';
import { Usuario } from '@shared/users/dto/usuario.dto';

// We can use the imported Usuario directly or extend it if needed
export type User = Usuario;

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: any) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { login: authLogin, logout: authLogout, loading: authLoading, error: authError } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  // Validación real del token contra el backend
  const verifySession = useCallback(async () => {
    const token = localStorage.getItem('token');
    const storedId = localStorage.getItem('userId');

    if (!token || !storedId) {
      setInitializing(false);
      return;
    }

    try {
      const profile = await apiClient.usuarios.getById(Number(storedId));
      setUser(profile);
    } catch (error) {
      console.error("Sesión inválida o expirada");
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      setUser(null);
    } finally {
      setInitializing(false);
    }
  }, []);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  const login = async (credentials: any) => {
    const result = await authLogin(credentials);
    if (result.success) {
      // Tras login exitoso, obtenemos los datos reales del usuario
      await verifySession();
    }
    return result;
  };

  const logout = () => {
    authLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout,
      loading: authLoading || initializing,
      error: authError
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