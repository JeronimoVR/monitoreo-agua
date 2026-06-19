'use client';
import React, { createContext, useContext, useState } from 'react';
import { useEstacionesContext } from '@context/estacionesContext';
import { apiClient } from '@service/api-client';
import { logger } from '@/src/lib/logger';

interface MuestreoContextType {
  generarReporte: (rango: { inicio: Date; fin: Date }) => Promise<void>;
  descargarCSV: (fechaInicio?: string, fechaFin?: string) => Promise<void>;
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
      const url = apiClient.muestreos.export({
        estacionId: estacionSeleccionada.id,
        fechaInicio: rango.inicio.toISOString(),
        fechaFin: rango.fin.toISOString()
      });
      window.open(url, '_blank');
    } catch (error) {
      logger.error({ err: error }, "Error al exportar:");
    } finally {
      setIsExporting(false);
    }
  };

  const descargarCSV = async (fechaInicio?: string, fechaFin?: string) => {
    if (!estacionSeleccionada) return;
    setIsExporting(true);
    const link = document.createElement('a');

    try {
      let fInicioIso: string;
      let fFinIso: string;

      if (fechaInicio && fechaFin) {
        fInicioIso = `${fechaInicio}T00:00:00-05:00`;
        fFinIso = `${fechaFin}T23:59:59-05:00`;
      } else {
        const now = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(now.getMonth() - 1);
        fInicioIso = oneMonthAgo.toISOString();
        fFinIso = now.toISOString();
      }

      const url = apiClient.muestreos.export({
        estacionId: estacionSeleccionada.id,
        fechaInicio: fInicioIso,
        fechaFin: fFinIso
      });

      link.href = url;
      link.download = `reporte_${estacionSeleccionada.nombre}.csv`;
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      logger.error({ err: error }, "Error al descargar CSV:");
    } finally {
      if (link.parentNode) {
        document.body.removeChild(link);
      }
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