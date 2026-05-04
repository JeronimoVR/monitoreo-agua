import { useState, useCallback } from 'react';
import { apiClient } from '@service/api-client';
import { useRouter } from 'next/navigation';

export const useAuth = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState<string | null>(null);

    const login = useCallback(async (credentials: any) => {
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
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Error de conexión con el servidor';
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
        // Si usas cookies para mayor seguridad con JWT:
        // document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
       
        // 4. Limpieza de caché de peticiones (Si usas SWR o React Query)
        // mutate(() => true, undefined, { revalidate: false });
        router.replace('/login');
        
        // Opcional: Solo si notas que quedan estados residuales pesados
        // window.location.href = '/login'; 
    } catch (error) {
        console.error("Error durante el cierre de sesión:", error);
        router.push('/login');
    }
}, [router]);

    return { login, logout, loading, error };
};