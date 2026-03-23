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
        private muestreoRepo: Repository<Muestreo>,
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

            const nuevoMuestreo = this.muestreoRepo.create({
                estacion: { id: createMuestreoDto.id_estacion },
                irca_calculado: resultadoIrca.puntaje,
                clasificacionIrca: resultadoIrca.clasificacion || undefined,
            });

            const muestreoGuardado = await this.muestreoRepo.save(nuevoMuestreo);

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
            return await this.muestreoRepo.find();
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
        const muestreo = await this.muestreoRepo.findOne({ where: { id } });
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
            return await this.muestreoRepo.remove(muestreo);
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
            return await this.muestreoRepo.find({
                where: { id_estacion },
                relations: ['medidas', 'clasificacionIrca'],
            });
        } catch (error) {
            throw new InternalServerErrorException(`Error al consultar muestreos para la estación ${id_estacion}`);
        }
    }

}