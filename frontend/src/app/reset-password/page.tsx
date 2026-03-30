'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema } from '@/src/lib/validations';
import { apiClient } from '@service/api-client';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Key, 
  ShieldCheck, 
  ArrowRight, 
  X, 
  RefreshCcw, 
  Droplets,
  Info,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function ResetPasswordPage() {
  const [strength, setStrength] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  
  const { 
    register, 
    handleSubmit, 
    watch,
    formState: { errors, isSubmitting } 
  } = useForm({
    resolver: zodResolver(resetPasswordSchema)
  });

  const passwordValue = watch('password', '');

  useEffect(() => {
    let score = 0;
    if (passwordValue.length >= 6) score++;
    if (passwordValue.length >= 12) score++;
    if (/[A-Z]/.test(passwordValue)) score++;
    if (/[0-9]/.test(passwordValue)) score++;
    setStrength(score);
  }, [passwordValue]);

  const onSubmit = async (data: any) => {
    if (!token) {
      setServerError("El enlace de recuperación no es válido o ha expirado.");
      return;
    }

    setServerError(null);
    try {
      const response = await apiClient.auth.restablecerPassword({
        token,
        password: data.password
      });

      if (response.error) {
        setServerError(response.error);
        return;
      }

      alert("¡Contraseña actualizada con éxito! Ahora puedes iniciar sesión.");
      router.push('/login');
    } catch (error) {
      setServerError("Error al conectar con el servidor.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8faff] to-[#eef2ff] flex items-center justify-center p-6 font-sans relative">
      
      <Link href="/login" className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 transition-colors">
        <X size={28} />
      </Link>

      <div className="w-full max-w-md space-y-8">
        
        <div className="text-center space-y-4">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Droplets className="text-[#0047AB] w-6 h-6" />
            <span className="text-xl font-black text-[#0047AB]">AquaLab</span>
          </div>
          
          <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6 relative">
            <div className="absolute inset-0 bg-blue-100/50 rounded-3xl animate-pulse" />
            <RefreshCcw className="text-[#0047AB] w-10 h-10 relative z-10" />
          </div>
          
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Actualizar<br />Contraseña
          </h1>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-blue-100/50 border border-white">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {serverError && (
              <div className="bg-red-50 text-red-600 text-[11px] font-bold p-3 rounded-xl text-center">
                {serverError}
              </div>
            )}

            {!token && (
              <div className="bg-orange-50 text-orange-600 text-[10px] font-bold p-3 rounded-xl border border-orange-100 mb-4">
                ADVERTENCIA: No se detectó un token de recuperación en la URL.
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-wider">
                Nueva Contraseña
              </label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input 
                  {...register('password')}
                  type="password" 
                  placeholder="••••••••••••"
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                />
              </div>
              
              <div className="flex gap-2 mt-3 px-1">
                {[1, 2, 3, 4].map((seg) => (
                  <div 
                    key={seg}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                      strength >= seg ? 'bg-blue-500' : 'bg-slate-100'
                    }`}
                  />
                ))}
              </div>
              <p className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-2 ml-1 font-medium">
                <Info size={14} className="text-slate-400" />
                Debe tener al menos 12 caracteres.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-wider">
                Confirmar Nueva Contraseña
              </label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input 
                  {...register('confirmPassword')}
                  type="password" 
                  placeholder="••••••••••••"
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-[10px] font-bold ml-1">
                  {errors.confirmPassword.message as string}
                </p>
              )}
            </div>

            <button 
              type="submit"
              disabled={isSubmitting || !token}
              className="w-full bg-[#0047AB] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-blue-800 transition-all shadow-lg shadow-blue-200 active:scale-[0.98] mt-4 disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : <>Actualizar Contraseña <ArrowRight size={20} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}