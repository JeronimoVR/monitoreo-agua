import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngestionService } from './ingestion.service';
import { MuestreosController } from '../sampling/muestreos.controller';
import { Muestreo } from '../sampling/entities/muestreos.entity';
import { Medida } from '../sampling/entities/medidas.entity';
import { IrcaMotorReglasModule } from '../ircaRulesEngine/ircaMotorReglas.module';
import { Estacion } from '../stations/entities/estacion.entity';
import { IngestionController } from './ingestion.controller';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Muestreo, Medida, Estacion
    ]),
    IrcaMotorReglasModule,
    NotificacionesModule
  ],
  controllers: [MuestreosController, IngestionController],
  providers: [IngestionService],
  exports: [IngestionService],
})
export class IngestionModule { }