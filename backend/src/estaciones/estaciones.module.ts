import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstacionesService } from './estaciones.service';
import { EstacionesController } from './estaciones.controller';
import { Estacion } from './entities/estacion.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Estacion])
    ],
    controllers: [EstacionesController],
    providers: [EstacionesService],
    exports: [EstacionesService],
})
export class EstacionesModule { }