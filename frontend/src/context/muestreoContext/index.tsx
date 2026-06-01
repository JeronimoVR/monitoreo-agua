'use client';
import React, { createContext, useContext, useState } from 'react';
import { useEstacionesContext } from '@context/estacionesContext';
import { apiClient } from '@service/api-client';

interface MuestreoContextType {
  generarReporte: (rango: { inicio: Date; fin: Date }) => Promise<void>;
  // AHORA: Acepta fechas string opcionales del filtro de la pantalla
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
      console.error("Error al exportar:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // CORREGIDO: Ahora prioriza las fechas seleccionadas en la interfaz
  const descargarCSV = async (fechaInicio?: string, fechaFin?: string) => {
    if (!estacionSeleccionada) return;
    setIsExporting(true);
    const link = document.createElement('a');

    try {
      let fInicioIso: string;
      let fFinIso: string;

      // Si hay filtros en pantalla, convertirlos adecuadamente a ISO
      if (fechaInicio && fechaFin) {
        const [anoI, mesI, diaI] = fechaInicio.split('-').map(Number);
        const [anoF, mesF, diaF] = fechaFin.split('-').map(Number);
        
        fInicioIso = new Date(anoI, mesI - 1, diaI, 0, 0, 0).toISOString();
        fFinIso = new Date(anoF, mesF - 1, diaF, 23, 59, 59).toISOString();
      } else {
        // Fallback: Si no hay filtro, usar el último mes automáticamente
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
      console.error("Error al descargar CSV:", error);
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