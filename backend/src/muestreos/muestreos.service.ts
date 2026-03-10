import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Muestreo } from './entities/muestreos.entity';
import { Medida } from './entities/medidas.entity';
import { CreateMuestreoDto } from './dto/create-muestreo.dto';

@Injectable()
export class MuestreosService {
    constructor(
        @InjectRepository(Muestreo)
        private muestreoRepo: Repository<Muestreo>,
        @InjectRepository(Medida)
        private medidaRepo: Repository<Medida>,
    ) { }

    async crear(createMuestreoDto: CreateMuestreoDto) {
        // 1. Calcular IRCA (Aquí llamarías a tu motor de reglas después)
        const ircaCalculado = 0; // Temporalmente en 0

        // 2. Crear el registro de muestreo
        const nuevoMuestreo = this.muestreoRepo.create({
            estacion: { id: createMuestreoDto.id_estacion },
            irca_calculado: ircaCalculado,
        });
        const muestreoGuardado = await this.muestreoRepo.save(nuevoMuestreo);

        // 3. Guardar todas las medidas asociadas
        const medidas = createMuestreoDto.medidas.map(m => ({
            valor: m.valor,
            parametro: { id: m.id_parametro },
            muestreo: muestreoGuardado
        }));

        await this.medidaRepo.save(medidas);
        return muestreoGuardado;
    }

    async findAll() {
        return await this.muestreoRepo.find();
    }

    async findOne(id: number) {
        return await this.muestreoRepo.findOne({ where: { id } });
    }
}