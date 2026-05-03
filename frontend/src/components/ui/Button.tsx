'use client';
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: 'solid' | 'outline';
}

export const Button = ({ children, loading, variant = 'solid', ...props }: ButtonProps) => {
  // Ajuste a unidades de Viewport: py-[2vh] y px-[5vw]
  const baseStyles = "w-full py-[1.8vh] px-[5vw] rounded-[4vw] font-bold flex items-center justify-center gap-[2vw] transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:pointer-events-none text-[1.1rem]";
  
  const variants = {
    solid: "bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700",
    outline: "bg-transparent border-[0.5vw] border-blue-600 text-blue-600 hover:bg-blue-50"
  };

  return (
    <button 
      {...props} 
      disabled={loading || props.disabled}
      className={`${baseStyles} ${variants[variant]} ${props.className || ''}`}
    >
      {loading ? (
        <span className="flex items-center gap-[2vw]">
          <svg className="animate-spin h-[3vh] w-[3vh] text-current" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Procesando...
        </span>
      ) : (
        children
      )}
    </button>
  );
};