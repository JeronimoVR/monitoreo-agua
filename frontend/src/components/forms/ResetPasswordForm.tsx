'use client';
import { useState, useMemo } from 'react';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';

export const ResetPasswordForm = ({ onSubmit, loading }: any) => {
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwords, setPasswords] = useState({ new: '', confirm: '' });

  // Validaciones en tiempo real para el checklist de seguridad
  const validations = useMemo(() => ({
    minChars: passwords.new.length >= 8,
    specialChar: /[!@#$%^&*(),.?":{}|<>0-9]/.test(passwords.new)
  }), [passwords.new]);

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(passwords.new); }}>
      <Input 
        label="NUEVA CONTRASEÑA"
        type={showPass ? "text" : "password"}
        iconLeft="🔒"
        iconRight={<button type="button" onClick={() => setShowPass(!showPass)}>{showPass ? "👁️" : "🙈"}</button>}
        onChange={(e) => setPasswords({...passwords, new: e.target.value})}
        required
      />

      <Input 
        label="CONFIRMAR NUEVA CONTRASEÑA"
        type={showConfirm ? "text" : "password"}
        iconLeft="🛡️"
        iconRight={<button type="button" onClick={() => setShowConfirm(!showConfirm)}>{showConfirm ? "👁️" : "🙈"}</button>}
        onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
        required
      />

      {/* Checklist de Requisitos de Seguridad según el diseño */}
      <div style={{ backgroundColor: '#f0f4f8', padding: '15px', borderRadius: '8px', margin: '15px 0', textAlign: 'left' }}>
        <p style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '10px' }}>Requisitos de seguridad:</p>
        <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.85rem' }}>
          <li style={{ color: validations.minChars ? '#10b981' : '#666' }}>
            {validations.minChars ? '✅' : '○'} Mínimo 8 caracteres
          </li>
          <li style={{ color: validations.specialChar ? '#10b981' : '#666' }}>
            {validations.specialChar ? '✅' : '○'} Un número o símbolo especial
          </li>
        </ul>
      </div>

      <Button 
        type="submit" 
        loading={loading} 
        disabled={!validations.minChars || !validations.specialChar || passwords.new !== passwords.confirm}
      >
        Actualizar Contraseña
      </Button>
    </form>
  );
};