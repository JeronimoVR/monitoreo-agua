import { NotificationData } from './types';
import { logger } from '@/src/lib/logger';

const STREAM_URL = process.env.NEXT_PUBLIC_STREAM_URL;

export const streamClient = {
    connect: (
        onMessage: (data: NotificationData) => void,
        onError?: (error: unknown) => void
    ) => {
        if (!STREAM_URL) {
            logger.error("SSE Error: NEXT_PUBLIC_STREAM_URL no está definida.");
            return () => { };
        }

        let eventSource: EventSource | null = null;
        let reconnectTimeout: NodeJS.Timeout | null = null;
        let isIntentionallyClosed = false;

        const startConnection = () => {
            if (isIntentionallyClosed) return;

            if (eventSource) {
                eventSource.close();
            }

            eventSource = new EventSource(STREAM_URL);

            const handleEvent = (event: MessageEvent) => {
                try {
                    const parsedData: NotificationData = JSON.parse(event.data);
                    onMessage(parsedData);
                } catch (err) {
                    logger.error("Error parseando datos de SSE:", err);
                }
            };

            eventSource.addEventListener('nuevo-muestreo', handleEvent);
            eventSource.addEventListener('status-sensores', handleEvent);

            eventSource.onerror = (err) => {
                const target = err.target as EventSource | null;
                if (target?.readyState === EventSource.CLOSED) {
                    logger.error("La conexión fue RECHAZADA de forma definitiva por el servidor (Posible 404, 500 o CORS).");
                } else if (target?.readyState === EventSource.CONNECTING) {
                    logger.error("El servidor cerró el socket temporalmente, pero el navegador está intentando reconectar automáticamente.");
                }

                if (onError) onError(err);
            };
        };

        startConnection();

        return () => {
            isIntentionallyClosed = true;
            if (reconnectTimeout) clearTimeout(reconnectTimeout);
            if (eventSource) {
                eventSource.close();
                logger.log("Conexión SSE finalizada de manera limpia.");
            }
        };
    },
};