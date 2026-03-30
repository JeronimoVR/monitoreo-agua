'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '@/src/lib/validations';
import { apiClient } from '@service/api-client';
import { 
  User, 
  Mail, 
  Lock, 
  ShieldCheck, 
  ChevronRight, 
  Loader2, 
  Droplets 
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: any) => {
    try {
      await apiClient.usuarios.registro(data);
      alert("¡Cuenta creada con éxito! Ahora puedes iniciar sesión.");
      router.push('/login');
    } catch (error) {
      console.error(error);
      alert("Hubo un error al procesar el registro. Intenta con otro correo.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4ff] to-white flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm space-y-8">
        
        {/* Identidad de Marca (Logo) */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-white rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-4 border border-slate-50">
            <Droplets className="text-[#0047AB] w-7 h-7" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">AquaLab</h1>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Sistema de monitoreo de agua
          </p>
        </div>

        {/* Tarjeta de Registro */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-blue-100/50 border border-white relative overflow-hidden">
          {/* Sutil mancha de color de fondo */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-50" />

          <h2 className="text-2xl font-black text-slate-800 mb-8 relative">Crear cuenta</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 relative">
            
            {/* Campo: Nombre Completo */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nombre Completo</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  {...register('nombre')}
                  type="text" 
                  placeholder="Ej: Jerónimo"
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-300 text-sm transition-all"
                />
              </div>
              {errors.nombre && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.nombre.message as string}</p>}
            </div>

            {/* Campo: Correo Electrónico */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  {...register('email')}
                  type="email" 
                  placeholder="usuario@test.com"
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-slate-300 text-sm transition-all"
                />
              </div>
              {errors.email && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.email.message as string}</p>}
            </div>

            {/* Campos de Contraseña (Grid) */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    {...register('password')}
                    type="password" 
                    placeholder="••••••••"
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm tracking-widest"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Confirmar Contraseña</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    {...register('confirmPassword')}
                    type="password" 
                    placeholder="••••••••"
                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-sm tracking-widest"
                  />
                </div>
              </div>
              {(errors.password || errors.confirmPassword) && (
                <p className="text-red-500 text-[10px] font-bold ml-1">
                  {(errors.password?.message || errors.confirmPassword?.message) as string}
                </p>
              )}
            </div>

            <p className="text-[9px] text-slate-400 text-center px-4 leading-tight">
              Al registrarse, acepta los <span className="font-bold text-slate-600 underline">términos y condiciones</span>
            </p>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#0047AB] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-800 transition-all shadow-lg shadow-blue-200 disabled:opacity-70 active:scale-[0.98]"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : "Registrarse"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link 
              href="/login" 
              className="inline-flex items-center gap-1 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors group"
            >
              Ya tengo una cuenta <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}