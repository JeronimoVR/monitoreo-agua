// src/app/register/page.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '@/src/lib/validations';
import { apiClient } from '@service/api-client';
import { Toast } from '@components/ui/toast'; 
import { User, Mail, Lock, ShieldCheck, ChevronRight, Droplets, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: any) => {
    try {
      // Enviamos el objeto con 'correo' en lugar de 'email'
      await apiClient.usuarios.registro(data);
      
      setToast({ msg: "Cuenta creada con éxito", type: 'success' });
      
      setTimeout(() => {
        setToast(null);
        router.push('/login');
      }, 2000);
      
    } catch (error: any) {
      // Capturamos el error 400 real del backend
      const errorDetail = error.response?.data?.message || "Error al registrar usuario";
      setToast({ msg: Array.isArray(errorDetail) ? errorDetail[0] : errorDetail, type: 'error' });
      
      setTimeout(() => setToast(null), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative">
      
      {toast && (
        <Toast 
          message={toast.msg} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      <div className="w-full max-w-sm bg-white p-8 rounded-[2.5rem] shadow-2xl border border-white">
        <div className="text-center mb-8">
           <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Droplets className="text-[#0047AB] w-7 h-7" />
           </div>
           <h2 className="text-2xl font-black text-slate-800 tracking-tight">Crear cuenta</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nombre Completo</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                {...register('nombre')} 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none text-sm text-slate-900 font-bold placeholder:text-slate-400 placeholder:font-normal transition-all focus:ring-2 focus:ring-blue-100" 
                placeholder="Jerónimo Velez" 
              />
            </div>
            {errors.nombre && <p className="text-[10px] text-red-500 font-bold ml-2">{errors.nombre.message as string}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                {...register('correo')} 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none text-sm text-slate-900 font-bold placeholder:text-slate-400 placeholder:font-normal transition-all focus:ring-2 focus:ring-blue-100" 
                placeholder="correo@ejemplo.com" 
              />
            </div>
            {errors.correo && <p className="text-[10px] text-red-500 font-bold ml-2">{errors.correo.message as string}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="password" 
                  {...register('password')} 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none text-sm text-slate-900 font-bold placeholder:text-slate-400 placeholder:font-normal" 
                  placeholder="••••••••" 
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Confirmar</label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="password" 
                  {...register('confirmPassword')} 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none text-sm text-slate-900 font-bold placeholder:text-slate-400 placeholder:font-normal" 
                  placeholder="••••••••" 
                />
              </div>
            </div>
          </div>
          {errors.confirmPassword && <p className="text-[10px] text-red-500 font-bold ml-2">{errors.confirmPassword.message as string}</p>}

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#0047AB] text-white font-bold py-4 rounded-2xl mt-4 shadow-lg shadow-blue-100 flex items-center justify-center gap-2 hover:bg-blue-800 transition-all active:scale-95 disabled:opacity-70"
          >
            {isSubmitting ? <Loader2 className="animate-spin" /> : "Registrarse"}
          </button>
        </form>

        <Link href="/login" className="block text-center mt-6 text-sm font-bold text-slate-500 hover:text-[#0047AB] transition-colors">
          ¿Ya tienes cuenta? <span className="text-[#0047AB]">Inicia sesión</span>
        </Link>
      </div>
    </div>
  );
}