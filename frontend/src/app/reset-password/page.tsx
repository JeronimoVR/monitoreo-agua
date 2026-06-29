'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ResetPasswordForm } from '@components/forms/ChangePasswordForm';
import { AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@service/api-client';
import { AxiosError } from 'axios';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isErrorActive, setIsErrorActive] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Mostrar alerta temporal
  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlertMessage({ type, message });
    setTimeout(() => {
      setAlertMessage(null);
    }, 5000);
  };

  const handleResetPassword = async (newPassword: string) => {
    if (!token) {
      const errorMsg = "Token de recuperación no encontrado o inválido.";
      setError(errorMsg);
      showAlert('error', errorMsg);
      setIsErrorActive(true);
      return;
    }

    setLoading(true);
    setError(null);
    setIsErrorActive(false);

    try {
      await apiClient.auth.restablecerPassword({
        token,
        nuevaPassword: newPassword,
      });

      showAlert('success', '¡Contraseña restablecida correctamente!');

      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: unknown) {
      const axiosError = err as AxiosError<{ message?: string; statusCode?: number }>;
      const statusCode = axiosError.response?.status;
      const message = axiosError.response?.data?.message || "";

      if (statusCode === 401 || message.toLowerCase().includes('expirado') || message.toLowerCase().includes('expired')) {
        const errorMsg = "El token ha expirado. Por favor, solicita un nuevo enlace de recuperación.";
        setError(errorMsg);
        showAlert('error', errorMsg);
      } else if (message.toLowerCase().includes('inválido') || message.toLowerCase().includes('invalid')) {
        const errorMsg = "El token es inválido. Por favor, solicita un nuevo enlace de recuperación.";
        setError(errorMsg);
        showAlert('error', errorMsg);
      } else {
        const isInternalError = statusCode === 500 || message.toLowerCase().includes('internal server');
        const errorMsg = isInternalError ? "Ha ocurrido un error inesperado, inténtalo de nuevo más tarde." : (message || "Error al restablecer la contraseña. Inténtalo de nuevo.");
        setError(errorMsg);
        showAlert('error', errorMsg);
      }
      setIsErrorActive(true);
    } finally {
      setLoading(false);
    }
  };

  // Si no hay token, mostrar error
  if (!token) {
    return (
      <main className="min-h-screen bg-[#FAFAFE]">
        <div className="w-full max-w-md mx-auto px-4 pt-6 pb-12">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-700 mb-2">Enlace inválido</h2>
            <p className="text-red-600 mb-4">
              El enlace de recuperación no es válido o ha expirado.
            </p>
            <Link
              href="/recuperar-password"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Solicitar nuevo enlace
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAFE]">
      <div className="w-full max-w-md mx-auto px-4 pt-6 pb-12">

        {/* Alerta flotante */}
        {alertMessage && (
          <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-top-2 ${
            alertMessage.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            {alertMessage.type === 'success' ? (
              <CheckCircle size={18} className="text-green-600" />
            ) : (
              <AlertCircle size={18} className="text-red-600" />
            )}
            <p className={`text-sm font-medium ${alertMessage.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
              {alertMessage.message}
            </p>
          </div>
        )}

        {/* Encabezado */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mb-4 shadow-md">
            <svg width="36" height="45" viewBox="0 0 26 33" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-600">
              <path d="M13.4469 28.05C13.7719 28.0225 14.0495 27.8919 14.2797 27.6581C14.5099 27.4244 14.625 27.1425 14.625 26.8125C14.625 26.4275 14.5031 26.1181 14.2594 25.8844C14.0156 25.6506 13.7042 25.5475 13.325 25.575C12.2146 25.6575 11.0365 25.3481 9.79063 24.6469C8.54479 23.9456 7.75937 22.6737 7.43437 20.8312C7.38021 20.5287 7.23802 20.2812 7.00781 20.0888C6.7776 19.8962 6.51354 19.8 6.21563 19.8C5.83646 19.8 5.525 19.9444 5.28125 20.2331C5.0375 20.5219 4.95625 20.8587 5.0375 21.2437C5.49792 23.7463 6.58125 25.5338 8.2875 26.6062C9.99375 27.6787 11.7135 28.16 13.4469 28.05ZM13 33C9.28958 33 6.19531 31.7075 3.71719 29.1225C1.23906 26.5375 0 23.32 0 19.47C0 16.72 1.07656 13.7294 3.22969 10.4981C5.38281 7.26688 8.63958 3.7675 13 0C17.3604 3.7675 20.6172 7.26688 22.7703 10.4981C24.9234 13.7294 26 16.72 26 19.47C26 23.32 24.7609 26.5375 22.2828 29.1225C19.8047 31.7075 16.7104 33 13 33Z" fill="currentColor" />
            </svg>
          </div>
          <h2 className="text-[2rem] sm:text-[2.5rem] font-black text-slate-900 leading-tight tracking-tight">
            Restablecer Contraseña
          </h2>
          <p className="text-slate-500 text-[0.95rem] sm:text-[1rem] font-medium max-w-[280px] mt-2">
            Ingresa tu nueva contraseña para recuperar el acceso a tu cuenta
          </p>
        </div>

        {/* Formulario de restablecimiento */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-slate-100">
          <ResetPasswordForm
            onSubmit={handleResetPassword}
            loading={loading}
            error={error}
            onValidationError={setIsErrorActive}
          />
        </div>

        {/* Botón para volver al login */}
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm text-slate-500 hover:text-blue-600 transition-colors inline-flex items-center gap-1"
          >
            <ArrowLeft size={14} />
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#FAFAFE] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </main>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}