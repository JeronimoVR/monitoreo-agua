export interface NotificationData {
  id: string;
  mensaje: string;
  fecha: string;
  tipo?: string;
  [key: string]: any;
}

const STREAM_URL = 'http://192.168.110.87:3001/api/notificaciones/stream';

export const streamClient = {
  /**
   * Establece una conexión SSE con el servidor.
   * @param onMessage Callback para procesar datos nuevos.
   * @param onError Callback para manejar fallos de conexión.
   * @returns Función de desconexión (cleanup).
   */
  connect: (
    onMessage: (data: NotificationData) => void,
    onError?: (error: any) => void
  ) => {
    // Creamos la instancia de EventSource hacia el endpoint sin parámetros
    const eventSource = new EventSource(STREAM_URL);

    eventSource.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        onMessage(parsedData);
      } catch (err) {
        console.error("Error parseando datos de SSE:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE Connection Error:", err);
      if (onError) onError(err);
      // Opcional: Cerrar automáticamente en caso de error crítico
      eventSource.close();
    };

    // Devolvemos la función de limpieza para evitar fugas de memoria
    return () => {
      eventSource.close();
      console.log("Conexión SSE finalizada.");
    };
  },
};