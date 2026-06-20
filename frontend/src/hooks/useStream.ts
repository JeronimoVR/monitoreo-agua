'use client';
import { useEffect, useState } from 'react';
import { streamClient } from '@service/stream-client';
import { NotificationData } from '@service/stream-client/types';
import { logger } from '@/src/lib/logger';

export const useStream = (enabled: boolean = true) => {
    const [lastNotification, setLastNotification] = useState<NotificationData | null>(null);
    const [lastMuestreo, setLastMuestreo] = useState<NotificationData | null>(null);
    const [lastSensorStatus, setLastSensorStatus] = useState<NotificationData | null>(null);
    const [history, setHistory] = useState<NotificationData[]>([]);

    useEffect(() => {
        if (!enabled) return;

        const stopStream = streamClient.connect(
            (data) => {
                setLastNotification(data);
                if (data.tipo === 'muestreo') setLastMuestreo(data);
                if (data.tipo === 'status') setLastSensorStatus(data);
                setHistory((prev) => [data, ...prev].slice(0, 30));
            },
            (error) => {
                logger.error("Fallo en flujo de notificaciones (SSE):", error);
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