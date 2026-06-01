'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthContext } from '@context/authContext';

const PROTECTED_ROUTES = ['/cuenta'];
const AUTH_ROUTES = ['/login', '/registro', '/recuperar-password', '/reset-password'];
const PUBLIC_ROUTES = ['/', '/inicio', '/reportes'];

export const RouteGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (PUBLIC_ROUTES.some((route) => pathname === route)) return;

    if (!isAuthenticated && PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, pathname, router]);

  if (PUBLIC_ROUTES.some((route) => pathname === route)) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px' }}>
        <div
          className="spinner"
          style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}
        ></div>
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

  if (!isAuthenticated && PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    return null;
  }

  if (isAuthenticated && AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    return null;
  }

  return <>{children}</>;
};
