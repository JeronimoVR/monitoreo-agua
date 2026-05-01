'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/src/lib/validations';
import { useAuth } from '@context/authContext';
import { LogIn, Loader2 } from 'lucide-react';

export const LoginForm = () => {
  const { login, loading } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: any) => {
    const success = await login(data);
    if (!success) alert('Error al iniciar sesión. Revisa tus credenciales.');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 w-full max-w-sm p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Bienvenido</h1>
        <p className="text-gray-500 text-sm">Monitoreo de Calidad de Agua</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
        <input
          {...register('correo')}
          type="email"
          className={`w-full pl-12 pr-6 py-4 bg-white border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-black placeholder:text-gray-500 font-medium transition-all ${errors.correo ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="usuario@correo.com"
        />
        {errors.correo && <p className="text-red-500 text-xs mt-1">{errors.correo.message as string}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
        <input
          {...register('password')}
          type="password"
          className={`w-full pl-12 pr-6 py-4 bg-white border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-black placeholder:text-gray-500 font-medium transition-all ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
          placeholder="••••••"
        />
        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message as string}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
      >
        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <LogIn className="w-5 h-5" />}
        Iniciar Sesión
      </button>

      <p className="text-center text-sm text-gray-600 mt-4">
        ¿No tienes cuenta? <a href="/register" className="text-blue-600 font-bold hover:underline">Regístrate</a>
      </p>
    </form>
  );
};