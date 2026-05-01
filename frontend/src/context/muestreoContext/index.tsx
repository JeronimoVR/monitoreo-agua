'use client';
import React, { createContext, useContext } from 'react';
import { useEstaciones } from '@hooks/useEstaciones';
import { useStream } from '@hooks/useStream';

interface MuestreoContextType {
  estaciones: any[];
  estacionSeleccionada: string | null;
  setEstacionSeleccionada: (id: string) => void;
  realTimeData: any[]; // Historial de la ráfaga actual
  lastEvent: any | null;
}

const MuestreoContext = createContext<MuestreoContextType | undefined>(undefined);

export const MuestreoProvider = ({ children }: { children: React.ReactNode }) => {
  const { estaciones, estacionSeleccionada, setEstacionSeleccionada } = useEstaciones();
  
  // El stream solo se activa si hay una estación seleccionada
  const { history, lastNotification } = useStream(!!estacionSeleccionada);

  return (
    <MuestreoContext.Provider value={{ 
      estaciones, 
      estacionSeleccionada, 
      setEstacionSeleccionada, 
      realTimeData: history,
      lastEvent: lastNotification
    }}>
      {children}
    </MuestreoContext.Provider>
  );
};

export const useMuestreoContext = () => {
  const context = useContext(MuestreoContext);
  if (!context) throw new Error('useMuestreoContext debe usarse dentro de MuestreoProvider');
  return context;
};