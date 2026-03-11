import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UsuariosModule } from './usuarios/usuarios.module';
import { MuestreosModule } from './muestreos/muestreos.module';
import { IrcMotorReglasModule } from './ircaMotorReglas/ircaMotorReglas.module';

@Module({
  imports: [
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
})
export class AppModule {}