import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosModule } from './usuarios/usuarios.module';
import { MuestreosModule } from './muestreos/muestreos.module';
import { IrcMotorReglasModule } from './ircaMotorReglas/ircaMotorReglas.module';
import { SeedService } from './seed.service';

// IMPORTA LAS ENTIDADES PARA EL SEED
import { Parametro } from './ircaMotorReglas/entities/parametros.entity'; // Ajusta las rutas
import { ClasificacionIrca } from './ircaMotorReglas/entities/clasificacionesIRCA.entity';
import { Estacion } from './estaciones/entities/estacion.entity';

@Module({
  imports: [
    // 1. REGISTRA LAS ENTIDADES AQUÍ PARA QUE EL SEED SERVICE LAS VEA
    TypeOrmModule.forFeature([Parametro, ClasificacionIrca, Estacion]),

    UsuariosModule,
    MuestreosModule,
    IrcMotorReglasModule,

    ClientsModule.register([
      {
        name: 'MQTT_SERVICE',
        transport: Transport.MQTT,
        options: {
          url: `mqtt://${process.env.MQTT_HOST || 'mosquitto'}:${process.env.MQTT_PORT || 1883}`,
        },
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
  ],
  providers: [SeedService],
})
export class AppModule {}