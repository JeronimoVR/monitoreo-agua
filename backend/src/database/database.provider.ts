import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

/**
 * Configuración del proveedor de base de datos.
 * Define la conexión a PostgreSQL utilizando las variables de entorno configuradas.
 */
export const databaseProvider = {
  provide: 'DATABASE_CONFIG',
  inject: [ConfigService],
  useFactory: (configService: ConfigService): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: configService.get<string>('DATABASE_HOST', 'db'),
    port: configService.get<number>('DATABASE_PORT', 5432),
    username: configService.get<string>('DB_USER'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_NAME'),
    autoLoadEntities: true,
    synchronize: true, //false en producción
    logging: true,
    extra: {
      timezone: 'America/Bogota',
    },
  }),
};