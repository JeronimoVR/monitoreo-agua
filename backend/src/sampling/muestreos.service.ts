import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Muestreo } from '../sampling/entities/muestreos.entity';
import { Medida } from '../sampling/entities/medidas.entity';
import { CreateMuestreoDto } from '../sampling/dto/create-muestreo.dto';
import { IrcaMotorReglasService } from '../ircaRulesEngine/ircaClasificacion.service';
import { NotificacionesService } from '../notifications/notificaciones.service';

@Injectable()
export class MuestreosService {
    constructor(
        @InjectRepository(Muestreo)
        private muestreoRepository: Repository<Muestreo>,
        @InjectRepository(Medida)
        private medidaRepo: Repository<Medida>,
        private ircaClasificacionService: IrcaMotorReglasService,
        private readonly notificacionesService: NotificacionesService,
    ) { }

    /**
     * Crea un nuevo muestreo calculando su IRCA y asociando sus medidas.
     * 
     * @param createMuestreoDto Objeto de transferencia de datos con la información del muestreo.
     * @returns El muestreo creado junto con su clasificación IRCA calculada.
     */
    async crear(createMuestreoDto: CreateMuestreoDto) {
        try {
            const resultadoIrca = await this.ircaClasificacionService.calcularIrca(
                createMuestreoDto.medidas
            );

            const nuevoMuestreo = this.muestreoRepository.create({
                estacion: { id: createMuestreoDto.id_estacion },
                fechaMuestreo: new Date(createMuestreoDto.fecha_muestreo),
                irca_calculado: resultadoIrca.puntaje,
                clasificacionIrca: resultadoIrca.clasificacion || undefined,
                medidas: createMuestreoDto.medidas.map(m => ({
                    valor: m.valor,
                    parametro: { id: m.id_parametro }
                }))
            });
            const muestreoGuardado = await this.muestreoRepository.save(nuevoMuestreo);

            const muestreoCompleto = await this.muestreoRepository.findOne({
                where: { id: muestreoGuardado.id },
                relations: [
                    'estacion',
                    'clasificacionIrca',
                    'medidas',
                    'medidas.parametro',
                ],
            });

            if (!muestreoCompleto) {
                throw new InternalServerErrorException('No fue posible recuperar el muestreo guardado');
            }

            await this.notificacionesService.evaluarYGenerarAlertas(muestreoCompleto);

            return muestreoCompleto;
        } catch (error) {
            console.error('CRITICAL ERROR in MuestreosService.crear:', error.message);
            console.error('Data that caused error:', JSON.stringify(createMuestreoDto));
            console.error('Stack:', error.stack);
            throw new InternalServerErrorException('Error inesperado al crear el muestreo y sus medidas: ' + error.message);
        }
    }

    /**
     * Obtiene todos los muestreos registrados en la base de datos.
     * 
     * @returns Una lista con todos los muestreos registrados.
     */
    async findAll() {
        try {
            return await this.muestreoRepository.find();
        } catch (error) {
            throw new InternalServerErrorException('Error al obtener la lista de muestreos.');
        }
    }

    /**
     * Obtiene un muestreo específico basado en su identificador.
     * 
     * @param id Identificador único del muestreo que se desea buscar.
     * @returns El muestreo encontrado o undefined si no existe.
     */
    async findOne(id: number) {
        const muestreo = await this.muestreoRepository.findOne({ where: { id } });
        if (!muestreo) {
            throw new NotFoundException(`Muestreo con ID ${id} no encontrado`);
        }
        return muestreo;
    }

    /**
     * Elimina un muestreo específico y sus medidas relacionadas.
     * 
     * @param id Identificador único del muestreo a eliminar.
     * @returns El muestreo eliminado o el resultado de la operación.
     */
    async eliminar(id: number) {
        const muestreo = await this.findOne(id);

        try {
            return await this.muestreoRepository.remove(muestreo);
        } catch (error) {
            throw new InternalServerErrorException(`Error al intentar eliminar el muestreo con ID ${id}`);
        }
    }

    /**
     * Consulta los muestreos asociados a una estación específica.
     * 
     * @param id_estacion Identificador de la estación.
     * @returns Lista de muestreos encontrados.
     */
    async consultarPorEstacion(id_estacion: number) {
        try {
            return await this.muestreoRepository.find({
                where: { estacionId: id_estacion },
                relations: ['medidas', 'clasificacionIrca'],
            });
        } catch (error) {
            throw new InternalServerErrorException(`Error al consultar muestreos para la estación ${id_estacion}`);
        }
    }


