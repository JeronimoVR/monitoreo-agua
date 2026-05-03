'use client';
import { useState } from 'react';
import { AuthLayout } from '@components/layout/AuthLayout';
import { RecoverPasswordForm } from '@components/forms/RecoverPasswordForm';
import { apiClient } from '@service/api-client';

export default function RecuperarPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleRecover = async (email: string) => {
    setLoading(true);
    setMessage(null);
    try {
      await apiClient.auth.recuperarPassword({ correo: email });
      setMessage({ 
        type: 'success', 
        text: 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.' 
      });
    } catch (error) {
      console.error(error);
      setMessage({ 
        type: 'error', 
        text: 'Ocurrió un error al procesar la solicitud. Por favor, intenta de nuevo.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Recuperar Contraseña">
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <p>Introduce tu correo electrónico para recibir un enlace de recuperación.</p>
      </div>

      {message && (
        <div style={{ 
          padding: '12px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2',
          color: message.type === 'success' ? '#065f46' : '#991b1b',
          textAlign: 'center',
          fontSize: '0.9rem'
        }}>
          {message.text}
        </div>
      )}

      <RecoverPasswordForm 
        onSubmit={handleRecover} 
        loading={loading} 
      />

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <a href="/login" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '0.9rem' }}>
          ← Volver al inicio de sesión
        </a>
      </div>
    </AuthLayout>
  );
}
