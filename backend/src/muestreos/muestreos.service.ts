import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Muestreo } from './entities/muestreos.entity';
import { Medida } from './entities/medidas.entity';
import { CreateMuestreoDto } from './dto/create-muestreo.dto';
import { IrcMotorReglasService } from '../ircaMotorReglas/ircaClasificacion.service';

@Injectable()
export class MuestreosService {
    constructor(
        @InjectRepository(Muestreo)
        private muestreoRepo: Repository<Muestreo>,
        @InjectRepository(Medida)
        private medidaRepo: Repository<Medida>,
        private ircaClasificacionService: IrcMotorReglasService,
    ) { }

    /**
     * Crea un nuevo muestreo calculando su IRCA y asociando sus medidas.
     * @param createMuestreoDto Objeto de transferencia de datos con la información del muestreo
     * @returns El muestreo creado con su clasificación IRCA
     */
    async crear(createMuestreoDto: CreateMuestreoDto) {
        // 1. Delegamos el cálculo y la clasificación al otro servicio
        // El MuestreosService solo envía las medidas y espera el resultado
        const resultadoIrca = await this.ircaClasificacionService.calcularIrca(
            createMuestreoDto.medidas
        );

        // 2. Guardamos el Muestreo con el resultado obtenido
        const nuevoMuestreo = this.muestreoRepo.create({
            estacion: { id: createMuestreoDto.id_estacion },
            irca_calculado: resultadoIrca.puntaje,
            clasificacionIrca: resultadoIrca.clasificacion || undefined,
        });

        const muestreoGuardado = await this.muestreoRepo.save(nuevoMuestreo);

        // 3. Guardamos las medidas
        const medidasEntities = createMuestreoDto.medidas.map(m => ({
            valor: m.valor,
            parametro: { id: m.id_parametro },
            muestreo: muestreoGuardado
        }));

        await this.medidaRepo.save(medidasEntities);

        return muestreoGuardado;
    }

    /**
     * Obtiene todos los muestreos registrados.
     * @returns Lista de muestreos
     */
    async findAll() {
        return await this.muestreoRepo.find();
    }

    /**
     * Obtiene un muestreo específico por su identificador.
     * @param id Identificador único del muestreo
     * @returns El muestreo encontrado
     */
    async findOne(id: number) {
        return await this.muestreoRepo.findOne({ where: { id } });
    }

}