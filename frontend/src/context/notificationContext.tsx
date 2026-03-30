// src/context/NotificationContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { streamClient, NotificationData } from '@service/stream-client';

interface NotificationContextType {
  notifications: NotificationData[];
  unreadCount: number;
  showToast: boolean;
  lastData: NotificationData | null;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Estados para la alerta (Toast)
  const [showToast, setShowToast] = useState(false);
  const [lastData, setLastData] = useState<NotificationData | null>(null);

  useEffect(() => {
    // Eliminamos la restricción de isAuthenticated para que la Home pública reciba datos
    const disconnect = streamClient.connect(
      (newData) => {
        setNotifications((prev) => [newData, ...prev].slice(0, 50));
        setUnreadCount((prev) => prev + 1);
        
        // Lógica de la Alerta Pequeña
        setLastData(newData);
        setShowToast(true);

        // Ocultar automáticamente después de 3 segundos
        const timer = setTimeout(() => {
          setShowToast(false);
        }, 3000);

        if (newData.tipo === 'ALERTA') {
           console.warn('¡Crítico!', newData);
        }

        return () => clearTimeout(timer);
      },
      (error) => console.error('Error en Stream SSE:', error)
    );

    return () => disconnect();
  }, []); // Se conecta al montar la app, independientemente del login

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, showToast, lastData, clearNotifications }}>
      {children}
      
      {/* COMPONENTE VISUAL DE LA ALERTA (TOAST) */}
      {showToast && lastData && (
        <div className="fixed top-4 right-4 z-[100] animate-in slide-in-from-right fade-in duration-300">
          <div className="bg-slate-900/90 backdrop-blur-sm text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3">
            <div className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </div>
            <div className="flex flex-col">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Nueva lectura</p>
              <p className="text-xs font-medium">
                {lastData.parametro}: <span className="text-blue-400">{lastData.valor}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotificationsContext = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotificationsContext debe usarse dentro de NotificationProvider');
  return context;
};