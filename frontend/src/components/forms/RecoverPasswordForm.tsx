'use client';
import { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface RecoverPasswordFormProps {
  onSubmit: (email: string) => Promise<void>;
  loading: boolean;
}

export const RecoverPasswordForm = ({ onSubmit, loading }: RecoverPasswordFormProps) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input 
        label="Correo Electrónico"
        type="email"
        placeholder="ejemplo@correo.com"
        iconLeft="✉️"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <div style={{ marginTop: '25px' }}>
        <Button type="submit" loading={loading}>
          Enviar Enlace de Recuperación ↗
        </Button>
      </div>
    </form>
  );
};