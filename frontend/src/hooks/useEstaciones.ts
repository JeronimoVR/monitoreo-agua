import { useState, useEffect } from 'react';
import { apiClient } from '@service/api-client';

export const useEstaciones = () => {
    const [estaciones, setEstaciones] = useState<any[]>([]);
    const [estacionSeleccionada, setEstacionSeleccionada] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEstaciones = async () => {
            try {
                const data = await apiClient.estaciones.getAll();
                setEstaciones(data);
                if (data.length > 0 && !estacionSeleccionada) {
                    setEstacionSeleccionada(data[0].id);
                }
            } catch (error) {
                console.error("Error cargando estaciones:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEstaciones();
    }, []);

    return { estaciones, estacionSeleccionada, setEstacionSeleccionada, loading };
};