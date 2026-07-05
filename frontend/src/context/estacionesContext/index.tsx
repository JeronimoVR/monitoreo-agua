'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '@service/api-client';
import { Estacion } from '@shared/stations/dto/estacion.dto';
import { logger } from '@/src/lib/logger';

interface EstacionesContextType {
  estaciones: Estacion[];
  estacionSeleccionada: Estacion | null;
  loading: boolean;
  seleccionarEstacion: (id: string | number) => void;
  refrescarEstaciones: () => Promise<void>;
}

const EstacionesContext = createContext<EstacionesContextType | undefined>(undefined);

export const EstacionesProvider = ({ children }: { children: React.ReactNode }) => {
  const [estaciones, setEstaciones] = useState<Estacion[]>([]);
  const [estacionSeleccionada, setEstacionSeleccionada] = useState<Estacion | null>(null);
  const [loading, setLoading] = useState(true);

  const refrescarEstaciones = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.estaciones.getAll();
      setEstaciones(data);
      
      const savedId = localStorage.getItem('last_estacion_id');
      const found = data.find((e: Estacion) => String(e.id) === savedId);
      
      if (found) {
        setEstacionSeleccionada(found);
      } else if (data.length > 0) {
        setEstacionSeleccionada(data[0]);
      }
    } catch (error) {
      console.error({ err: error }, 'Error cargando estaciones:');
    } finally {
      setLoading(false);
    }
  }, []);

  const seleccionarEstacion = (id: string | number) => {
    const encontrada = estaciones.find(e => String(e.id) === String(id));
    if (encontrada) {
      setEstacionSeleccionada(encontrada);
      localStorage.setItem('last_estacion_id', String(id));
    }
  };

  useEffect(() => {
    refrescarEstaciones();
  }, [refrescarEstaciones]);

  return (
    <EstacionesContext.Provider value={{
      estaciones,
      estacionSeleccionada,
      loading,
      seleccionarEstacion,
      refrescarEstaciones
    }}>
      {children}
    </EstacionesContext.Provider>
  );
};

export const useEstacionesContext = () => {
  const context = useContext(EstacionesContext);
  if (!context) throw new Error('useEstacionesContext debe usarse dentro de EstacionesProvider');
  return context;
};
