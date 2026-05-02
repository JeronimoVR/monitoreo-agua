import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MuestreosController } from './muestreos.controller';
import { Muestreo } from './entities/muestreos.entity';
import { Medida } from './entities/medidas.entity';
import { IrcaMotorReglasModule } from '../ircaRulesEngine/ircaMotorReglas.module';
import { Estacion } from '../stations/entities/estacion.entity';
import { NotificacionesModule } from '../notifications/notificaciones.module';
import { MuestreosService } from './muestreos.service';

import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Muestreo, Medida, Estacion]),
    IrcaMotorReglasModule,
    NotificacionesModule,
    AuthModule
  ],
  controllers: [MuestreosController],
  providers: [MuestreosService],
  exports: [MuestreosService],
})
export class MuestreosModule { }