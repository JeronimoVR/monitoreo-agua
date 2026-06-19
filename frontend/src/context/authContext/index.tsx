'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@hooks/useAuth';
import { apiClient } from '@service/api-client';
import { Usuario } from '@shared/users/dto/usuario.dto';
import { LoginDto } from '@shared/auth/dto/login.dto';
import { logger } from '@/src/lib/logger';

export type User = Usuario;

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (
    credentials: LoginDto
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();

  const {
    login: authLogin,
    logout: authLogout,
    loading: authLoading,
    error: authError,
  } = useAuth();

  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  const verifySession = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('token');
    const storedId = localStorage.getItem('userId');

    if (!token || !storedId) {
      setUser(null);
      setInitializing(false);
      return;
    }

    try {
      const profile = await apiClient.usuarios.getById(
        Number(storedId)
      );

      setUser(profile);
    } catch (error) {
      logger.error({ err: error },
        'Sesión inválida o expirada en backend:'
      );

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

  const login = async (credentials: LoginDto) => {
    const result = await authLogin(credentials);

    if (result.success) {
      await verifySession();
    }

    return result;
  };

  const logout = useCallback(() => {
    authLogout();
    setUser(null);
    router.replace('/');
  }, [authLogout, router]);

  const updateUser = useCallback(
    async (data: Partial<User>) => {
      if (!user?.id) {
        throw new Error('No hay usuario autenticado');
      }

      const updatedUser =
        await apiClient.usuarios.update(
          user.id,
          data
        );

      setUser(updatedUser);
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        loading: authLoading || initializing,
        error: authError,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuthContext debe usarse dentro de AuthProvider'
    );
  }

  return context;
};