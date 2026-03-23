import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Estacion } from './entities/estacion.entity';
import { CreateEstacionDto } from './dto/create-estacion.dto';
import { UpdateEstacionDto } from './dto/update-estacion.dto';

@Injectable()
export class EstacionesService {
    constructor(
        @InjectRepository(Estacion)
        private readonly estacionRepository: Repository<Estacion>,
    ) { }

    create(createEstacionDto: CreateEstacionDto) {
        const nuevaEstacion = this.estacionRepository.create(createEstacionDto);
        return this.estacionRepository.save(nuevaEstacion);
    }

    findAll() {
        return this.estacionRepository.find({ order: { id: 'ASC' } });
    }

    async findOne(id: number) {
        const estacion = await this.estacionRepository.findOneBy({ id });
        if (!estacion) throw new NotFoundException(`Estación con ID ${id} no encontrada`);
        return estacion;
    }

    async update(id: number, updateEstacionDto: UpdateEstacionDto) {
        const estacion = await this.findOne(id);
        const editada = Object.assign(estacion, updateEstacionDto);
        return this.estacionRepository.save(editada);
    }

    async remove(id: number) {
        const estacion = await this.findOne(id);
        return this.estacionRepository.remove(estacion);
    }
}