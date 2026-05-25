'use client';

import { useEffect } from 'react';
import { Button } from '@components/ui/Button';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if available
    console.error('Unhandled Global Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFE] px-6 text-center font-sans">
      <div className="bg-white p-8 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col items-center max-w-sm">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle size={32} className="text-red-500 stroke-[2]" />
        </div>
        
        <h2 className="text-[#111827] font-extrabold text-2xl mb-2 tracking-tight">
          ¡Algo salió mal!
        </h2>
        
        <p className="text-[#6B7280] font-medium text-[15px] leading-relaxed mb-8">
          Hemos encontrado un problema inesperado al cargar esta página. Por favor, intenta de nuevo.
        </p>
        
        <Button 
          variant="solid" 
          onClick={() => reset()}
          className="w-full"
        >
          <RefreshCcw size={18} className="stroke-[2.5]" />
          Reintentar
        </Button>
      </div>
    </div>
  );
}
