'use client';
import { useState } from 'react';
import { useAuthContext } from '@context/authContext';
import { Field } from '@components/common/Field';
import { Button } from '@components/common/Button';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login, loading } = useAuthContext();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await login(form);
    if (res.success) router.push('/bienvenido');
    else alert(res.error);
  };

  return (
    <main>
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <Field label="Correo" type="email" name="email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <Field label="Contraseña" type="password" name="password" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <Button label={loading ? "Cargando..." : "Entrar"} type="submit" />
      </form>
    </main>
  );
}