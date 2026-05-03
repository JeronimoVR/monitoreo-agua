'use client';
import { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export const LoginForm = ({ onSubmit, loading, error }: any) => {
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({ correo: '', password: '' });

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(credentials); }}>
      <Input 
        label="CORREO ELECTRÓNICO"
        type="email"
        placeholder="usuario@ejemplo.com"
        iconLeft="✉️"
        onChange={(e) => setCredentials({...credentials, correo: e.target.value})}
        required
      />
      
      <Input 
        label="CONTRASEÑA"
        type={showPassword ? "text" : "password"}
        placeholder="••••••••"
        iconLeft="🔒"
        iconRight={
          <button type="button" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? "👁️" : "🙈"}
          </button>
        }
        onChange={(e) => setCredentials({...credentials, password: e.target.value})}
        required
      />

      <div style={{ textAlign: 'right', margin: '10px 0' }}>
        <a href="/recuperar-password" style={{ fontSize: '0.8rem' }}>¿Olvidaste tu contraseña?</a>
      </div>

      <Button type="submit" loading={loading}>
        Iniciar Sesión →
      </Button>
    </form>
  );
};