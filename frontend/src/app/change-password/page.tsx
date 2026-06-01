'use client';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiClient } from '@service/api-client';
import { AuthLayout } from '@components/layout/AuthLayout';
import { ResetPasswordForm } from '@components/forms/ResetPasswordForm';
import { AxiosError } from 'axios';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const token = searchParams.get('token');

  const handleReset = async (newPassword: string) => {
    if (!token) {
      alert("Token de recuperación no encontrado o invalido.");
      return;
    }

    setLoading(true);
    try {
      await apiClient.auth.restablecerPassword({ token, nuevaPassword: newPassword });
      alert("Contraseña actualizada con éxito.");
      router.push('/login');
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string }>;
      alert(axiosError.response?.data?.message || "Error al actualizar la contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="">
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <h2>Cambiar Contraseña</h2>
        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '20px' }}>
          Ingresa tu nueva contraseña a continuación. Asegúrate de utilizar una combinación segura.
        </p>

        <ResetPasswordForm onSubmit={handleReset} loading={loading} />
      </div>
    </AuthLayout>
  );
}
