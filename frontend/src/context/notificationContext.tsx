// src/context/NotificationContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { streamClient, NotificationData } from '@service/stream-client';
import { useAuth } from '@context/authContext';

interface NotificationContextType {
  notifications: NotificationData[];
  unreadCount: number;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // REGLA: Solo conectar si el usuario está logeado
    if (!isAuthenticated) return;

    const disconnect = streamClient.connect(
      (newData) => {
        setNotifications((prev) => [newData, ...prev].slice(0, 50)); // Guardamos las últimas 50
        setUnreadCount((prev) => prev + 1);
        
        // Opcional: Reproducir sonido de alerta si el tipo es crítico
        if (newData.tipo === 'ALERTA') {
           console.warn('¡Nueva alerta de sensores!', newData);
        }
      },
      (error) => console.error('Error en Stream SSE:', error)
    );

    return () => disconnect();
  }, [isAuthenticated]);

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, clearNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationsContext = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotificationsContext debe usarse dentro de NotificationProvider');
  return context;
};