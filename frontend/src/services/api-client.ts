const BASE_URL = 'http://192.168.110.87:3001/api';

// Helper para manejar las cabeceras (incluyendo el token)
const getHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
};

export const apiClient = {
    auth: {
        login: async (data: any) => {
            const res = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            return res.json();
        },
        recuperarPassword: (email: string) =>
            fetch(`${BASE_URL}/auth/recuperar-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            }).then(res => res.json()),

        restablecerPassword: (data: any) =>
            fetch(`${BASE_URL}/auth/restablecer-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            }).then(res => res.json()),
    },

    usuarios: {
        registro: (data: any) =>
            fetch(`${BASE_URL}/usuarios/registro`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            }).then(res => res.json()),

        getById: (id: string) =>
            fetch(`${BASE_URL}/usuarios/${id}`, { headers: getHeaders() }).then(res => res.json()),

        update: (id: string, data: any) =>
            fetch(`${BASE_URL}/usuarios/${id}`, {
                method: 'PATCH',
                headers: getHeaders(),
                body: JSON.stringify(data),
            }).then(res => res.json()),

        getAlertConfig: (estacionId: string) =>
            fetch(`${BASE_URL}/usuarios/config-alertas/${estacionId}`, { 
                headers: getHeaders() 
            }).then(res => res.json()),

        configAlertas: (estacionId: string, config: any) =>
            fetch(`${BASE_URL}/usuarios/config-alertas/${estacionId}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(config),
            }).then(res => res.json()),
    },

    muestreos: {
        getAll: (params?: { estacionId?: string; parametro?: string; fechaInicio?: string; fechaFin?: string }) => {
            const query = new URLSearchParams(params as any).toString();
            return fetch(`${BASE_URL}/muestreos?${query}`, { 
                headers: getHeaders() 
            }).then(res => res.json());
        },

        export: (params?: any) => {
            const query = new URLSearchParams(params).toString();
            return `${BASE_URL}/muestreos/export?${query}`; 
            // Nota: Para exportar, usualmente devolvemos el URL para usarlo en un <a> o window.open
        }
    },

    estaciones: {
        getAll: () => fetch(`${BASE_URL}/api/estaciones`, { headers: getHeaders() }).then(res => res.json()),
        getById: (id: string) =>
            fetch(`${BASE_URL}/api/estaciones/${id}`, { headers: getHeaders() }).then(res => res.json()),
    },
};