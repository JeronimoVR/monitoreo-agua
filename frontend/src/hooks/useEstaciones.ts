import { useState, useEffect } from 'react';
import { apiClient } from '@service/api-client';
import { Estacion } from '../shared/stations/dto/estacion.dto';
import { logger } from '@/src/lib/logger';

export const useEstaciones = () => {
    const [estaciones, setEstaciones] = useState<Estacion[]>([]);
    const [estacionSeleccionada, setEstacionSeleccionada] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEstaciones = async () => {
            try {
                const data = await apiClient.estaciones.getAll();
                setEstaciones(data);
                if (data.length > 0) {
                    setEstacionSeleccionada((prev) => prev ?? String(data[0].id));
                }
            } catch (error) {
                logger.error({ err: error }, "Error cargando estaciones:");
            } finally {
                setLoading(false);
            }
        };
        fetchEstaciones();
    }, []);

    return { estaciones, estacionSeleccionada, setEstacionSeleccionada, loading };
};
