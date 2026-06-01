'use client';
import { useState, useMemo, useEffect } from 'react';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { Lock, ShieldCheck, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ResetPasswordFormProps {
  onSubmit: (newPassword: string) => void | Promise<void>;
  loading: boolean;
  error?: string | null;
  onValidationError?: (hasError: boolean) => void;
}

export const ResetPasswordForm = ({ onSubmit, loading, error: apiError, onValidationError }: ResetPasswordFormProps) => {
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwords, setPasswords] = useState({ new: '', confirm: '' });
  const [localError, setLocalError] = useState<string | null>(null);

  const validations = useMemo(() => ({
    minChars: passwords.new.length >= 8,
    specialChar: /[!@#$%^&*(),.?":{}|<>0-9]/.test(passwords.new)
  }), [passwords.new]);

  // Sincronizar estado de error con el layout
  const activeError = apiError || localError;
  useEffect(() => {
    if (onValidationError) onValidationError(!!activeError);
  }, [activeError, onValidationError]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (passwords.new !== passwords.confirm) {
      setLocalError("Las contraseñas no coinciden.");
      return;
    }
    onSubmit(passwords.new);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
      
      {activeError && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 font-medium mb-2 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
          <AlertCircle size={18} className="shrink-0" />
          <span>{activeError}</span>
        </div>
      )}

      <div className="space-y-4">
        <Input 
          label="NUEVA CONTRASEÑA"
          type={showPass ? "text" : "password"}
          placeholder="••••••••"
          iconLeft={<Lock size={18} />}
          iconRight={
            <button type="button" onClick={() => setShowPass(!showPass)} className="hover:text-blue-600 transition-colors">
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
          onChange={(e) => {
            setLocalError(null);
            setPasswords({...passwords, new: e.target.value});
          }}
          required
        />

        <Input 
          label="CONFIRMAR NUEVA CONTRASEÑA"
          type={showConfirm ? "text" : "password"}
          placeholder="••••••••"
          iconLeft={<ShieldCheck size={18} />}
          iconRight={
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="hover:text-blue-600 transition-colors">
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
          onChange={(e) => {
            setLocalError(null);
            setPasswords({...passwords, confirm: e.target.value});
          }}
          required
        />
      </div>

      <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl my-2">
        <p className="text-[0.75rem] font-black text-slate-700 mb-3 uppercase tracking-wider">
          Requisitos de seguridad:
        </p>
        <ul className="space-y-2">
          <li className={`flex items-center gap-2 text-sm font-medium transition-colors ${validations.minChars ? 'text-emerald-600' : 'text-slate-400'}`}>
            <CheckCircle2 size={16} className={validations.minChars ? 'opacity-100' : 'opacity-30'} />
            Mínimo 8 caracteres
          </li>
          <li className={`flex items-center gap-2 text-sm font-medium transition-colors ${validations.specialChar ? 'text-emerald-600' : 'text-slate-400'}`}>
            <CheckCircle2 size={16} className={validations.specialChar ? 'opacity-100' : 'opacity-30'} />
            Un número o símbolo especial
          </li>
        </ul>
      </div>

      <div className="mt-4">
        <Button 
          type="submit" 
          loading={loading} 
          className="w-full h-14 text-lg"
          disabled={!validations.minChars || !validations.specialChar}
        >
          Actualizar Contraseña →
        </Button>
      </div>
    </form>
  );
};
