import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@service/api-client';

export const useMuestreo = (estacionId: string | null) => {
    const [datos, setDatos] = useState([]);
    const [loading, setLoading] = useState(false);

    const cargarHistorial = useCallback(async () => {
        if (!estacionId) return;
        setLoading(true);
        try {
            const res = await apiClient.muestreos.getHistorial(estacionId);
            setDatos(res);
        } catch (error) {
            console.error("Error al obtener historial:", error);
        } finally {
            setLoading(false);
        }
    }, [estacionId]);

    useEffect(() => {
        cargarHistorial();
    }, [cargarHistorial]);

    const descargarReporte = (params?: any) => {
        if (!estacionId) return;
        const url = apiClient.muestreos.export({ ...params, estacionId });
        window.open(url, '_blank');
    };

    return { datos, loading, refresh: cargarHistorial, descargarReporte };
};