import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeasuresService } from './measures.service';
import { MeasuresController } from './measures.controller';
import { Measure } from './entities/measure.entity';
import { Station } from '../stations/entities/station.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Measure, Station])],
  controllers: [MeasuresController],
  providers: [MeasuresService],
})
export class MeasuresModule {}