import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstacionesService } from './estaciones.service';
import { EstacionesController } from './estaciones.controller';
import { Estacion } from './entities/estacion.entity';
import { SensorStatusService } from './sensor-status.service';
import { NotificacionesModule } from '../notifications/notificaciones.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Estacion]),
        NotificacionesModule,
    ],
    controllers: [EstacionesController],
    providers: [EstacionesService, SensorStatusService],
    exports: [EstacionesService, SensorStatusService],
})
export class EstacionesModule { }
