'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema } from '@/src/lib/validations';
import { apiClient } from '@service/api-client';
import { 
  Mail, 
  ArrowRight, 
  ArrowLeft, 
  Loader2, 
  Droplets 
} from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const onSubmit = async (data: any) => {
    try {
      // Supongamos que tienes este endpoint en tu API
      await apiClient.auth.recuperarPassword(data.email);
      alert("Si el correo existe, hemos enviado un enlace de recuperación.");
    } catch (error) {
      alert("Error al procesar la solicitud.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8faff] to-[#eef2ff] flex items-center justify-center p-8 font-sans">
      <div className="w-full max-w-md space-y-10">
        
        {/* Identidad Visual */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6">
            <Droplets className="text-[#0047AB] w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">AquaLab</h1>
          <p className="text-sm font-bold text-slate-500">
            Recuperación de Acceso al Sistema
          </p>
        </div>

        {/* Tarjeta de Formulario */}
        <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-blue-100/50 border border-white">
          <div className="space-y-4 mb-8">
            <h2 className="text-2xl font-black text-slate-800 leading-tight">
              ¿Olvidaste tu contraseña?
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Ingresa tu correo electrónico registrado y te enviaremos un enlace seguro para restablecer tu acceso.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1 tracking-wider">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                <input 
                  {...register('email')}
                  type="email" 
                  placeholder="nombre@test.com"
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-300 text-sm transition-all"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-[10px] font-bold ml-1">
                  {errors.email.message as string}
                </p>
              )}
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#0047AB] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-blue-800 transition-all shadow-lg shadow-blue-200 active:scale-[0.98] disabled:opacity-70"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  Enviar Enlace de Recuperación
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <Link 
              href="/login" 
              className="inline-flex items-center gap-2 text-sm font-bold text-[#0047AB] hover:text-blue-800 transition-colors"
            >
              <ArrowLeft size={18} />
              Volver al Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}