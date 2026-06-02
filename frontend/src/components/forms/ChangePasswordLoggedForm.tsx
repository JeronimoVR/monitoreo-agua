'use client';
import { useState, useMemo, useEffect } from 'react';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { Lock, ShieldCheck, Eye, EyeOff, AlertCircle, CheckCircle2, Key } from 'lucide-react';

interface ChangePasswordLoggedFormProps {
  onSubmit: (currentPassword: string, newPassword: string, confirmPassword: string) => void | Promise<void>;
  loading: boolean;
  error?: string | null;
  onValidationError?: (hasError: boolean) => void;
}

export const ChangePasswordLoggedForm = ({ onSubmit, loading, error: apiError, onValidationError }: ChangePasswordLoggedFormProps) => {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwords, setPasswords] = useState({ 
    current: '', 
    new: '', 
    confirm: '' 
  });
  const [localError, setLocalError] = useState<string | null>(null);
  const [touched, setTouched] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Validaciones de nueva contraseña
  const validations = useMemo(() => ({
    minChars: passwords.new.length >= 8,
    hasUpperCase: /[A-Z]/.test(passwords.new),
    hasNumber: /[0-9]/.test(passwords.new),
    notSameAsCurrent: passwords.current !== passwords.new && passwords.current !== '',
    passwordsMatch: passwords.new === passwords.confirm && passwords.new !== ''
  }), [passwords]);

  // Sincronizar estado de error con el layout
  const activeError = apiError || localError;
  useEffect(() => {
    if (onValidationError) onValidationError(!!activeError);
  }, [activeError, onValidationError]);

  // Calcular fortaleza de la contraseña
  const getPasswordStrength = () => {
    if (!passwords.new) return { level: 0, text: '', color: '' };
    
    let strength = 0;
    if (passwords.new.length >= 8) strength++;
    if (passwords.new.match(/[A-Z]/)) strength++;
    if (passwords.new.match(/[0-9]/)) strength++;
    
    if (strength === 0) return { level: 1, text: 'Muy débil', color: 'bg-red-500' };
    if (strength === 1) return { level: 2, text: 'Débil', color: 'bg-orange-500' };
    if (strength === 2) return { level: 3, text: 'Media', color: 'bg-yellow-500' };
    if (strength === 3) return { level: 4, text: 'Fuerte', color: 'bg-green-500' };
    return { level: 5, text: 'Muy fuerte', color: 'bg-emerald-500' };
  };

  const passwordStrength = getPasswordStrength();

  const handleBlur = (field: 'current' | 'new' | 'confirm') => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    // Validación de campos vacíos
    if (!passwords.current.trim()) {
      setLocalError("Ingresa tu contraseña actual");
      onValidationError?.(true);
      return;
    }

    if (!passwords.new.trim()) {
      setLocalError("Ingresa una nueva contraseña");
      onValidationError?.(true);
      return;
    }

    if (!passwords.confirm.trim()) {
      setLocalError("Confirma tu nueva contraseña");
      onValidationError?.(true);
      return;
    }

    // Validación de longitud mínima
    if (passwords.new.length < 8) {
      setLocalError("La nueva contraseña debe tener al menos 8 caracteres");
      onValidationError?.(true);
      return;
    }

    // Validación de mayúscula
    if (!/[A-Z]/.test(passwords.new)) {
      setLocalError("La nueva contraseña debe contener al menos una letra mayúscula");
      onValidationError?.(true);
      return;
    }

    // Validación de número
    if (!/[0-9]/.test(passwords.new)) {
      setLocalError("La nueva contraseña debe contener al menos un número");
      onValidationError?.(true);
      return;
    }

    // Validación de coincidencia
    if (passwords.new !== passwords.confirm) {
      setLocalError("Las contraseñas nuevas no coinciden");
      onValidationError?.(true);
      return;
    }

    // Validación de que sea diferente a la actual
    if (passwords.current === passwords.new) {
      setLocalError("La nueva contraseña debe ser diferente a la actual");
      onValidationError?.(true);
      return;
    }

    onValidationError?.(false);
    onSubmit(passwords.current, passwords.new, passwords.confirm);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-md mx-auto w-full">
      
      {activeError && (
        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs border border-red-100 font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
          <AlertCircle size={14} className="shrink-0" />
          <span>{activeError}</span>
        </div>
      )}

      <div className="space-y-3">
        {/* Contraseña Actual */}
        <Input 
          label="CONTRASEÑA ACTUAL"
          type={showCurrent ? "text" : "password"}
          placeholder="••••••••"
          iconLeft={<Lock size={14} />}
          iconRight={
            <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="hover:text-blue-600 transition-colors">
              {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          }
          value={passwords.current}
          onChange={(e) => {
            setLocalError(null);
            setPasswords({...passwords, current: e.target.value});
          }}
          onBlur={() => handleBlur('current')}
          required
        />
        {touched.current && !passwords.current && (
          <p className="mt-1 text-xs text-red-600 flex items-center gap-1 ml-1">
            <AlertCircle size={12} /> La contraseña actual es requerida
          </p>
        )}

        {/* Nueva Contraseña */}
        <Input 
          label="NUEVA CONTRASEÑA"
          type={showNew ? "text" : "password"}
          placeholder="•••••••• (mínimo 8 caracteres)"
          iconLeft={<Key size={14} />}
          iconRight={
            <button type="button" onClick={() => setShowNew(!showNew)} className="hover:text-blue-600 transition-colors">
              {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          }
          value={passwords.new}
          onChange={(e) => {
            setLocalError(null);
            setPasswords({...passwords, new: e.target.value});
          }}
          onBlur={() => handleBlur('new')}
          required
        />

        {/* Indicador de fortaleza */}
        {touched.new && passwords.new && (
          <div className="mt-1 ml-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium text-gray-600">Fortaleza:</span>
              <div className="flex gap-1 flex-1">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`h-1.5 flex-1 rounded-full transition-all ${
                      passwordStrength.level >= level
                        ? passwordStrength.color
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className={`text-xs font-medium ${
                passwordStrength.level >= 3 ? 'text-green-600' : 'text-gray-500'
              }`}>
                {passwordStrength.text}
              </span>
            </div>
          </div>
        )}

        {/* Confirmar Nueva Contraseña */}
        <Input 
          label="CONFIRMAR NUEVA CONTRASEÑA"
          type={showConfirm ? "text" : "password"}
          placeholder="••••••••"
          iconLeft={<ShieldCheck size={14} />}
          iconRight={
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="hover:text-blue-600 transition-colors">
              {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          }
          value={passwords.confirm}
          onChange={(e) => {
            setLocalError(null);
            setPasswords({...passwords, confirm: e.target.value});
          }}
          onBlur={() => handleBlur('confirm')}
          required
        />
      </div>

      {/* Mensaje de coincidencia en tiempo real */}
      {touched.confirm && passwords.confirm && passwords.new !== passwords.confirm && (
        <div className="bg-amber-50 text-amber-600 p-2.5 rounded-xl text-xs border border-amber-100 font-medium flex items-center gap-2">
          <AlertCircle size={12} />
          <span>Las contraseñas no coinciden</span>
        </div>
      )}

      {touched.confirm && passwords.confirm && passwords.new === passwords.confirm && passwords.new.length >= 8 && (
        <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl text-xs border border-emerald-100 font-medium flex items-center gap-2">
          <CheckCircle2 size={12} />
          <span>Las contraseñas coinciden</span>
        </div>
      )}

      {/* Requisitos de seguridad */}
      <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
        <p className="text-[0.65rem] font-black text-slate-700 mb-2 uppercase tracking-wider">
          Requisitos de seguridad:
        </p>
        <div className="flex flex-wrap gap-x-3 gap-y-1.5">
          <span className={`flex items-center gap-1 text-[11px] font-medium transition-colors ${validations.minChars ? 'text-emerald-600' : 'text-slate-400'}`}>
            <CheckCircle2 size={10} /> 8 caracteres
          </span>
          <span className={`flex items-center gap-1 text-[11px] font-medium transition-colors ${validations.hasUpperCase ? 'text-emerald-600' : 'text-slate-400'}`}>
            <CheckCircle2 size={10} /> Mayúscula
          </span>
          <span className={`flex items-center gap-1 text-[11px] font-medium transition-colors ${validations.hasNumber ? 'text-emerald-600' : 'text-slate-400'}`}>
            <CheckCircle2 size={10} /> Número
          </span>
          <span className={`flex items-center gap-1 text-[11px] font-medium transition-colors ${validations.notSameAsCurrent && passwords.current ? 'text-emerald-600' : 'text-slate-400'}`}>
            <CheckCircle2 size={10} /> Diferente a actual
          </span>
        </div>
      </div>

      {/* Botón de cambio - Siempre habilitado */}
      <div className="mt-1">
        <Button 
          type="submit" 
          loading={loading} 
          className="w-full h-11 text-sm rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Actualizando...
            </div>
          ) : (
            'Cambiar Contraseña'
          )}
        </Button>
      </div>
    </form>
  );
};