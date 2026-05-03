'use client';
import { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

export const LoginForm = ({ onSubmit, loading, error }: any) => {
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({ correo: '', password: '' });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(credentials); }} className="flex flex-col gap-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 font-medium mb-2 flex items-center gap-2">
          <span className="shrink-0">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-4">
        <Input 
          label="Correo Electrónico"
          type="email"
          placeholder="ejemplo@uniajc.edu.co"
          iconLeft={<Mail size={18} />}
          onChange={(e: any) => setCredentials({...credentials, correo: e.target.value})}
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
          onChange={(e: any) => setCredentials({...credentials, password: e.target.value})}
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