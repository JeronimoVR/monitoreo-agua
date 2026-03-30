'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '@/src/lib/validations';
import { apiClient } from '@service/api-client';
import { UserPlus, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const RegisterForm = () => {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: any) => {
    try {
      const res = await apiClient.usuarios.registro(data);
      if (res) {
        alert('Registro exitoso. Ahora puedes iniciar sesión.');
        router.push('/login');
      }
    } catch (error) {
      alert('Error en el registro. Intenta con otro correo.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Crear Cuenta</h2>
      
      <div>
        <input {...register('nombre')} placeholder="Nombre Completo" className="w-full px-4 py-2 border rounded-lg outline-none focus:border-blue-500" />
        {errors.nombre && <p className="text-red-500 text-xs">{errors.nombre.message as string}</p>}
      </div>

      <div>
        <input {...register('email')} placeholder="Email" className="w-full px-4 py-2 border rounded-lg outline-none focus:border-blue-500" />
        {errors.email && <p className="text-red-500 text-xs">{errors.email.message as string}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <input {...register('password')} type="password" placeholder="Contraseña" className="w-full px-4 py-2 border rounded-lg outline-none focus:border-blue-500" />
          {errors.password && <p className="text-red-500 text-xs">{errors.password.message as string}</p>}
        </div>
        <div>
          <input {...register('confirmPassword')} type="password" placeholder="Confirmar" className="w-full px-4 py-2 border rounded-lg outline-none focus:border-blue-500" />
          {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword.message as string}</p>}
        </div>
      </div>

      <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 mt-4">
        Registrarse <ArrowRight className="w-5 h-5" />
      </button>
    </form>
  );
};
