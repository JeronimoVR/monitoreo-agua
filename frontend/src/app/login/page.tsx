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
    <AuthLayout title="">
      {/* Encabezado con espaciado consistente */}
      <div className="text-center mb-[4vh] flex flex-col items-center">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
          <svg width="32" height="40" viewBox="0 0 26 33" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-600">
            <path d="M13.4469 28.05C13.7719 28.0225 14.0495 27.8919 14.2797 27.6581C14.5099 27.4244 14.625 27.1425 14.625 26.8125C14.625 26.4275 14.5031 26.1181 14.2594 25.8844C14.0156 25.6506 13.7042 25.5475 13.325 25.575C12.2146 25.6575 11.0365 25.3481 9.79063 24.6469C8.54479 23.9456 7.75937 22.6737 7.43437 20.8312C7.38021 20.5287 7.23802 20.2812 7.00781 20.0888C6.7776 19.8962 6.51354 19.8 6.21563 19.8C5.83646 19.8 5.525 19.9444 5.28125 20.2331C5.0375 20.5219 4.95625 20.8587 5.0375 21.2437C5.49792 23.7463 6.58125 25.5338 8.2875 26.6062C9.99375 27.6787 11.7135 28.16 13.4469 28.05ZM13 33C9.28958 33 6.19531 31.7075 3.71719 29.1225C1.23906 26.5375 0 23.32 0 19.47C0 16.72 1.07656 13.7294 3.22969 10.4981C5.38281 7.26688 8.63958 3.7675 13 0C17.3604 3.7675 20.6172 7.26688 22.7703 10.4981C24.9234 13.7294 26 16.72 26 19.47C26 23.32 24.7609 26.5375 22.2828 29.1225C19.8047 31.7075 16.7104 33 13 33Z" fill="currentColor" />
          </svg>
        </div>
        <h2 className="text-[1.8rem] sm:text-[2.2rem] font-black text-slate-900 leading-tight">
          AquaLab
        </h2>
        <p className="text-slate-500 text-[0.9rem] sm:text-[1rem] font-medium max-w-[250px]">
          Monitoreo inteligente de calidad de agua
        </p>
      </div>

      <LoginForm 
        onSubmit={handleLogin} 
        loading={loading} 
        error={error} 
      />

      <footer className="text-center mt-[4vh] pt-4 border-t border-slate-100">
        <p className="text-[0.9rem] text-slate-600">
          ¿No tienes una cuenta?{' '}
          <a
            href="/registro"
            className="text-blue-600 font-bold hover:underline transition-all"
          >
            Regístrate aquí
          </a>
        </p>
      </footer>
    </AuthLayout>

  );
}