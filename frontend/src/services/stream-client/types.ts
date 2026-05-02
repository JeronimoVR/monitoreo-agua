// export interface NotificationData {
//     id: string;
//     mensaje: string;
//     fecha: string;
//     tipo?: string;
//     [key: string]: any;
// }

import { Muestreo } from "@/src/shared/sampling/dto/muestreo.dto";

export interface NotificationData {
    id: string;
    mensaje?: string;
    fecha: string;
    tipo: 'muestreo' | 'alerta' | 'status';
    payload?: Muestreo;
    estacionId?: number;
}