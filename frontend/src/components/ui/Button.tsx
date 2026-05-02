'use client';
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: 'solid' | 'outline';
}

export const Button = ({ children, loading, variant = 'solid', ...props }: ButtonProps) => (
  <button 
    {...props} 
    disabled={loading || props.disabled}
    className={`btn-${variant}`} // Clase base para futuro CSS
  >
    {loading ? 'Procesando...' : children}
  </button>
);