import { useState, useCallback } from 'react';
import { apiClient } from '@service/api-client';

export const useAuth = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = useCallback(async (credentials: any) => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiClient.auth.login(credentials);
            if (response.token) {
                localStorage.setItem('token', response.token);
                return { success: true };
            }
            throw new Error('No se recibió el token de acceso');
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Error de conexión con el servidor';
            setError(msg);
            return { success: false, error: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    }, []);

    return { login, logout, loading, error };
};