import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Parametro } from './entities/parametros.entity';
import { ClasificacionesIRCA } from './entities/clasificacionesIRCA.entity';

@Injectable()
export class IrcMotorReglasService {
    constructor(
        @InjectRepository(Parametro)
        private parametroRepo: Repository<Parametro>,
        @InjectRepository(ClasificacionesIRCA)
        private clasificacionRepo: Repository<ClasificacionesIRCA>,
    ) { }

    /**
     * Calcula el IRCA (Índice de Riesgo de la Calidad del Agua) basado en una lista de medidas.
     * Evalúa cada medida contra los límites permitidos de su parámetro correspondiente
     * y acumula un puntaje de riesgo si está fuera de rango.
     * 
     * @param medidas Arreglo de objetos que contienen el ID del parámetro y el valor medido
     * @returns Un objeto con el puntaje total calculado y su respectiva clasificación IRCA
     */
    async calcularIrca(medidas: { id_parametro: number; valor: number }[]) {
        let puntajeRiesgoTotal = 0;

        for (const medida of medidas) {
            const parametro = await this.parametroRepo.findOne({ where: { id: medida.id_parametro } });

            if (!parametro) continue;

            if (medida.valor < parametro.valorMinimo || medida.valor > parametro.valorMaximo) {
                puntajeRiesgoTotal += 15;
            }
        }

        const clasificacion = await this.clasificacionRepo.findOne({
            where: {
                rango_min: LessThanOrEqual(puntajeRiesgoTotal),
                rango_max: MoreThanOrEqual(puntajeRiesgoTotal),
            },
        });

        return {
            puntaje: puntajeRiesgoTotal,
            clasificacion: clasificacion || null,
        };
    }
}