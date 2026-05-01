'use client';
import { useState } from 'react';
import { apiClient } from '@service/api-client';
import { Field } from '@components/common/Field';
import { Button } from '@components/common/Button';
import { useRouter } from 'next/navigation';

export default function RegistroPage() {
  const router = useRouter();
  const [form, setForm] = useState({ nombre: '', email: '', password: '', confirmPassword: '' });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación de Frontend
    if (form.password !== form.confirmPassword) {
      return alert("Las contraseñas no coinciden");
    }

    try {
      // Solo enviamos los campos que el backend espera
      const { confirmPassword, ...dataToSend } = form;
      await apiClient.usuarios.registro(dataToSend);
      router.push('/bienvenido');
    } catch (error) {
      alert("Error en el registro");
    }
  };

  return (
    <main>
      <h2>Registro de Usuario</h2>
      <form onSubmit={handleRegister}>
        <Field label="Nombre" type="text" name="nombre" value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
        <Field label="Correo" type="email" name="email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <Field label="Contraseña" type="password" name="password" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <Field label="Confirmar Contraseña" type="password" name="confirmPassword" value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} required />
        <Button label="Registrarme" type="submit" />
      </form>
    </main>
  );
}