import { NotificationData } from './types';

const STREAM_URL = process.env.NEXT_PUBLIC_STREAM_URL;

export const streamClient = {
    connect: (
        onMessage: (data: NotificationData) => void,
        onError?: (error: unknown) => void
    ) => {
        if (!STREAM_URL) {
            console.error("SSE Error: NEXT_PUBLIC_STREAM_URL no está definida.");
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

            // Manejador único para procesar los eventos parseados
            const handleEvent = (event: MessageEvent) => {
                try {
                    const parsedData: NotificationData = JSON.parse(event.data);
                    onMessage(parsedData);
                } catch (err) {
                    console.error("Error parseando datos de SSE:", err);
                }
            };

            // Escuchar los canales configurados en tu NestJS
            eventSource.addEventListener('nuevo-muestreo', handleEvent);
            eventSource.addEventListener('status-sensores', handleEvent);

            // eventSource.onerror = (err) => {
            //     console.error("SSE Connection Error:", err);
            //     if (onError) onError(err);

            //     // Si el navegador se rinde o el estado es CLOSED, forzamos reconexión manual
            //     if (eventSource?.readyState === EventSource.CLOSED && !isIntentionallyClosed) {
            //         eventSource.close();
            //         if (reconnectTimeout) clearTimeout(reconnectTimeout);
            //         reconnectTimeout = setTimeout(startConnection, 5000); // 5s de cortesía al servidor
            //     }
            // };
            eventSource.onerror = (err) => {
                // Forzamos la lectura del estado actual del EventSource
                const target = err.target as EventSource | null;

                console.error("=== DETALLE DE ERROR SSE ===");
                console.error("Estado de la conexión (ReadyState):", target?.readyState);
                // 0 = CONNECTING (Buscando conectar/Reconectando)
                // 2 = CLOSED (Cerrado por completo o rechazado)

                if (target?.readyState === EventSource.CLOSED) {
                    console.error("La conexión fue RECHAZADA de forma definitiva por el servidor (Posible 404, 500 o CORS).");
                } else if (target?.readyState === EventSource.CONNECTING) {
                    console.error("El servidor cerró el socket temporalmente, pero el navegador está intentando reconectar automáticamente.");
                }

                if (onError) onError(err);
            };
        };

        startConnection();

        // Retorno de limpieza (Cleanup Function)
        return () => {
            isIntentionallyClosed = true;
            if (reconnectTimeout) clearTimeout(reconnectTimeout);
            if (eventSource) {
                eventSource.close();
                console.log("Conexión SSE finalizada de manera limpia.");
            }
        };
    },
};