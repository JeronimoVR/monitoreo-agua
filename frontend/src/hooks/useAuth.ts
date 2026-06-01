'use client';
import { useState, useCallback } from 'react';
import { apiClient } from '@service/api-client';
import { LoginDto } from '@shared/auth/dto/login.dto';
import { AxiosError } from 'axios';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (credentials: LoginDto) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.auth.login(credentials);
      if (response.access_token) {
        localStorage.setItem('token', response.access_token);
        if (response.user?.id) {
          localStorage.setItem('userId', String(response.user.id));
        }
        return { success: true };
      }
      throw new Error('No se recibió el token de acceso');
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string }>;
      const msg = axiosError.response?.data?.message || 'Error de conexión con el servidor';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      // Forzar redirección limpia al login para romper ciclos del estado de React
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error("Error al limpiar almacenamiento de sesión:", error);
    }
  }, []);

  return { login, logout, loading, error };
};