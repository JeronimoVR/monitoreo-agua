'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '@service/api-client';

interface Estacion {
  id: string;
  nombre: string;
  ubicacion: string;
  estado: string;
}

interface EstacionesContextType {
  estaciones: Estacion[];
  estacionSeleccionada: Estacion | null;
  loading: boolean;
  seleccionarEstacion: (id: string) => void;
  refrescarEstaciones: () => Promise<void>;
}

const EstacionesContext = createContext<EstacionesContextType | undefined>(undefined);

export const EstacionesProvider = ({ children }: { children: React.ReactNode }) => {
  const [estaciones, setEstaciones] = useState<Estacion[]>([]);
  const [estacionSeleccionada, setEstacionSeleccionada] = useState<Estacion | null>(null);
  const [loading, setLoading] = useState(true);

  // 2. Función para cargar estaciones desde la API
  const refrescarEstaciones = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiClient.estaciones.getAll();
      setEstaciones(data);
      
      // Si hay estaciones y no hay ninguna seleccionada, seleccionamos la primera por defecto
      if (data.length > 0 && !estacionSeleccionada) {
        setEstacionSeleccionada(data[0]);
      }
    } catch (error) {
      console.error('Error cargando estaciones:', error);
    } finally {
      setLoading(false);
    }
  }, [estacionSeleccionada]);

  // 3. Función para cambiar la estación globalmente
  const seleccionarEstacion = (id: string) => {
    const encontrada = estaciones.find(e => e.id === id);
    if (encontrada) {
      setEstacionSeleccionada(encontrada);
    }
  };

  useEffect(() => {
    refrescarEstaciones();
  }, []); // Solo al montar la aplicación

  return (
    <EstacionesContext.Provider 
      value={{ 
        estaciones, 
        estacionSeleccionada, 
        loading, 
        seleccionarEstacion, 
        refrescarEstaciones 
      }}
    >
      {children}
    </EstacionesContext.Provider>
  );
};

// 4. Hook personalizado para consumir este contexto fácilmente
export const useEstacionesContext = () => {
  const context = useContext(EstacionesContext);
  if (!context) {
    throw new Error('useEstacionesContext debe usarse dentro de un EstacionesProvider');
  }
  return context;
};