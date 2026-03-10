import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const databaseProvider = {
  provide: 'DATABASE_CONFIG', // Token opcional por si quieres inyectar la config manual
  inject: [ConfigService],
  useFactory: (configService: ConfigService): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: configService.get<string>('DATABASE_HOST', 'db'), // 'db' es el nombre en docker-compose
    port: configService.get<number>('DATABASE_PORT', 5432),
    username: configService.get<string>('DB_USER'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_NAME'),
    autoLoadEntities: true, // Importante: Carga las entidades de cada módulo automáticamente
    synchronize: true,      // Crea las tablas al iniciar (usar solo en dev)
    logging: true,          // Muestra el SQL en consola
  }),
};