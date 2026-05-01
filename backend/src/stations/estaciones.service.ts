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

    /**
     * Crea una nueva estación
     * @param createEstacionDto Datos para crear la estación
     * @returns La estación creada
     */
    create(createEstacionDto: CreateEstacionDto) {
        const nuevaEstacion = this.estacionRepository.create(createEstacionDto);
        return this.estacionRepository.save(nuevaEstacion);
    }

    /**
     * Obtiene todas las estaciones
     * @returns Lista de todas las estaciones
     */
    findAll() {
        return this.estacionRepository.find({ order: { id: 'ASC' } });
    }

    /**
     * Obtiene una estación por su ID
     * @param id ID de la estación
     * @returns La estación encontrada
     * @throws {NotFoundException} si la estación no existe
     */
    async findOne(id: number) {
        const estacion = await this.estacionRepository.findOneBy({ id });
        if (!estacion) throw new NotFoundException(`Estación con ID ${id} no encontrada`);
        return estacion;
    }

    /**
     * Actualiza una estación existente
     * @param id ID de la estación a actualizar
     * @param updateEstacionDto Datos para actualizar la estación
     * @returns La estación actualizada
     */
    async update(id: number, updateEstacionDto: UpdateEstacionDto) {
        const estacion = await this.findOne(id);
        const editada = Object.assign(estacion, updateEstacionDto);
        return this.estacionRepository.save(editada);
    }

    /**
     * Elimina permanentemente una estación
     * @param id ID de la estación a eliminar
     * @returns La estación eliminada
     */
    async remove(id: number) {
        const estacion = await this.findOne(id);
        return this.estacionRepository.remove(estacion);
    }

    /**
     * Realiza un borrado lógico (soft delete) de una estación
     * @param id ID de la estación a borrar lógicamente
     * @returns La estación borrada lógicamente
     */
    async softDelete(id: number) {
        const estacion = await this.findOne(id);
        return this.estacionRepository.softRemove(estacion);
    }
}