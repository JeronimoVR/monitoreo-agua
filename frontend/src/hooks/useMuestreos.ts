import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@service/api-client';
import { Muestreo, MuestreosFilters } from '@shared/sampling/dto/muestreo.dto';
import { logger } from '@/src/lib/logger';

export const useMuestreo = (estacionId: string | null) => {
    const [datos, setDatos] = useState<Muestreo[]>([]);
    const [loading, setLoading] = useState(false);

    const cargarHistorial = useCallback(async () => {
        if (!estacionId) return;
        setLoading(true);
        try {
            const res = await apiClient.muestreos.getHistorial(estacionId);
            setDatos(res);
        } catch (error) {
            console.error({ err: error }, "Error al obtener historial:");
        } finally {
            setLoading(false);
        }
    }, [estacionId]);

    useEffect(() => {
        cargarHistorial();
    }, [cargarHistorial]);

    const descargarReporte = (params?: Omit<MuestreosFilters, 'estacionId'>) => {
        if (!estacionId) return;
        const url = apiClient.muestreos.export({ ...params, estacionId: Number(estacionId) });
        window.open(url, '_blank');
    };

    return { datos, loading, refresh: cargarHistorial, descargarReporte };
};
