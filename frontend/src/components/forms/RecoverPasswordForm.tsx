'use client';
import { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Mail } from 'lucide-react';

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Input 
        label="Correo Electrónico"
        type="email"
        placeholder="ejemplo@uniajc.edu.co"
        iconLeft={<Mail size={18} />}
        value={email}
        onChange={(e: any) => setEmail(e.target.value)}
        required
      />

      <div>
        <Button type="submit" loading={loading} className="w-full h-14 text-lg">
          Enviar Enlace ↗
        </Button>
      </div>
    </form>
  );
};