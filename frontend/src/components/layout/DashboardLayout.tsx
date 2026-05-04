'use client';
import React from 'react';
import { Sidebar } from './Sidebar';
import { useNotificationsContext } from '@context/notificacionContext';

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { isSensorConnected } = useNotificationsContext();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* 
          Header Global del Dashboard
      */}
      <header className="h-[10vh] bg-white border-b border-slate-200 px-[5vw] flex items-center justify-between sticky top-0 z-[1000]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <svg width="18" height="22" viewBox="0 0 26 33" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.4469 28.05C13.7719 28.0225 14.0495 27.8919 14.2797 27.6581C14.5099 27.4244 14.625 27.1425 14.625 26.8125C14.625 26.4275 14.5031 26.1181 14.2594 25.8844C14.0156 25.6506 13.7042 25.5475 13.325 25.575C12.2146 25.6575 11.0365 25.3481 9.79063 24.6469C8.54479 23.9456 7.75937 22.6737 7.43437 20.8312C7.38021 20.5287 7.23802 20.2812 7.00781 20.0888C6.7776 19.8962 6.51354 19.8 6.21563 19.8C5.83646 19.8 5.525 19.9444 5.28125 20.2331C5.0375 20.5219 4.95625 20.8587 5.0375 21.2437C5.49792 23.7463 6.58125 25.5338 8.2875 26.6062C9.99375 27.6787 11.7135 28.16 13.4469 28.05ZM13 33C9.28958 33 6.19531 31.7075 3.71719 29.1225C1.23906 26.5375 0 23.32 0 19.47C0 16.72 1.07656 13.7294 3.22969 10.4981C5.38281 7.26688 8.63958 3.7675 13 0C17.3604 3.7675 20.6172 7.26688 22.7703 10.4981C24.9234 13.7294 26 16.72 26 19.47C26 23.32 24.7609 26.5375 22.2828 29.1225C19.8047 31.7075 16.7104 33 13 33Z" fill="currentColor" />
            </svg>
          </div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">AquaLab</h1>
        </div>

        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full animate-pulse ${isSensorConnected ? 'bg-emerald-500' : 'bg-red-500'}`} />
          <span className={`text-[0.7rem] font-bold uppercase tracking-wider ${isSensorConnected ? 'text-emerald-600' : 'text-red-600'}`}>
            {isSensorConnected ? 'En línea' : 'Desconectado'}
          </span>
        </div>
      </header>

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
          Navegación inferior fija
      */}
      <nav className="fixed bottom-0 left-0 right-0 h-[10vh] bg-white/90 backdrop-blur-xl border-t border-slate-200 z-[1000] shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <Sidebar />
      </nav>
    </div>
  );
};