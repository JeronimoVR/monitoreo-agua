'use client';
import { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { User, Mail, Lock, ShieldCheck } from 'lucide-react';

export const RegisterForm = ({ onSubmit, loading, error }: any) => {
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }
    const { confirmPassword, ...dataToSend } = formData;
    onSubmit(dataToSend);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-[2vh]">
      
      {/* Alerta de Error centrada en el Viewport */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 font-medium mb-2 flex items-center gap-2">
          <span className="shrink-0">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-4">
        <Input 
          label="Nombre Completo"
          placeholder="Ingresa tu nombre"
          iconLeft={<User size={18} />}
          onChange={(e: any) => setFormData({...formData, nombre: e.target.value})}
          required
        />
        
        <Input 
          label="Correo Electrónico"
          type="email"
          placeholder="ejemplo@uniajc.edu.co"
          iconLeft={<Mail size={18} />}
          onChange={(e: any) => setFormData({...formData, correo: e.target.value})}
          required
        />

        <Input 
          label="Contraseña"
          type="password"
          placeholder="Mínimo 8 caracteres"
          iconLeft={<Lock size={18} />}
          onChange={(e: any) => setFormData({...formData, password: e.target.value})}
          required
        />

        <Input 
          label="Confirmar Contraseña"
          type="password"
          placeholder="Repite tu contraseña"
          iconLeft={<ShieldCheck size={18} />}
          onChange={(e: any) => setFormData({...formData, confirmPassword: e.target.value})}
          required
        />
      </div>

      <div className="mt-6">
        <Button type="submit" loading={loading} className="w-full h-14 text-lg">
          Registrarse →
        </Button>
      </div>
    </form>
  );
};