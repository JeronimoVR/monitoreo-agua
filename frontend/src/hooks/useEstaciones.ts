// src/hooks/useEstaciones.ts
import { useState, useEffect } from 'react';
import { apiClient } from '@service/api-client';

export const useEstaciones = () => {
  const [estaciones, setEstaciones] = useState([]);
  const [estacionSeleccionada, setEstacionSeleccionada] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const data = await apiClient.estaciones.getAll();
      setEstaciones(data);
      if (data.length > 0 && !estacionSeleccionada) {
        setEstacionSeleccionada(data[0].id); // Seleccionamos la primera por defecto
      }
    };
    load();
  }, []);

  return { estaciones, estacionSeleccionada, setEstacionSeleccionada };
};