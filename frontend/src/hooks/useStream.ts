import { useEffect, useState } from 'react';
import { streamClient, NotificationData } from '@service/stream-client';

export const useStream = (enabled: boolean = true) => {
    const [lastNotification,setLastNotification] = useState<NotificationData | null>(null);
    const [history, setHistory] = useState<NotificationData[]>([]);

    useEffect(() => {
        if (!enabled) return;

        const stopStream = streamClient.connect(
            (data) => {
                setLastNotification(data);
                setHistory((prev) => [data, ...prev].slice(0, 30));
            },
            (error) => {
                console.error("Fallo en flujo de notificaciones:", error);
            }
        );

        return () => {
            stopStream();
        };
    }, [enabled]);

    const clearHistory = () => setHistory([]);

    return { lastNotification, history, clearHistory };
};