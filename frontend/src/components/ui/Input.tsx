'use client';
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Input = ({ label, iconLeft, iconRight, ...props }: InputProps) => (
  <div className="flex flex-col gap-[0.8vh] w-full">
    <label className="text-[0.85rem] font-black text-slate-700 ml-[1vw] uppercase tracking-tight">
      {label}
    </label>
    <div className="relative group">
      {iconLeft && (
        <div className="absolute left-[4vw] top-1/2 -translate-y-1/2 text-[1.2rem] text-slate-400 group-focus-within:text-blue-600 transition-colors">
          {iconLeft}
        </div>
      )}
      <input 
        {...props}
        className={`
          w-full h-[6.5vh] bg-white border-[0.4vw] border-slate-100 rounded-[3vw] px-[4vw] 
          ${iconLeft ? 'pl-[12vw]' : ''} 
          ${iconRight ? 'pr-[12vw]' : ''}
          text-slate-900 text-[1rem] placeholder:text-slate-300
          focus:outline-none focus:border-blue-600 focus:ring-[1.5vw] focus:ring-blue-100
          transition-all duration-200 shadow-sm
        `}
      />
      {iconRight && (
        <div className="absolute right-[4vw] top-1/2 -translate-y-1/2 text-slate-400">
          {iconRight}
        </div>
      )}
    </div>
  </div>
);