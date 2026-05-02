'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { streamClient } from '@service/stream-client';
import { apiClient } from '@service/api-client';
import { useEstacionesContext } from '@context/estacionesContext';
import { Muestreo, Medida } from '@/src/shared/sampling/dto/muestreo.dto';

interface NotificationContextType {
  notifications: Muestreo[];
  loading: boolean;
  refresh: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { estacionSeleccionada } = useEstacionesContext();
  const [notifications, setNotifications] = useState<Muestreo[]>([]);
  const [loading, setLoading] = useState(false);
 
  const transformData = useCallback((item: any): Muestreo => {
    // Si ya es un objeto Muestreo (viniendo de la API o SSE bien formateado)
    if (item.medidas) return item;

    // Si viene como un objeto plano (viniendo de un SSE simplificado)
    return {
      id: item.id || Number(`${Date.now()}${Math.floor(Math.random() * 1000)}`),
      estacionId: item.estacionId || item.estacion?.id,
      fechaMuestreo: item.fecha_muestreo || item.fecha || new Date().toISOString(),
      irca_calculado: Number(item.irca_calculado || item.irca || 0),
      medidas: [{
        id: item.medidaId || item.id,
        parametro: (item.parametro?.nombre || item.parametro || 'S/N').toUpperCase(),
        valor: Number(item.valor || 0),
        unidad: item.parametro?.unidad || item.unidad || ''
      }]
    };
  }, []);

  const fetchLatestData = useCallback(async (showLoading = false) => {
    if (!estacionSeleccionada) return;
    try {
      if (showLoading) setLoading(true);
      const history = await apiClient.muestreos.getHistorial(estacionSeleccionada.id);
      
      // Ordenar por fecha descendente
      const sorted = history.sort((a, b) => 
        new Date(b.fechaMuestreo).getTime() - new Date(a.fechaMuestreo).getTime()
      );

      setNotifications(sorted);
    } catch (e) {
      console.error("Error obteniendo historial:", e);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [estacionSeleccionada]);

  useEffect(() => {
    if (!estacionSeleccionada) return;

    fetchLatestData(true);

    const pollInterval = setInterval(() => fetchLatestData(false), 30000);

    const disconnect = streamClient.connect((newData) => {
      const transformed = transformData(newData);
      
      // FILTRO CRÍTICO: Solo agregar si pertenece a la estación activa
      if (transformed.estacionId && String(transformed.estacionId) !== String(estacionSeleccionada.id)) return;

      setNotifications((prev) => {
        const isDuplicate = prev.some((n) => n.id === transformed.id);
        if (isDuplicate) return prev;
        return [transformed, ...prev].slice(0, 100);
      });
    }, (err) => console.error("SSE Error:", err));

    return () => {
      clearInterval(pollInterval);
      disconnect();
    };
  }, [estacionSeleccionada, fetchLatestData, transformData]);

  return (
    <NotificationContext.Provider value={{ notifications, loading, refresh: () => fetchLatestData(true) }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationsContext = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotificationsContext must be used within a NotificationProvider');
  return context;
};