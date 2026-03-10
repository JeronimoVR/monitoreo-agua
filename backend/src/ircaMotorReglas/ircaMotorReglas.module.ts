import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IrcMotorReglasService } from './ircaClasificacion.service';
import { Parametro } from './entities/parametros.entity';
import { ClasificacionesIRCA } from './entities/clasificacionesIRCA.entity';

/**
 * Módulo para el motor de reglas de cálculo del IRCA.
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Parametro, ClasificacionesIRCA])
  ],
  providers: [IrcMotorReglasService],
  exports: [IrcMotorReglasService],
})
export class IrcMotorReglasModule { }