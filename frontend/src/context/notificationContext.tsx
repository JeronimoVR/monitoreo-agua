'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { streamClient } from '@service/stream-client';
import { apiClient } from '@service/api-client';

export interface MonitoringData {
  id: string;
  fecha: Date;
  parametro: string;
  valor: number;
  irca: number;
  clasificacion: string;
  unidad?: string;
}

interface NotificationContextType {
  notifications: MonitoringData[];
  loading: boolean;
  refresh: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<MonitoringData[]>([]);
  const [loading, setLoading] = useState(true);

  // 💡 Función única de transformación para asegurar consistencia
  const transformData = useCallback((item: any): MonitoringData => {
    return {
      id: item.id || `${Date.now()}-${Math.random()}`,
      fecha: new Date((item.fecha_muestreo || item.fecha).replace('Z', '')), 
      parametro: (item.parametro?.nombre || item.parametro || 'S/N').toUpperCase(),
      valor: Number(item.valor || 0),
      irca: Number(item.irca_calculado || item.irca || 0),
      clasificacion: item.clasificacionIrca?.clasificacion || item.clasificacion || 'NORMAL',
      unidad: item.parametro?.unidad || item.unidad || ''
    };
  }, []);

  // Función para obtener datos históricos y aplanarlos
  const fetchLatestData = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      const history = await apiClient.muestreos.getHistorial('1');
      
      const flatHistory = history.flatMap((m: any) => 
        m.medidas.map((med: any) => transformData({ 
          ...med, 
          fecha_muestreo: m.fecha_muestreo, 
          irca_calculado: m.irca_calculado, 
          clasificacionIrca: m.clasificacionIrca 
        }))
      );
      
      // Ordenar por fecha descendente para consistencia
      const sortedHistory = flatHistory.sort((a: MonitoringData, b: MonitoringData) => 
        new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );

      setNotifications(sortedHistory);
    } catch (e) {
      console.error("Error obteniendo datos:", e);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [transformData]);

  useEffect(() => {
    // Carga inicial
    fetchLatestData(true);

    // 1. Polling de respaldo cada 30 segundos
    const pollInterval = setInterval(() => {
      console.log("Polling: Sincronizando datos de respaldo...");
      fetchLatestData(false);
    }, 30000);

    // 2. Conexión en tiempo real SSE
    const disconnect = streamClient.connect((newData) => {
      console.log("SSE: Nuevo dato recibido", newData);
      setNotifications((prev) => {
        const transformed = transformData(newData);
        // Eviter duplicados (mismo parámetro en el mismo segundo aproximadamente)
        const isDuplicate = prev.some((n: MonitoringData) => 
          n.parametro === transformed.parametro && 
          Math.abs(new Date(n.fecha).getTime() - new Date(transformed.fecha).getTime()) < 1000
        );
        
        if (isDuplicate) return prev;
        
        return [transformed, ...prev].slice(0, 100);
      });
    }, (err) => console.error("SSE Error:", err));

    return () => {
      clearInterval(pollInterval);
      disconnect();
    };
  }, [fetchLatestData, transformData]);

  const refresh = () => fetchLatestData(true);

  return (
    <NotificationContext.Provider value={{ notifications, loading, refresh }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationsContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationsContext must be used within a NotificationProvider');
  }
  return context;
};