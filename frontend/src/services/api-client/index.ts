import api, { BASE_URL } from './axios-instance';
import { LoginDto } from '@/src/shared/auth/dto/login.dto';
import { SolicitarRecuperacionDto } from '@/src/shared/auth/dto/solicitar-recuperacion.dto';
import { ResetPasswordDto } from '@/src/shared/auth/dto/reset-password.dto';
import { CreateUsuarioDto } from '@/src/shared/users/dto/create-usuario.dto';
import { UpdateUsuarioDto } from '@/src/shared/users/dto/update-usuario.dto';
import { Usuario } from '@/src/shared/users/dto/usuario.dto';
import { Estacion } from '@/src/shared/stations/dto/estacion.dto';
import { Muestreo, MuestreosFilters } from '@/src/shared/sampling/dto/muestreo.dto';
import { ChangePasswordDto } from '@/src/shared/auth/dto/change-password';

export const apiClient = {
    auth: {
        login: (data: LoginDto) => api.post('/auth/login', data).then(res => res.data),
        recuperarPassword: (data: SolicitarRecuperacionDto) => api.post('/auth/forget-password', data).then(res => res.data),
        restablecerPassword: (data: ResetPasswordDto) => api.post('/auth/reset-password', data).then(res => res.data),
    },
    usuarios: {
        registro: (data: CreateUsuarioDto) => api.post('/usuarios/registro', data).then(res => res.data),
        getById: (id: string | number) => api.get<Usuario>(`/usuarios/${id}`).then(res => res.data),
        update: (id: string | number, data: UpdateUsuarioDto) => api.patch<Usuario>(`/usuarios/${id}`, data).then(res => res.data),
        getAlertConfig: (estacionId: string | number) => api.get(`/usuarios/config-alertas/${estacionId}`).then(res => res.data),
        configAlertas: (estacionId: string | number, recibeAlerta: boolean) => api.put(`/usuarios/config-alertas/${estacionId}`, { recibeAlerta }).then(res => res.data),
        softDelete: (id: string | number) => api.patch(`/usuarios/${id}/eliminar`).then(res => res.data),
        changePassword: (data: ChangePasswordDto) => api.patch<Usuario>(`/usuarios/change-password`, data).then(res => res.data),
    },
    muestreos: {
        getFiltered: (params: MuestreosFilters) => api.get<Muestreo[]>('/muestreos/filtro/busqueda', { params }).then(res => res.data),
        getHistorial: (idEstacion: string | number) => api.get<Muestreo[]>(`/muestreos/historial/${idEstacion}`).then(res => res.data),
        getById: (id: string | number) => api.get<Muestreo>(`/muestreos/${id}`).then(res => res.data),
        export: (params?: MuestreosFilters) => {
            if (!params) return `${BASE_URL}/muestreos/export`;
            
            const searchParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    searchParams.append(key, String(value));
                }
            });
            
            return `${BASE_URL}/muestreos/export?${searchParams.toString()}`;
        }
    },
    estaciones: {
        getAll: () => api.get<Estacion[]>('/estaciones').then(res => res.data),
        getById: (id: string | number) => api.get<Estacion>(`/estaciones/${id}`).then(res => res.data)
    },
};