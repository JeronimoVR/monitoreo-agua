import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { databaseProvider } from './database.provider';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => databaseProvider.useFactory(configService),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}