'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@context/authContext';
import { AuthLayout } from '@components/layout/AuthLayout';
import { LoginForm } from '@components/forms/LoginForm';

export default function LoginPage() {
  const { login, loading } = useAuthContext();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (credentials: any) => {
    setError(null);
    const result = await login(credentials);
    if (result.success) {
      router.push('/dashboard');
    } else {
      setError(result.error || 'Error al iniciar sesión');
    }
  };

  return (
    <AuthLayout title="Iniciar Sesión">
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <span style={{ fontSize: '3rem' }}>💧</span>
        <p>Monitoreo inteligente de calidad de agua</p>
      </div>

      <LoginForm 
        onSubmit={handleLogin} 
        loading={loading} 
        error={error} 
      />

      <hr style={{ margin: '20px 0' }} />

      <footer style={{ textAlign: 'center' }}>
        <p>
          ¿No tienes una cuenta? <a href="/registro">Regístrate aquí</a>
        </p>
      </footer>
    </AuthLayout>
  );
}