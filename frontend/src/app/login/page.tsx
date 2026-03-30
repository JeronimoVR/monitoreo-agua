// src/app/login/page.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/src/lib/validations';
import { useAuth } from '@context/authContext';
import { Mail, Lock, LogIn, ChevronRight, Droplets, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function LoginPage() {
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: any) => {
    setServerError(null);
    try {
      const success = await login(data);
      if (!success) {
        setServerError('Credenciales incorrectas o error de servidor');
      }
    } catch (error) {
      setServerError('No se pudo establecer conexión con el servidor');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8faff] to-[#eef2ff] flex items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-10">
        {/* Logo y Títulos */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6">
            <Droplets className="text-blue-600 w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">AquaLab</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Sistema de monitoreo de agua</p>
        </div>

        {/* Formulario */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-blue-100 border border-white">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {serverError && (
              <div className="bg-red-50 text-red-600 text-[11px] font-bold p-3 rounded-xl text-center">
                {serverError}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  {...register('email')}
                  type="email" 
                  placeholder="nombre@test.com"
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-300 text-sm"
                />
              </div>
              {errors.email && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.email.message as string}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  {...register('password')}
                  type="password" 
                  placeholder="••••••••••••"
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-300 text-sm"
                />
              </div>
              {errors.password && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.password.message as string}</p>}
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#0047AB] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-800 transition-all shadow-lg shadow-blue-200 disabled:opacity-70"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : <>Iniciar Sesión <ChevronRight size={20} /></>}
            </button>
          </form>

          <div className="mt-8 space-y-4 text-center">
            <Link href="/register" className="block text-sm font-bold text-slate-600 flex items-center justify-center gap-1 group">
              Crear cuenta nueva <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/forgot-password" className="block text-sm font-bold text-blue-600">
              Olvidé mi contraseña
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}