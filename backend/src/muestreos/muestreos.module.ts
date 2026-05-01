import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MuestreosService } from './muestreos.service';
import { MuestreosController } from './muestreos.controller';
import { Muestreo } from './entities/muestreos.entity';
import { Medida } from './entities/medidas.entity';
import { IrcaMotorReglasModule } from '../ircaRulesEngine/ircaMotorReglas.module';
import { Estacion } from '../stations/entities/estacion.entity';
import { MqttController } from './mqtt.controller';
import { NotificacionesModule } from '../notificaciones/notificaciones.module';

/**
 * Módulo encargado de la gestión de muestreos y sus medidas asociadas.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Muestreo, Medida, Estacion
    ]),
    IrcaMotorReglasModule,
    NotificacionesModule
  ],
  controllers: [MuestreosController, MqttController],
  providers: [MuestreosService],
  exports: [MuestreosService],
})
export class MuestreosModule { }