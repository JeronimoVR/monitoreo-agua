import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MuestreosService } from './muestreos.service';
import { MuestreosController } from './muestreos.controller';
import { Muestreo } from './entities/muestreos.entity';
import { Medida } from './entities/medidas.entity';

@Module({
  imports: [
    // Registramos las entidades para que TypeORM cree los repositorios
    TypeOrmModule.forFeature([Muestreo, Medida]),
  ],
  controllers: [MuestreosController],
  providers: [MuestreosService],
  exports: [MuestreosService], // Lo exportamos por si el motor de reglas necesita usarlo
})
export class MuestreosModule {}