    /**
     * Filtra los muestreos en la base de datos basándose en criterios específicos.
     * Útil para la generación de reportes y visualización de datos históricos.
     * 
     * @param filters Objeto con los filtros a aplicar: estacionId, parametro, fechaInicio, fechaFin.
     * @returns Una lista de muestreos que coinciden con los filtros, ordenados descendentemente por fecha.
     */
    async getFilteredMuestreos(filters: any) {
        const estacionId = Number.parseInt(String(filters?.estacionId ?? ''), 10);
        if (!Number.isFinite(estacionId)) {
            throw new BadRequestException('El filtro estacionId es obligatorio y debe ser numérico');
        }

        const parseDate = (value: any): Date | null => {
            if (!value) return null;
            const dt = new Date(String(value));
            return Number.isNaN(dt.getTime()) ? null : dt;
        };

        const fechaInicio = parseDate(filters?.fechaInicio);
        const fechaFin = parseDate(filters?.fechaFin);

        const query = this.muestreoRepository.createQueryBuilder('m')
            .leftJoinAndSelect('m.estacion', 'estacion')
            .leftJoinAndSelect('m.clasificacionIrca', 'clasificacionIrca')
            .leftJoinAndSelect('m.medidas', 'medidas')
            .leftJoinAndSelect('medidas.parametro', 'parametro')
            .where('m.estacionId = :estacionId', { estacionId });

        if (fechaInicio && fechaFin) {
            query.andWhere('m.fechaMuestreo BETWEEN :inicio AND :fin', {
                inicio: fechaInicio,
                fin: fechaFin,
            });
        } else if (fechaInicio) {
            query.andWhere('m.fechaMuestreo >= :inicio', { inicio: fechaInicio });
        } else if (fechaFin) {
            query.andWhere('m.fechaMuestreo <= :fin', { fin: fechaFin });
        }

        return await query.orderBy('m.fechaMuestreo', 'DESC').getMany();
    }

    /**
     * Genera un buffer de texto en formato CSV a partir de los datos filtrados.
     * Ideal para la exportación de reportes tabulares para el usuario final.
     * 
     * @param filters Criterios de filtrado para los datos a exportar.
     * @returns Un string formateado como CSV listo para ser descargado o enviado en la respuesta HTTP.
     */
    async generateCsvBuffer(filters: any): Promise<string> {
        const data = await this.getFilteredMuestreos(filters);
        if (data.length === 0) return '';

        const csvEscape = (value: unknown) => {
            const str = String(value ?? '');
            return `"${str.replaceAll('"', '""')}"`;
        };

        const TZ = 'America/Bogota';

        // Descubrir dinámicamente todos los parámetros presentes en los datos
        const nombresParametros = Array.from(
            new Set(
                data.flatMap(m =>
                    (m.medidas || [])
                        .map(med => med.parametro?.nombre)
                        .filter((nombre): nombre is string => !!nombre)
                )
            )
        ).sort();

        const header = [
            'Fecha',
            'Hora',
            'Estacion',
            ...nombresParametros,
            'IRCA (%)',
            'Clasificacion IRCA',
        ].join(',') + '\n';

        const rows = data.map(m => {
            const fechaObj = m.fechaMuestreo ? new Date(m.fechaMuestreo) : null;
            const fecha = fechaObj
                ? fechaObj.toLocaleDateString('es-CO', { timeZone: TZ })
                : '';
            const hora = fechaObj
                ? fechaObj.toLocaleTimeString('es-CO', { timeZone: TZ })
                : '';
            const estacion = m.estacion?.nombre || String(m.estacionId ?? '');

            // Mapa nombre → valor para acceso O(1) por parámetro
            const medidasMap = new Map<string, number | string>(
                (m.medidas || [])
                    .filter(med => !!med.parametro?.nombre)
                    .map(med => [med.parametro.nombre, med.valor])
            );

            const valoresParametros = nombresParametros.map(nombre =>
                csvEscape(medidasMap.get(nombre) ?? '')
            );

            return [
                csvEscape(fecha),
                csvEscape(hora),
                csvEscape(estacion),
                ...valoresParametros,
                csvEscape(typeof m.irca_calculado === 'number'
                    ? m.irca_calculado.toFixed(2)
                    : ''),
                csvEscape(m.clasificacionIrca?.clasificacion ?? ''),
            ].join(',');
        }).join('\n');

        return header + rows + '\n';
    }

    /**
     * Obtiene el historial reciente de muestreos de una estación específica.
     * Limita la consulta a los últimos 20 registros para optimizar el rendimiento y evitar
     * sobrecarga en el frontend al cargar gráficas o tablas en tiempo real.
     * 
     * @param idEstacion Identificador de la estación a consultar.
     * @returns Los últimos 20 muestreos con sus relaciones (clasificación y medidas).
     */
    async findAllHistory(idEstacion: number) {
        return await this.muestreoRepository.find({
            where: { estacionId: idEstacion },
            relations: [
                'clasificacionIrca',
                'medidas',
                'medidas.parametro'
            ],
            order: { fechaMuestreo: 'DESC' },
            take: 20,
        });
    }
}
