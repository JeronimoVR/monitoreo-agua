import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Parametro } from './entities/parametros.entity';
import { ClasificacionIrca } from './entities/clasificacionesIRCA.entity';

@Injectable()
export class IrcaMotorReglasService {
    constructor(
        @InjectRepository(Parametro)
        private parametroRepo: Repository<Parametro>,
        @InjectRepository(ClasificacionIrca)
        private clasificacionRepo: Repository<ClasificacionIrca>,
    ) { }

    /**
     * Calcula el porcentaje de incumplimiento IRCA frente a un conjunto de datos obtenidos de las muestras.
     * Solo los parámetros con peso mayor a cero son considerados para el cálculo.
     * 
     * @param datos Lista de objetos conteniendo el valor medido, los límites mínimo y máximo esperados y el peso del parámetro.
     * @returns Un porcentaje (de 0 a 100) que representa el índice de riesgo, con máximo dos decimales.
     */
    private calcularPorcentajeIrca(datos: { valor: number, min: number, max: number, peso: number }[]): number {
        let sumaPuntajesIncumplidos = 0;
        let sumaPuntajesTotalesAnalizados = 0;

        datos.forEach(item => {
            if (item.peso > 0) {
                sumaPuntajesTotalesAnalizados += item.peso;

                if (item.valor < item.min || item.valor > item.max) {
                    sumaPuntajesIncumplidos += item.peso;
                }
            }
        });

        if (sumaPuntajesTotalesAnalizados === 0) return 0;

        const resultado = (sumaPuntajesIncumplidos / sumaPuntajesTotalesAnalizados) * 100;

        return parseFloat(resultado.toFixed(2));
    }

    /**
     * Recupera de la base de datos la clasificación correspondiente a un puntaje IRCA.
     * 
     * @param puntaje El puntaje IRCA calculado.
     * @returns Un objeto ClasificacionIrca si encuentra correspondencia, o null de lo contrario.
     */
    private async obtenerClasificacion(puntaje: number): Promise<ClasificacionIrca | null> {
        return await this.clasificacionRepo.findOne({
            where: {
                valor_min: LessThanOrEqual(puntaje),
                valor_max: MoreThanOrEqual(puntaje),
            },
        });
    }

    /**
     * Analiza las medidas recibidas, calcula el puntaje total del impacto ambiental o de calidad de agua, 
     * y obtiene su respectiva clasificación IRCA.
     * 
     * @param medidas Array conteniendo las identificaciones de los parámetros y su valor medido respectivo.
     * @returns Un objeto conteniendo el `puntaje` final calculado y su `clasificacion`.
     */
    async calcularIrca(medidas: { id_parametro: number; valor: number }[]) {
        const detalles = await Promise.all(
            medidas.map(async (m) => {
                const p = await this.parametroRepo.findOneBy({ id: m.id_parametro });
                return p ? { valor: m.valor, min: p.valorMinimo, max: p.valorMaximo, peso: p.puntajeRiesgo } : null;
            })
        );

        const validos = detalles.filter(d => d !== null);

        const puntaje = this.calcularPorcentajeIrca(validos);
        const clasificacion = await this.obtenerClasificacion(puntaje);

        return { puntaje, clasificacion };
    }
}