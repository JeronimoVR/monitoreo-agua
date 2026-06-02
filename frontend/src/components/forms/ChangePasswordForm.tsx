'use client';
import { useState } from 'react';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle, Key, Shield } from 'lucide-react';

interface ResetPasswordFormProps {
  onSubmit: (newPassword: string) => void;
  loading?: boolean;
  error?: string | null;
  onValidationError?: (active: boolean) => void;
}

export function ResetPasswordForm({ 
  onSubmit, 
  loading = false, 
  error = null, 
  onValidationError 
}: ResetPasswordFormProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Estados para mostrar/ocultar contraseñas
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  // Estados de validación
  const [touched, setTouched] = useState({
    new: false,
    confirm: false
  });
  
  const [localError, setLocalError] = useState<string | null>(null);

  // Validaciones en tiempo real
  const isNewPasswordValid = newPassword.length >= 6;
  const doPasswordsMatch = newPassword === confirmPassword;

  // Calcular fortaleza de la contraseña
  const getPasswordStrength = () => {
    if (!newPassword) return { level: 0, text: '', color: '' };
    
    let strength = 0;
    if (newPassword.length >= 8) strength++;
    if (newPassword.match(/[A-Z]/)) strength++;
    if (newPassword.match(/[0-9]/)) strength++;
   
    
    if (strength === 0) return { level: 1, text: 'Muy débil', color: 'bg-red-500' };
    if (strength === 1) return { level: 2, text: 'Débil', color: 'bg-orange-500' };
    if (strength === 2) return { level: 3, text: 'Media', color: 'bg-yellow-500' };
    if (strength === 3) return { level: 4, text: 'Fuerte', color: 'bg-green-500' };
    return { level: 5, text: 'Muy fuerte', color: 'bg-emerald-500' };
  };

  const passwordStrength = getPasswordStrength();

  const validateForm = () => {
    // Validación de campos vacíos
    if (!newPassword.trim()) {
      setLocalError('Ingresa una nueva contraseña');
      onValidationError?.(true);
      return false;
    }
    if (!confirmPassword.trim()) {
      setLocalError('Confirma tu nueva contraseña');
      onValidationError?.(true);
      return false;
    }
    
    // Validación de longitud mínima de nueva contraseña
    if (newPassword.length < 8) {
      setLocalError('La contraseña debe tener al menos 8 caracteres');
      onValidationError?.(true);
      return false;
    }
    
    // Validación de coincidencia
    if (newPassword !== confirmPassword) {
      setLocalError('Las contraseñas no coinciden');
      onValidationError?.(true);
      return false;
    }
    
    setLocalError(null);
    onValidationError?.(false);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(newPassword);
    }
  };

  const handleBlur = (field: 'new' | 'confirm') => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Nueva Contraseña */}
      <div>
        <Input
          label="NUEVA CONTRASEÑA"
          type={showNew ? "text" : "password"}
          placeholder="•••••••• (mínimo 8 caracteres)"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          onBlur={() => handleBlur('new')}
          disabled={loading}
          iconLeft={<Key size={18} />}
          iconRight={
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="focus:outline-none"
            >
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />
        
        {/* Indicador de fortaleza */}
        {touched.new && newPassword && (
          <div className="mt-2 ml-1">
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
            <ul className="text-xs text-gray-500 space-y-0.5 mt-1">
              <li className={`flex items-center gap-1 ${newPassword.length >= 6 ? 'text-green-600' : ''}`}>
                {newPassword.length >= 6 ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                Mínimo 8 caracteres
              </li>
              <li className={`flex items-center gap-1 ${/[A-Z]/.test(newPassword) ? 'text-green-600' : ''}`}>
                {/[A-Z]/.test(newPassword) ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                Una letra mayúscula
              </li>
              <li className={`flex items-center gap-1 ${/[0-9]/.test(newPassword) ? 'text-green-600' : ''}`}>
                {/[0-9]/.test(newPassword) ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                Un número
              </li>

            </ul>
          </div>
        )}
        
        {touched.new && newPassword && newPassword.length < 6 && (
          <p className="mt-1 text-xs text-red-600 flex items-center gap-1 ml-1">
            <AlertCircle size={12} /> La contraseña debe tener al menos 6 caracteres
          </p>
        )}
      </div>

      {/* Confirmar Nueva Contraseña */}
      <div>
        <Input
          label="CONFIRMAR NUEVA CONTRASEÑA"
          type={showConfirm ? "text" : "password"}
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          onBlur={() => handleBlur('confirm')}
          disabled={loading}
          iconLeft={<Shield size={18} />}
          iconRight={
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="focus:outline-none"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />
        
        {/* Mensaje de coincidencia */}
        {touched.confirm && confirmPassword && newPassword !== confirmPassword && (
          <p className="mt-1 text-xs text-red-600 flex items-center gap-1 ml-1">
            <AlertCircle size={12} /> Las contraseñas no coinciden
          </p>
        )}
        
        {touched.confirm && confirmPassword && newPassword === confirmPassword && newPassword.length >= 6 && (
          <p className="mt-1 text-xs text-green-600 flex items-center gap-1 ml-1">
            <CheckCircle size={12} /> Las contraseñas coinciden
          </p>
        )}
      </div>

      {/* Error general */}
      {(localError || error) && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <p className="text-sm text-red-700 flex items-center gap-2">
            <AlertCircle size={16} />
            {localError || error}
          </p>
        </div>
      )}

      {/* Aviso de seguridad */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
        <p className="text-xs text-blue-700 flex items-center gap-2">
          <Lock size={14} />
          Por seguridad, se recomienda usar una contraseña que no hayas usado antes y que contenga al menos 8 caracteres, mayúsculas, números y símbolos.
        </p>
      </div>

      {/* Botón de restablecer */}
      <Button
        type="submit"
        variant="solid"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-2xl transition-all duration-200"
        disabled={loading}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Restableciendo contraseña...
          </div>
        ) : (
          'Restablecer Contraseña'
        )}
      </Button>
    </form>
  );
}