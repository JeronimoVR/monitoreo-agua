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

    async crear(createMuestreoDto: CreateMuestreoDto) {
        // 1. Calcular IRCA usando el Motor de Reglas
        // Este servicio ya nos devuelve el puntaje y la entidad de clasificación (objeto)
        const resultadoIrca = await this.ircaClasificacionService.calcularIrca(
            createMuestreoDto.medidas
        );

        // 2. Crear la instancia del Muestreo con los resultados del cálculo
        // Nota: Pasamos el objeto 'clasificacion' completo para que TypeORM guarde el ID correcto
        const nuevoMuestreo = this.muestreoRepo.create({
            estacion: { id: createMuestreoDto.id_estacion }, // Relación por ID
            irca_calculado: resultadoIrca.puntaje,
            clasificacionIrca: resultadoIrca.clasificacion, // Objeto entidad ClasificacionIrca
        });

        // Guardar el muestreo padre
        const muestreoGuardado = await this.muestreoRepo.save(nuevoMuestreo);

        // 3. Mapear y guardar todas las medidas asociadas
        const medidas = createMuestreoDto.medidas.map(m => ({
            valor: m.valor,
            parametro: { id: m.id_parametro },
            muestreo: muestreoGuardado // Vinculamos la medida al muestreo recién creado
        }));

        await this.medidaRepo.save(medidas);

        // Retornamos el muestreo guardado (puedes usar relaciones en el find si quieres ver el detalle)
        return muestreoGuardado;
    }

    async findAll() {
        return await this.muestreoRepo.find();
    }

    async findOne(id: number) {
        return await this.muestreoRepo.findOne({ where: { id } });
    }

}