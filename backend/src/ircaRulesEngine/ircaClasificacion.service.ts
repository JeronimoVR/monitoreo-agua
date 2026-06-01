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
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔢 [IRCA-CALC] Inicio cálculo porcentaje');
        console.log(`📊 [IRCA-CALC] Parámetros recibidos: ${datos.length}`);

        let sumaPuntajesIncumplidos = 0;
        let sumaPuntajesTotalesAnalizados = 0;

        // Log de cada parámetro recibido
        datos.forEach((item, index) => {
            console.log(`\n📌 Parámetro ${index + 1}:`);
            console.log(`   Valor: ${item.valor}`);
            console.log(`   Rango permitido: [${item.min} - ${item.max}]`);
            console.log(`   Peso (puntajeRiesgo): ${item.peso}`);

            const estaFuera = item.valor < item.min || item.valor > item.max;
            console.log(`   ¿Fuera de rango?: ${estaFuera ? '❌ SÍ' : '✅ NO'}`);
        });

        // Realizar el cálculo
        datos.forEach(item => {
            if (item.peso > 0) {
                sumaPuntajesTotalesAnalizados += item.peso;
                console.log(`\n⚖️ Procesando parámetro con peso ${item.peso}:`);
                console.log(`   Peso acumulado total: ${sumaPuntajesTotalesAnalizados}`);

                if (item.valor < item.min || item.valor > item.max) {
                    sumaPuntajesIncumplidos += item.peso;
                    console.log(`   ❌ INCUMPLE - Suma incumplidos: ${sumaPuntajesIncumplidos}`);
                } else {
                    console.log(`   ✅ CUMPLE - No suma incumplidos`);
                }
            } else {
                console.log(`\n⚠️ Parámetro con peso ${item.peso} - IGNORADO (peso debe ser > 0)`);
            }
        });

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📈 [IRCA-CALC] Resultados finales:');
        console.log(`   Suma total de pesos analizados: ${sumaPuntajesTotalesAnalizados}`);
        console.log(`   Suma de pesos incumplidos: ${sumaPuntajesIncumplidos}`);

        if (sumaPuntajesTotalesAnalizados === 0) {
            console.warn('⚠️ [IRCA-CALC] Suma total de pesos es 0 - Retornando 0%');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
            return 0;
        }

        const resultado = (sumaPuntajesIncumplidos / sumaPuntajesTotalesAnalizados) * 100;
        console.log(`   Cálculo: (${sumaPuntajesIncumplidos} / ${sumaPuntajesTotalesAnalizados}) * 100 = ${resultado}%`);
        console.log(`   IRCA final (redondeado): ${resultado.toFixed(2)}%`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

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
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔍 [IRCA] Inicio cálculo - Medidas recibidas:', medidas.length);
        console.log('[IRCA] Medidas:', JSON.stringify(medidas, null, 2));

        if (!Array.isArray(medidas) || medidas.length === 0) {
            console.error('[IRCA] ❌ No se enviaron medidas');
            throw new BadRequestException('No se enviaron medidas para calcular IRCA');
        }

        const invalid = medidas.find(m => !Number.isFinite(m?.id_parametro) || !Number.isFinite(m?.valor));
        if (invalid) {
            console.error('[IRCA] ❌ Medidas inválidas:', invalid);
            throw new BadRequestException('Existen medidas incompletas o no numéricas; no es posible calcular IRCA');
        }

        const ids = medidas.map(m => m.id_parametro);
        console.log('[IRCA] IDs de parámetros solicitados:', ids);

        // Traemos todos los parámetros necesarios en una sola consulta
        const parametros = await this.parametroRepo.findBy({ id: In(ids) });
        console.log('[IRCA] Parámetros encontrados en BD:', parametros.length);

        if (parametros.length !== ids.length) {
            const foundIds = new Set(parametros.map(p => p.id));
            const missing = ids.filter(id => !foundIds.has(id));
            console.error('[IRCA] ❌ Parámetros faltantes en BD:', missing);
            throw new NotFoundException(`No existen parámetros configurados para los IDs: ${missing.join(', ')}`);
        }

        const parametrosPorId = new Map(parametros.map(p => [Number(p.id), p] as const));

        const detalles = medidas.map(m => {
            const p = parametrosPorId.get(m.id_parametro);
            if (!p) {
                console.warn(`[IRCA] ⚠️ Parámetro ID ${m.id_parametro} no encontrado en BD`);
                return null;
            }

            console.log(`  ✅ Parámetro encontrado: ID:${p.id} - ${p.nombre} | Min:${p.valorMinimo} | Max:${p.valorMaximo} | Peso:${p.puntajeRiesgo}`);

            return {
                valor: m.valor,
                min: p.valorMinimo,
                max: p.valorMaximo,
                peso: p.puntajeRiesgo
            };
        }).filter(d => d !== null);

        console.log(`[IRCA] Detalles procesados: ${detalles.length} parámetros válidos`);

        const puntaje = this.calcularPorcentajeIrca(detalles);
        console.log(`[IRCA] 📈 Puntaje IRCA calculado: ${puntaje}%`);

        const clasificacion = await this.obtenerClasificacion(puntaje);
        console.log(`[IRCA] 🏷️ Clasificación: ${clasificacion?.clasificacion || 'No encontrada'} (ID: ${clasificacion?.id})`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        return { puntaje, clasificacion };
    }


}
