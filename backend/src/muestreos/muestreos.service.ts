import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Muestreo } from './entities/muestreos.entity';
import { Medida } from './entities/medidas.entity';
import { CreateMuestreoDto } from './dto/create-muestreo.dto';
import { IrcaMotorReglasService } from '../ircaMotorReglas/ircaClasificacion.service';

@Injectable()
export class MuestreosService {
    constructor(
        @InjectRepository(Muestreo)
        private muestreoRepository: Repository<Muestreo>,
        @InjectRepository(Medida)
        private medidaRepo: Repository<Medida>,
        private ircaClasificacionService: IrcaMotorReglasService,
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
                fecha_muestreo: createMuestreoDto.fecha_muestreo,
                irca_calculado: resultadoIrca.puntaje,
                clasificacionIrca: resultadoIrca.clasificacion || undefined,
            });

            const muestreoGuardado = await this.muestreoRepository.save(nuevoMuestreo);

            const medidasEntities = createMuestreoDto.medidas.map(m => ({
                valor: m.valor,
                parametro: { id: m.id_parametro },
                muestreo: muestreoGuardado
            }));

            await this.medidaRepo.save(medidasEntities);

            return muestreoGuardado;
        } catch (error) {
            throw new InternalServerErrorException('Error inesperado al crear el muestreo y sus medidas.');
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
                where: { id_estacion },
                relations: ['medidas', 'clasificacionIrca'],
            });
        } catch (error) {
            throw new InternalServerErrorException(`Error al consultar muestreos para la estación ${id_estacion}`);
        }
    }


    async getFilteredMuestreos(filters: any) {
    const { estacionId, parametro, fechaInicio, fechaFin } = filters;
    
    const query = this.muestreoRepository.createQueryBuilder('m')
      .where('m.estacionId = :estacionId', { estacionId });

    if (parametro) {
      query.andWhere('m.parametro = :parametro', { parametro });
    }

    if (fechaInicio && fechaFin) {
      query.andWhere('m.fecha BETWEEN :inicio AND :fin', { 
        inicio: new Date(fechaInicio), 
        fin: new Date(fechaFin) 
      });
    }

    return await query.orderBy('m.fecha', 'DESC').getMany();
  }

  async generateCsvBuffer(filters: any): Promise<string> {
    const data = await this.getFilteredMuestreos(filters);
    const header = 'Fecha,Estacion,Parametro,Valor,Unidad\n';
    const rows = data.map(m => 
      `${m.fecha_muestreo},${m.estacion.id},${m.medidas.map(medida => medida.parametro.nombre).join(', ')},${m.medidas.map(medida => medida.valor).join(', ')},${m.medidas.map(medida => medida.parametro.unidadMedida).join(', ')}`
    ).join('\n');
    
    return header + rows;
  }
}