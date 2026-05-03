'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthContext } from '@context/authContext';

export const RouteGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();

  // Rutas que requieren autenticación
  const protectedRoutes = ['/dashboard', '/cuenta', '/reportes'];
  // Rutas que NO deben ser accesibles si ya estás logueado (ej: login, registro)
  const authRoutes = ['/login', '/registro', '/recuperar-password', '/reset-password'];

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated && protectedRoutes.some(route => pathname.startsWith(route))) {
        console.log("Acceso denegado. Redirigiendo a /login");
        router.push('/login');
      }

      if (isAuthenticated && authRoutes.includes(pathname)) {
        console.log("Ya autenticado. Redirigiendo a /dashboard");
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, loading, pathname, router]);

  if (loading) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div className="spinner" style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p>Verificando sesión...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Si no está autenticado y es una ruta protegida, no renderizamos nada mientras redirige
  if (!isAuthenticated && protectedRoutes.some(route => pathname.startsWith(route))) {
    return null;
  }

  return <>{children}</>;
};
