'use client';
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Input = ({ label, iconLeft, iconRight, ...props }: InputProps) => (
  <div className="flex flex-col gap-2 w-full">
    <label className="text-sm font-black text-slate-700 ml-1 md:ml-2 uppercase tracking-tight">
      {label}
    </label>
    <div className="relative group">
      {iconLeft && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-400 group-focus-within:text-[#0056C6] transition-colors z-10">
          {iconLeft}
        </div>
      )}
      <input 
        {...props}
        className={`
          w-full h-14 md:h-12 bg-white border-2 border-slate-100 rounded-2xl md:rounded-xl px-5 
          ${iconLeft ? 'pl-12' : ''} 
          ${iconRight ? 'pr-12' : ''}
          text-slate-900 text-base placeholder:text-slate-400
          focus:outline-none focus:border-[#0056C6] focus:ring-4 focus:ring-blue-50
          transition-all duration-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-slate-200
        `}
      />
      {iconRight && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 z-10">
          {iconRight}
        </div>
      )}
    </div>
  </div>
);