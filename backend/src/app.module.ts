import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    // Carga de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Configuración asíncrona de TypeORM (PostgreSQL)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'), // Usando el nombre del servicio 'db'
        port: configService.get<number>('DB_PORT'), // Puerto interno del contenedor
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        autoLoadEntities: true, // Carga automáticamente las entidades que definamos
        synchronize: true,      // Solo para desarrollo (crea las tablas automáticamente)
      }),
    }),
    // Aquí iremos agregando nuestros módulos: UsuariosModule, MuestreosModule, etc.
  ],
})
export class AppModule { }