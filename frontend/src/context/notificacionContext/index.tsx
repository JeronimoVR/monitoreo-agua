'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { streamClient } from '@service/stream-client';
import { apiClient } from '@service/api-client';
import { useEstacionesContext } from '@context/estacionesContext';
import { Muestreo, Medida } from '@/src/shared/sampling/dto/muestreo.dto';
import { Parametro } from '@/src/shared/sampling/dto/parametro.dto';

interface NotificationContextType {
  notifications: Muestreo[];
  loading: boolean;
  refresh: () => void;
  isSensorConnected: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { estacionSeleccionada } = useEstacionesContext();
  const [notifications, setNotifications] = useState<Muestreo[]>([]);
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Usamos una referencia para el timestamp de actividad para evitar romper el useEffect del SSE
  const lastActivityRef = useRef<number>(0);

  const transformData = useCallback((payload: any): Muestreo => {
    if (payload.medidas) return payload as Muestreo;

    // Adaptado al estándar camelCase unificado previamente
    const parametro: Parametro = {
      id: payload.parametro?.id,
      nombre: (payload.parametro?.nombre || payload.parametro || 'S/N').toUpperCase(),
      unidadMedida: payload.parametro?.unidadMedida || payload.parametro?.unidad_medida || payload.parametro?.unidad || payload.unidad || '',
      valorMinimo: payload.parametro?.valorMinimo || payload.parametro?.valor_minimo || 0,
      valorMaximo: payload.parametro?.valorMaximo || payload.parametro?.valor_maximo || 100,
      puntajeRiesgo: payload.parametro?.puntajeRiesgo || payload.parametro?.nivel_riesgo || 0,
      descripcion: payload.parametro?.descripcion || '',
    };

    const medida: Medida = {
      id: payload.medidaId || payload.id || Number(`${Date.now()}${Math.floor(Math.random() * 1000)}`),
      valor: Number(payload.valor || 0),
      parametro
    };

    return {
      id: payload.id || Number(`${Date.now()}${Math.floor(Math.random() * 1000)}`),
      estacionId: payload.estacionId || payload.estacion?.id || 0,
      fechaMuestreo: payload.fechaMuestreo || payload.fecha_muestreo || payload.fecha || new Date().toISOString(),
      irca_calculado: Number(payload.irca_calculado || payload.irca || 0),
      medidas: [medida]
    };
  }, []);

  const fetchLatestData = useCallback(async (showLoading = false) => {
    if (!estacionSeleccionada) return;
    try {
      if (showLoading) setLoading(true);
      const history = await apiClient.muestreos.getHistorial(estacionSeleccionada.id);
      const sorted = history.sort((a, b) => new Date(b.fechaMuestreo).getTime() - new Date(a.fechaMuestreo).getTime());
      setNotifications(sorted);
    } catch (error) {
      console.error('Error obteniendo historial:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [estacionSeleccionada]);

  // Efecto Principal: Control de la conexión SSE y Sondeo (Polling) de respaldo
  useEffect(() => {
    if (!estacionSeleccionada) return;

    fetchLatestData(true);

    // Polling de seguridad cada 30s
    const pollInterval = setInterval(() => fetchLatestData(false), 30000);

    const disconnect = streamClient.connect(
      (data: any) => {
        if (!data || typeof data !== 'object') return;

        // 1. Procesar latidos de estatus de sensores
        if ('status' in data) {
          const statusValue = String(data.status || '').toLowerCase();
          const newStatus = statusValue === 'online' || statusValue === 'conectado';
          
          setIsOnline(newStatus);
          if (newStatus) lastActivityRef.current = Date.now();
          return;
        }

        // 2. Errores de persistencia de base de datos desde el broker
        if (data.error === true) {
          console.error(`ERROR BD: ${String(data.mensaje || '')}`, data.detalle);
          return;
        }

        // 3. Procesar nuevo muestreo en tiempo real
        const transformed = transformData(data);

        // Descartar si pertenece a otra estación de monitoreo
        if (transformed.estacionId && String(transformed.estacionId) !== String(estacionSeleccionada.id)) {
          return;
        }

        lastActivityRef.current = Date.now();
        setIsOnline(true);

        setNotifications((prev) => {
          if (prev.some((item) => item.id === transformed.id)) return prev;
          return [transformed, ...prev].slice(0, 100);
        });
      },
      (err) => console.error('SSE Error en Provider:', err)
    );

    return () => {
      clearInterval(pollInterval);
      disconnect();
    };
  }, [estacionSeleccionada, fetchLatestData, transformData]); // ¡isOnline removido de aquí para evitar reconexiones infinitas!



  return (
    <NotificationContext.Provider value={{
      notifications,
      loading,
      refresh: () => fetchLatestData(true),
      isSensorConnected: isOnline
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationsContext = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotificationsContext must be used within NotificationProvider');
  return context;
};