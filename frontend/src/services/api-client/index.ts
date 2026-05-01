import api, { BASE_URL } from './axios-instance';

export const apiClient = {
    auth: {
        login: (data: any) => api.post('/auth/login', data).then(res => res.data),
        recuperarPassword: (email: string) => api.post('/auth/recuperar-password', { email }).then(res => res.data),
        restablecerPassword: (data: any) => api.post('/auth/restablecer-password', data).then(res => res.data),
    },
    usuarios: {
        registro: (data: any) => api.post('/usuarios/registro', data).then(res => res.data),
        getById: (id: string) => api.get(`/usuarios/${id}`).then(res => res.data),
        update: (id: string, data: any) => api.patch(`/usuarios/${id}`, data).then(res => res.data),
        getAlertConfig: (estacionId: string) => api.get(`/usuarios/config-alertas/${estacionId}`).then(res => res.data),
        configAlertas: (estacionId: string, config: any) => api.put(`/usuarios/config-alertas/${estacionId}`, config).then(res => res.data),
    },
    muestreos: {
        getHistorial: (idEstacion: string) => api.get(`/muestreos/historial/${idEstacion}`).then(res => res.data),
        export: (params?: any) => {
            const query = new URLSearchParams(params).toString();
            return `${BASE_URL}/muestreos/export?${query}`;
        }
    },
    estaciones: {
        getAll: () => api.get('/estaciones').then(res => res.data),
        getById: (id: string) => api.get(`/estaciones/${id}`).then(res => res.data),
    },
};