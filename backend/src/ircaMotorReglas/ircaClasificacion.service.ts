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
     * Calcula el IRCA basado en una lista de medidas
     * @param medidas Array de { id_parametro, valor }
     */
    async calcularIrca(medidas: { id_parametro: number; valor: number }[]) {
        let puntajeRiesgoTotal = 0;

        for (const medida of medidas) {
            const parametro = await this.parametroRepo.findOne({ where: { id: medida.id_parametro } });

            if (!parametro) continue;

            // Si el valor está FUERA de los rangos permitidos, se suma el puntaje de riesgo
            // Nota: En un sistema real, el puntaje de riesgo suele ser un campo en la tabla parametros
            if (medida.valor < parametro.valorMinimo || medida.valor > parametro.valorMaximo) {
                // Ejemplo de lógica: si falla, suma un peso (esto puede variar según la norma)
                puntajeRiesgoTotal += 15;
            }
        }

        // Buscamos la clasificación que corresponde al puntaje obtenido
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