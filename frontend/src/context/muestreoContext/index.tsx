'use client';
import React, { createContext, useContext, useState } from 'react';
import { useEstacionesContext } from '@context/estacionesContext';
import { apiClient } from '@service/api-client';

interface MuestreoContextType {
  generarReporte: (rango: { inicio: Date; fin: Date }) => Promise<void>;
  descargarCSV: () => void;
  isExporting: boolean;
}

const MuestreoContext = createContext<MuestreoContextType | undefined>(undefined);

export const MuestreoProvider = ({ children }: { children: React.ReactNode }) => {
  const { estacionSeleccionada } = useEstacionesContext();
  const [isExporting, setIsExporting] = useState(false);

  const generarReporte = async (rango: { inicio: Date; fin: Date }) => {
    if (!estacionSeleccionada) return;
    setIsExporting(true);
    try {
      // La función export devuelve la URL de descarga
      const url = apiClient.muestreos.export({
        estacionId: String(estacionSeleccionada.id),
        fechaInicio: rango.inicio.toISOString(),
        fechaFin: rango.fin.toISOString()
      });

      window.open(url, '_blank');
    } catch (error) {
      console.error("Error al exportar:", error);
    } finally {
      setIsExporting(false);
    }
  };

const descargarCSV = async () => {
  if (!estacionSeleccionada) return;

  try {
    setIsExporting(true);

    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(now.getMonth() - 1);

    const url = apiClient.muestreos.export({
      estacionId: String(estacionSeleccionada.id),
      fechaInicio: oneMonthAgo.toISOString(),
      fechaFin: now.toISOString()
    });

    // Crear un link temporal para forzar descarga
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte_${estacionSeleccionada.nombre}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  } catch (error) {
    console.error("Error al descargar CSV:", error);
  } finally {
    setIsExporting(false);
  }
};

  return (
    <MuestreoContext.Provider value={{ generarReporte, descargarCSV, isExporting }}>
      {children}
    </MuestreoContext.Provider>
  );
};

export const useMuestreoContext = () => {
  const context = useContext(MuestreoContext);
  if (!context) throw new Error('useMuestreoContext debe usarse dentro de MuestreoProvider');
  return context;
};