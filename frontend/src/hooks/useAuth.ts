// src/hooks/useAuth.ts
import { useState, useCallback } from 'react';
import { apiClient } from '@service/api-client';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (credentials: any) => {
    setLoading(true);
    try {
      const response = await apiClient.auth.login(credentials);
      if (response.token) {
        localStorage.setItem('token', response.token);
        // Aquí podrías guardar el usuario en un contexto global
        return { success: true };
      }
      return { success: false, error: 'Credenciales inválidas' };
    } catch (error) {
      return { success: false, error: 'Error de conexión' };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return { login, logout, loading };
};