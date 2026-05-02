import { NotificationData } from './types';

const STREAM_URL = process.env.NEST_PUBLIC_STREAM_URL;

export const streamClient = {
    connect: (
        onMessage: (data: NotificationData) => void,
        onError?: (error: any) => void
    ) => {
        let eventSource: EventSource | null = null;
        let reconnectTimeout: NodeJS.Timeout | null = null;

        const startConnection = () => {
            if (eventSource) eventSource.close();

            eventSource = new EventSource(STREAM_URL!);

            eventSource.addEventListener('nuevo-muestreo', (event) => {
                try {
                    const parsedData = JSON.parse(event.data);
                    onMessage(parsedData);
                } catch (err) {
                    console.error("Error parseando datos de SSE:", err);
                }
            });

            eventSource.addEventListener('status-update', (event) => {
                try {
                    const parsedData = JSON.parse(event.data);
                    onMessage(parsedData);
                } catch (err) {
                    console.error("Error parseando datos de SSE:", err);
                }
            });

            eventSource.onerror = (err) => {
                console.error("SSE Connection Error:", err);
                if (onError) onError(err);

                if (eventSource) eventSource.close();

                reconnectTimeout = setTimeout(startConnection, 3000);
            };
        };

        startConnection();

        return () => {
            if (reconnectTimeout) clearTimeout(reconnectTimeout);
            if (eventSource) eventSource.close();
            console.log("Conexión SSE finalizada.");
        };
    },
};