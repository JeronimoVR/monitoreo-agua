'use client';
import { useState, useEffect } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { User, Mail, Lock, ShieldCheck, AlertCircle } from 'lucide-react';

export const RegisterForm = ({ onSubmit, loading, error: apiError, success, onValidationError }: any) => {
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    password: '',
    confirmPassword: ''
  });
  const [localError, setLocalError] = useState<string | null>(null);

  // Notificar al padre si hay algún error activo (API o Local)
  const activeError = apiError || localError;
  useEffect(() => {
    if (onValidationError) {
      onValidationError(!!activeError);
    }
  }, [activeError, onValidationError]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (success) return; // Evitar re-envío si ya tuvo éxito
    setLocalError(null);


    // Validación de campos vacíos
    if (!formData.nombre || !formData.correo || !formData.password || !formData.confirmPassword) {
      setLocalError("Por favor, completa todos los campos obligatorios.");
      return;
    }

    // Validación de coincidencia de contraseñas
    if (formData.password !== formData.confirmPassword) {
      setLocalError("Las contraseñas no coinciden. Por favor, verifica e intenta de nuevo.");
      return;
    }

    // Validación de longitud mínima
    if (formData.password.length < 8) {
      setLocalError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    const { confirmPassword, ...dataToSend } = formData;
    onSubmit(dataToSend);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-[2vh]">
      
      {/* Alerta de Éxito */}
      {success && (
        <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl text-sm border border-emerald-100 font-medium mb-2 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
          <CheckCircle size={18} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Alerta de Error (API o Local) */}
      {activeError && !success && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 font-medium mb-2 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
          <AlertCircle size={18} className="shrink-0" />
          <span>{activeError}</span>
        </div>
      )}

      <div className={`space-y-4 transition-opacity ${success ? 'opacity-50 pointer-events-none' : ''}`}>
        <Input 
          label="Nombre Completo"
          placeholder="Ingresa tu nombre"
          iconLeft={<User size={18} />}
          onChange={(e: any) => {
            setLocalError(null);
            setFormData({...formData, nombre: e.target.value});
          }}
          disabled={!!success}
          required
        />
        
        <Input 
          label="Correo Electrónico"
          type="email"
          placeholder="ejemplo@correo.com"
          iconLeft={<Mail size={18} />}
          onChange={(e: any) => {
            setLocalError(null);
            setFormData({...formData, correo: e.target.value});
          }}
          disabled={!!success}
          required
        />

        <Input 
          label="Contraseña"
          type="password"
          placeholder="Mínimo 8 caracteres"
          iconLeft={<Lock size={18} />}
          onChange={(e: any) => {
            setLocalError(null);
            setFormData({...formData, password: e.target.value});
          }}
          disabled={!!success}
          required
        />

        <Input 
          label="Confirmar Contraseña"
          type="password"
          placeholder="Repite tu contraseña"
          iconLeft={<ShieldCheck size={18} />}
          onChange={(e: any) => {
            setLocalError(null);
            setFormData({...formData, confirmPassword: e.target.value});
          }}
          disabled={!!success}
          required
        />
      </div>

      <div className="mt-6">
        <Button 
          type="submit" 
          loading={loading} 
          disabled={!!success}
          className={`w-full h-14 text-lg transition-all ${success ? 'bg-emerald-500 hover:bg-emerald-600' : ''}`}
        >
          {success ? '¡Registro Exitoso!' : 'Registrarse →'}
        </Button>
      </div>

    </form>
  );
};

