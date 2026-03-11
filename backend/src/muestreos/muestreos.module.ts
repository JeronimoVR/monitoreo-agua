import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MuestreosService } from './muestreos.service';
import { MuestreosController } from './muestreos.controller';
import { Muestreo } from './entities/muestreos.entity';
import { Medida } from './entities/medidas.entity';
import { IrcMotorReglasModule } from '../ircaMotorReglas/ircaMotorReglas.module';
import { Estacion } from 'src/estaciones/entities/estacion.entity';

/**
 * Módulo encargado de la gestión de muestreos y sus medidas asociadas.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Muestreo, Medida,Estacion
    ]),
    IrcMotorReglasModule,
  ],
  controllers: [MuestreosController],
  providers: [MuestreosService],
  exports: [MuestreosService],
})
export class MuestreosModule { }