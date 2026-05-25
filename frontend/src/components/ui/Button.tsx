'use client';
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: 'solid' | 'outline';
}

export const Button = ({ children, loading, variant = 'solid', ...props }: ButtonProps) => {
  const baseStyles = "w-full py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none text-[16px] tracking-wide";
  
  const variants = {
    solid: "bg-[#0056C6] text-white shadow-md shadow-blue-600/10 hover:bg-[#004bb0]",
    outline: "bg-transparent border-2 border-[#0056C6] text-[#0056C6] hover:bg-blue-50/30"
  };

  return (
    <button 
      {...props} 
      disabled={loading || props.disabled}
      className={`${baseStyles} ${variants[variant]} ${props.className || ''}`}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-current" viewBox="0 0 24 24">
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