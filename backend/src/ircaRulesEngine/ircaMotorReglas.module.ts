import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IrcaMotorReglasService } from './ircaClasificacion.service';
import { Parametro } from './entities/parametros.entity';
import { ClasificacionIrca } from './entities/clasificacionesIRCA.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Parametro, ClasificacionIrca])
  ],
  providers: [IrcaMotorReglasService],
  exports: [IrcaMotorReglasService],
})
export class IrcaMotorReglasModule { }