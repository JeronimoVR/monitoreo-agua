'use client';
import { useState, useEffect } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { LoginDto } from '@shared/auth/dto/login.dto';

interface LoginFormProps {
  onSubmit: (credentials: LoginDto) => void | Promise<void>;
  loading: boolean;
  error?: string | null;
  onValidationError?: (hasError: boolean) => void;
}

export const LoginForm = ({ onSubmit, loading, error: apiError, onValidationError }: LoginFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({ correo: '', password: '' });
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
    setLocalError(null);

    if (!credentials.correo || !credentials.password) {
      setLocalError("Por favor, ingresa tu correo y contraseña.");
      return;
    }

    onSubmit(credentials);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {activeError && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 font-medium mb-2 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
          <AlertCircle size={18} className="shrink-0" />
          <span>{activeError}</span>
        </div>
      )}

      <div className="space-y-4">
        <Input 
          label="Correo Electrónico"
          type="email"
          placeholder="ejemplo@correo.com"
          iconLeft={<Mail size={18} />}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setLocalError(null);
            setCredentials({...credentials, correo: e.target.value});
          }}
          required
        />
        
        <Input 
          label="Contraseña"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          iconLeft={<Lock size={18} />}
          iconRight={
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="hover:text-blue-600 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setLocalError(null);
            setCredentials({...credentials, password: e.target.value});
          }}
          required
        />
      </div>

      <div className="text-right -mt-2">
        <a href="/recuperar-password" title="Recuperar contraseña" className="text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors">
          ¿Olvidaste tu contraseña?
        </a>
      </div>

      <div className="mt-4">
        <Button type="submit" loading={loading} className="w-full h-14 text-lg">
          Iniciar Sesión →
        </Button>
      </div>
    </form>
  );
};

