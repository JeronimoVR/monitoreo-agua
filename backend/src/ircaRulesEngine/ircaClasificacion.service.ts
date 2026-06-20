import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual, In } from 'typeorm';
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
 * Calcula el porcentaje de riesgo (IRCA) a partir de los datos de las muestras evaluadas.
 * Solo se tienen en cuenta aquellos parámetros cuyo peso (puntaje de riesgo) es mayor a cero.
 * El cálculo se realiza sumando los puntajes de riesgo de los parámetros que no cumplen
 * con los límites permisibles (están fuera del rango [min, max]), dividido por la suma
 * total de los puntajes de riesgo de todos los parámetros analizados.
 * 
 * @param datos Lista de datos extraídos de la muestra que incluye: valor medido, límites (min y max) y peso (puntajeRiesgo).
 * @returns El valor porcentual del IRCA calculado (entre 0 y 100) redondeado a 2 decimales. Retorna 0 si no hay parámetros con peso.
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

        if (sumaPuntajesTotalesAnalizados === 0) {
            console.warn('⚠️ [IRCA-CALC] Suma total de pesos es 0 - Retornando 0%');
            return 0;
        }

        const resultado = (sumaPuntajesIncumplidos / sumaPuntajesTotalesAnalizados) * 100;
        return parseFloat(resultado.toFixed(2));
    }

    /**
     * Consulta en la base de datos la clasificación IRCA correspondiente al puntaje obtenido.
     * Busca el rango en el cual se encuentra el puntaje (valor_min <= puntaje <= valor_max).
     * 
     * @param puntaje El puntaje IRCA porcentual calculado previamente.
     * @returns La entidad `ClasificacionIrca` que corresponde al nivel de riesgo del puntaje, o `null` si no se encuentra.
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
     * Proceso principal para evaluar la calidad del agua según las mediciones realizadas.
     * Toma las medidas registradas, obtiene la información de los parámetros desde la base de datos
     * de forma optimizada, calcula el índice IRCA y finalmente determina su clasificación de riesgo.
     * 
     * @param medidas Lista de mediciones realizadas, donde cada una contiene el `id_parametro` evaluado y su `valor` registrado.
     * @returns Un objeto con el `puntaje` (porcentaje IRCA) y la `clasificacion` (entidad ClasificacionIrca).
     */
    async calcularIrca(medidas: { id_parametro: number; valor: number }[]) {
        if (!Array.isArray(medidas) || medidas.length === 0) {
            throw new BadRequestException('No se enviaron medidas para calcular IRCA');
        }

        const invalid = medidas.find(m => !Number.isFinite(m?.id_parametro) || !Number.isFinite(m?.valor));
        if (invalid) {
            throw new BadRequestException('Existen medidas incompletas o no numéricas; no es posible calcular IRCA');
        }

        const ids = medidas.map(m => m.id_parametro);

        // Traemos todos los parámetros necesarios en una sola consulta
        const parametros = await this.parametroRepo.findBy({ id: In(ids) });

        if (parametros.length !== ids.length) {
            const foundIds = new Set(parametros.map(p => p.id));
            const missing = ids.filter(id => !foundIds.has(id));
            throw new NotFoundException(`No existen parámetros configurados para los IDs: ${missing.join(', ')}`);
        }

        const parametrosPorId = new Map(parametros.map(p => [Number(p.id), p] as const));

        const detalles = medidas.map(m => {
            const p = parametrosPorId.get(m.id_parametro);
            if (!p) {
                return null;
            }

            return {
                valor: m.valor,
                min: p.valorMinimo,
                max: p.valorMaximo,
                peso: p.puntajeRiesgo
            };
        }).filter(d => d !== null);

        const puntaje = this.calcularPorcentajeIrca(detalles);
        const clasificacion = await this.obtenerClasificacion(puntaje);

        return { puntaje, clasificacion };
    }


}
