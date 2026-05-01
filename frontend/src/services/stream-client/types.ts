export interface NotificationData {
    id: string;
    mensaje: string;
    fecha: string;
    tipo?: string;
    [key: string]: any;
}