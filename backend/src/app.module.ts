import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosModule } from './users/usuarios.module';
import { MuestreosModule } from './muestreos/muestreos.module';
import { IrcaMotorReglasModule } from './ircaMotorReglas/ircaMotorReglas.module';
import { SeedService } from './seed.service';
import { Parametro } from './ircaMotorReglas/entities/parametros.entity';
import { ClasificacionIrca } from './ircaMotorReglas/entities/clasificacionesIRCA.entity';
import { Estacion } from './estaciones/entities/estacion.entity';
import { AuthModule } from './auth/auth.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { EstacionesModule } from './estaciones/estaciones.module';
import { Usuario } from './users/entities/usuario.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Parametro, ClasificacionIrca, Estacion, Usuario]),

    UsuariosModule,
    MuestreosModule,
    IrcaMotorReglasModule,
    AuthModule,
    NotificacionesModule,
    EstacionesModule,

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
    ThrottlerModule.forRoot([{
      ttl: 60000, // 60 segundos (1 minuto)
      limit: 10,  // Máximo 10 peticiones por minuto por IP
    }]),
  ],
  providers: [SeedService],
})
export class AppModule { }