'use client';
import { useEffect, useState } from 'react';
import { streamClient } from '@service/stream-client';
import { NotificationData } from '@service/stream-client/types';

export const useStream = (enabled: boolean = true) => {
    const [lastNotification, setLastNotification] = useState<NotificationData | null>(null);
    // Estados dedicados reactivos por tipo de flujo para evitar colisiones
    const [lastMuestreo, setLastMuestreo] = useState<NotificationData | null>(null);
    const [lastSensorStatus, setLastSensorStatus] = useState<NotificationData | null>(null);
    const [history, setHistory] = useState<NotificationData[]>([]);

    useEffect(() => {
        if (!enabled) return;

        const stopStream = streamClient.connect(
            (data) => {
                setLastNotification(data);
                
                // Clasificamos de forma reactiva y segura el flujo entrante
                if (data.tipo === 'muestreo') setLastMuestreo(data);
                if (data.tipo === 'status') setLastSensorStatus(data);
                
                // Mantenemos el buffer de historial atómico
                setHistory((prev) => [data, ...prev].slice(0, 30));
            },
            (error) => {
                console.error("Fallo en flujo de notificaciones (SSE):", error);
            }
        );

        return () => {
            stopStream();
        };
    }, [enabled]);

    const clearHistory = () => setHistory([]);

    return { 
        lastNotification, 
        lastMuestreo, 
        lastSensorStatus, 
        history, 
        clearHistory 
    };
};