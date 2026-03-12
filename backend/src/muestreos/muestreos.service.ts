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
     * 
     * @param createMuestreoDto Objeto de transferencia de datos con la información del muestreo.
     * @returns El muestreo creado junto con su clasificación IRCA calculada.
     */
    async crear(createMuestreoDto: CreateMuestreoDto) {
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
    }

    /**
     * Obtiene todos los muestreos registrados en la base de datos.
     * 
     * @returns Una lista con todos los muestreos registrados.
     */
    async findAll() {
        return await this.muestreoRepo.find();
    }

    /**
     * Obtiene un muestreo específico basado en su identificador.
     * 
     * @param id Identificador único del muestreo que se desea buscar.
     * @returns El muestreo encontrado o undefined si no existe.
     */
    async findOne(id: number) {
        return await this.muestreoRepo.findOne({ where: { id } });
    }

}