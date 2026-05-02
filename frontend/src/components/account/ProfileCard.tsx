'use client';
import React from 'react';
import { useAuthContext } from '@context/authContext';

export const ProfileCard = () => {
  const { user } = useAuthContext();
  
  // Generar iniciales dinámicamente (ej: Jerónimo Rojas -> JR)
  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';
  };

  return (
    <div className="profile-card-container">
      <div className="avatar-circle">
        {getInitials(user?.nombre || 'Usuario')}
      </div>
      <div className="profile-details">
        <h3>{user?.nombre || 'Usuario'} <span>✏️</span></h3>
        <p>{user?.correo || 'usuario@ejemplo.com'}</p>
      </div>
    </div>
  );
};