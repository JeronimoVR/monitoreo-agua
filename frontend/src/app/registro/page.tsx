'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@service/api-client';
import { AuthLayout } from '@components/layout/AuthLayout';
import { RegisterForm } from '@components/forms/RegisterForm';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.usuarios.registro(data);
      alert('¡Cuenta creada! Ahora puedes acceder al sistema.');
      router.push('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Registro de Usuario">
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <span style={{ fontSize: '2.5rem' }}>💧</span>
        <h2 style={{ margin: '5px 0' }}>AquaLab</h2>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>
          Plataforma de Monitoreo de Calidad de Agua
        </p>
      </div>

      <RegisterForm 
        onSubmit={handleRegister} 
        loading={loading} 
        error={error} 
      />

      <footer style={{ textAlign: 'center', marginTop: '20px' }}>
        <p style={{ fontSize: '0.9rem' }}>
          ¿Ya tienes una cuenta? <a href="/login" style={{ color: '#004aad', fontWeight: 'bold' }}>Inicia sesión aquí</a>
        </p>
      </footer>
    </AuthLayout>
  );
}