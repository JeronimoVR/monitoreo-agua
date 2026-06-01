'use client';

import { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Mail, AlertCircle } from 'lucide-react';
import { forgotPasswordSchema } from '@/src/lib/validations';
import z from 'zod';

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

interface RecoverPasswordFormProps {
  onSubmit: (data: ForgotPasswordInput) => Promise<void>;
  loading: boolean;
}

export const RecoverPasswordForm = ({
  onSubmit,
  loading,
}: RecoverPasswordFormProps) => {
  const [email, setEmail] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setValidationError(null);

    const validation = forgotPasswordSchema.safeParse({
      correo: email,
    });

    if (!validation.success) {
      setValidationError(
        validation.error.issues[0]?.message ||
          'Correo electrónico inválido.'
      );
      return;
    }

    await onSubmit(validation.data);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">

      {validationError && (
        <div className="bg-red-50 border border-red-100 text-red-700 rounded-xl p-4 text-sm font-medium flex items-center gap-2">
          <AlertCircle size={18} className="shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      <Input
        label="Correo Electrónico"
        type="email"
        placeholder='Correo electrónico'
        iconLeft={<Mail size={18} />}
        value={email}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setValidationError(null);
          setEmail(e.target.value);
        }}
        required
      />

      <Button
        type="submit"
        loading={loading}
        className="w-full h-14 text-lg"
      >
        Enviar enlace
      </Button>

    </form>
  );
};