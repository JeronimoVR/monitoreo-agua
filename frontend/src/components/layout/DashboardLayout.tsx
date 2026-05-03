'use client';
import React from 'react';
import { Sidebar } from './Sidebar';

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* 
          Área de contenido con padding inferior dinámico (12vh) 
          para que la barra de navegación nunca tape la información 
      */}
      <main className="flex-1 pb-[12vh] w-full max-w-[100vw] overflow-x-hidden">
        <div className="container mx-auto">
          {children}
        </div>
      </main>

      {/* 
          Navegación inferior fija:
          Usa vh para la altura y backdrop-filter para un efecto moderno 
      */}
      <nav className="fixed bottom-0 left-0 right-0 h-[10vh] bg-white/80 backdrop-blur-lg border-t border-slate-200 z-[1000] shadow-[-5px_0_20px_rgba(0,0,0,0.05)]">
        <Sidebar />
      </nav>
    </div>
  );
};