'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const AuthLayout = ({ 
  children, 
  title, 
  hideBackButton = false 
}: { 
  children: React.ReactNode, 
  title: string,
  hideBackButton?: boolean
}) => {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-[5vw] relative">
      {/* Botón de Regreso */}
      {!hideBackButton && (
        <div className="absolute top-8 left-8 sm:top-12 sm:left-12">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold transition-all group"
          >
            <div className="p-2 bg-white rounded-xl shadow-sm group-hover:shadow-md transition-all">
              <ArrowLeft size={20} />
            </div>
            <span className="hidden sm:inline">Volver</span>
          </Link>
        </div>
      )}

      {/* Contenedor tipo Tarjeta */}
      <div className="w-full max-w-[450px] bg-white rounded-[8vw] sm:rounded-[2rem] shadow-2xl shadow-blue-900/5 p-[8vw] sm:p-10 flex flex-col relative overflow-hidden">
        {/* Decoración sutil superior */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600"></div>

        <div className="flex-1">
          {title && (
            <h2 className="text-[1.4rem] font-black text-slate-800 mb-[3vh] text-center">
              {title}
            </h2>
          )}
          {children}
        </div>
      </div>
    </section>
  );
};
