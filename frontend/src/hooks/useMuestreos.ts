// src/hooks/useMuestreos.ts
import { useState, useEffect } from 'react';
import { apiClient } from '@service/api-client';

export const useMuestreos = (estacionId?: string) => {
  const [datos, setDatos] = useState([]);
  const [parametro, setParametro] = useState('pH'); // Parámetro por defecto
  const [loading, setLoading] = useState(false);

  const cargarDatos = async () => {
    if (!estacionId) return;
    setLoading(true);
    const res = await apiClient.muestreos.getAll({ estacionId, parametro });
    setDatos(res);
    setLoading(false);
  };

  useEffect(() => {
    cargarDatos();
  }, [estacionId, parametro]);

  const exportarCSV = () => {
    const url = apiClient.muestreos.export({ estacionId, parametro });
    window.open(url, '_blank');
  };

  return { datos, parametro, setParametro, loading, cargarDatos, exportarCSV };
};