import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosModule } from './users/usuarios.module';
import { IngestionModule } from './ingestion/ingestion.module';
import { IrcaMotorReglasModule } from './ircaRulesEngine/ircaMotorReglas.module';
import { SeedService } from './seed.service';
import { Parametro } from './ircaRulesEngine/entities/parametros.entity';
import { ClasificacionIrca } from './ircaRulesEngine/entities/clasificacionesIRCA.entity';
import { Estacion } from './stations/entities/estacion.entity';
import { AuthModule } from './auth/auth.module';
import { NotificacionesModule } from './notifications/notificaciones.module';
import { EstacionesModule } from './stations/estaciones.module';
import { Usuario } from './users/entities/usuario.entity';
import { MuestreosModule } from './sampling/sampling.module';
import { MailModule } from './common/mail/mail.module';
import { ScheduleModule } from '@nestjs/schedule';
import { EmailLog } from './common/mail/entities/email-log.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forFeature([Parametro, ClasificacionIrca, Estacion, Usuario, EmailLog]),
    ScheduleModule.forRoot(),

    UsuariosModule,
    IngestionModule,
    MuestreosModule,
    IrcaMotorReglasModule,
    AuthModule,
    NotificacionesModule,
    EstacionesModule,
    MailModule,

    ClientsModule.register([
      {
        name: 'MQTT_SERVICE',
        transport: Transport.MQTT,
        options: {
          url: `mqtt://${process.env.MQTT_HOST || 'mosquitto'}:${process.env.MQTT_PORT || 1883}`,
        },
      },
    ]),
    DatabaseModule,
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
  ],
  providers: [SeedService],
})
export class AppModule { }
