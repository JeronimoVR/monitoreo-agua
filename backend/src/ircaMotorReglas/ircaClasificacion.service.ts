import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Parametro } from './entities/parametros.entity';
import { ClasificacionIrca } from './entities/clasificacionesIRCA.entity';

@Injectable()
export class IrcMotorReglasService {
    constructor(
        @InjectRepository(Parametro)
        private parametroRepo: Repository<Parametro>,
        @InjectRepository(ClasificacionIrca)
        private clasificacionRepo: Repository<ClasificacionIrca>,
    ) { }


    private calcularPorcentajeIrca(datos: { valor: number, min: number, max: number, peso: number }[]): number {
        let sumaPuntajesIncumplidos = 0;
        let sumaPuntajesTotalesAnalizados = 0;

        datos.forEach(item => {
            // VALIDACIÓN: Si el peso es 0, ignoramos el parámetro para el cálculo del IRCA
            if (item.peso > 0) {
                sumaPuntajesTotalesAnalizados += item.peso;

                // Verificamos incumplimiento solo para parámetros con peso
                if (item.valor < item.min || item.valor > item.max) {
                    sumaPuntajesIncumplidos += item.peso;
                }
            }
        });

        // Evitamos división por cero
        if (sumaPuntajesTotalesAnalizados === 0) return 0;

        const resultado = (sumaPuntajesIncumplidos / sumaPuntajesTotalesAnalizados) * 100;

        return parseFloat(resultado.toFixed(2));
    }


    private async obtenerClasificacion(puntaje: number): Promise<ClasificacionIrca | null> {
        return await this.clasificacionRepo.findOne({
            where: {
                valor_min: LessThanOrEqual(puntaje),
                valor_max: MoreThanOrEqual(puntaje),
            },
        });
    }


    async calcularIrca(medidas: { id_parametro: number; valor: number }[]) {
        // Buscar pesos y límites en la DB
        const detalles = await Promise.all(
            medidas.map(async (m) => {
                const p = await this.parametroRepo.findOneBy({ id: m.id_parametro });
                return p ? { valor: m.valor, min: p.valorMinimo, max: p.valorMaximo, peso: p.puntajeRiesgo } : null;
            })
        );

        const validos = detalles.filter(d => d !== null);

        // Llamar a las funciones internas que ya definimos
        const puntaje = this.calcularPorcentajeIrca(validos);
        const clasificacion = await this.obtenerClasificacion(puntaje);

        return { puntaje, clasificacion };
    }
}