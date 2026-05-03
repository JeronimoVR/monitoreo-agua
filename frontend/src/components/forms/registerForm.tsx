'use client';
import { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

export const RegisterForm = ({ onSubmit, loading, error }: any) => {
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }
    // Enviamos solo los datos que el backend espera
    const { confirmPassword, ...dataToSend } = formData;
    onSubmit(dataToSend);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input 
        label="Nombre Completo"
        placeholder="Ingresa tu nombre"
        iconLeft="👤"
        onChange={(e) => setFormData({...formData, nombre: e.target.value})}
        required
      />
      
      <Input 
        label="Correo Electrónico"
        type="email"
        placeholder="ejemplo@ejemplo.com"
        iconLeft="✉️"
        onChange={(e) => setFormData({...formData, correo: e.target.value})}
        required
      />

      <Input 
        label="Contraseña"
        type="password"
        placeholder="Mínimo 8 caracteres"
        iconLeft="🔒"
        onChange={(e) => setFormData({...formData, password: e.target.value})}
        required
      />

      <Input 
        label="Confirmar Contraseña"
        type="password"
        placeholder="Repite tu contraseña"
        iconLeft="🛡️"
        onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
        required
      />

      <div style={{ margin: '20px 0' }}>
        <Button type="submit" loading={loading}>
          Registrarse →
        </Button>
      </div>
    </form>
  );
};