// src/components/ui/Toast.tsx
'use client';
import { CheckCircle2, XCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

export const Toast = ({ message, type, onClose }: ToastProps) => {
  return (
    <div className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border animate-in slide-in-from-right duration-500 ${
      type === 'success' 
        ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
        : 'bg-red-50 border-red-100 text-red-800'
    }`}>
      <div className={type === 'success' ? 'text-emerald-500' : 'text-red-500'}>
        {type === 'success' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
      </div>
      
      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
          {type === 'success' ? 'Éxito' : 'Error'}
        </span>
        <p className="text-sm font-bold leading-none">{message}</p>
      </div>

      <button onClick={onClose} className="ml-4 p-1 hover:bg-black/5 rounded-full transition-colors">
        <X size={16} className="opacity-40" />
      </button>
    </div>
  );
};