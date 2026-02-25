import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Measure } from './entities/measure.entity';
import { CreateMeasureDto } from './dto/create-measure.dto';
import { Station } from '../stations/entities/station.entity';

@Injectable()
export class MeasuresService {
  constructor(
    @InjectRepository(Measure)
    private readonly measureRepository: Repository<Measure>,
    @InjectRepository(Station)
    private readonly stationRepository: Repository<Station>,
  ) {}

  async create(createMeasureDto: CreateMeasureDto): Promise<Measure> {
    const station = await this.stationRepository.findOneBy({ id: createMeasureDto.estacionId });
    if (!station) {
      throw new NotFoundException(`Estación con ID ${createMeasureDto.estacionId} no encontrada`);
    }

    const newMeasure = this.measureRepository.create({
      ...createMeasureDto,
      estacion: station,
    });

    return await this.measureRepository.save(newMeasure);
  }

  async findAll(): Promise<Measure[]> {
    return await this.measureRepository.find({
      relations: ['estacion'],
      order: { fecha: 'DESC' },
      take: 20,
    });
  }
}