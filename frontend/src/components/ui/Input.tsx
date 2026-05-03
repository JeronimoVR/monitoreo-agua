'use client';
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Input = ({ label, iconLeft, iconRight, ...props }: InputProps) => (
  <div className="flex flex-col gap-1.5 w-full">
    <label className="text-sm font-bold text-slate-700 ml-1">
      {label}
    </label>
    <div className="relative group">
      {iconLeft && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors">
          {iconLeft}
        </div>
      )}
      <input 
        {...props} 
        className={`
          w-full h-12 bg-white border-2 border-slate-200 rounded-xl px-4 
          ${iconLeft ? 'pl-11' : ''} 
          ${iconRight ? 'pr-11' : ''}
          text-slate-900 placeholder:text-slate-400
          focus:outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100
          transition-all duration-200
        `}
      />
      {iconRight && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
          {iconRight}
        </div>
      )}
    </div>
  </div>
);