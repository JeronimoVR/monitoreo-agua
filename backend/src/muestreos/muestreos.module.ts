import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Muestreo } from './entities/muestreos.entity';
import { Medida } from './entities/medidas.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Muestreo, Medida]),
  ],
})
export class MuestreosModule {}