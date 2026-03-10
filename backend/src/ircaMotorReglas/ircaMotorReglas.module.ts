import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IrcMotorReglasService } from './ircaClasificacion.service';
import { Parametro } from './entities/parametros.entity';
import { ClasificacionesIRCA } from './entities/clasificacionesIRCA.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Parametro, ClasificacionesIRCA])
  ],
  providers: [IrcMotorReglasService],
  exports: [IrcMotorReglasService], // Vital para que MuestreosService lo use
})
export class IrcMotorReglasModule {}