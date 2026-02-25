// src/main.ts
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // --- CONFIGURACIÓN MQTT ---
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.MQTT,
    options: {
      url: `mqtt://${process.env.MQTT_HOST || 'mosquitto'}:1883`,
    },
  });

  // IMPORTANTE: Esto debe ejecutarse y retornar una promesa exitosa
  await app.startAllMicroservices()
    .then(() => logger.log('🟢 Microservicio MQTT escuchando...'))
    .catch((err) => logger.error('🔴 Error conectando a MQTT:', err));

  await app.listen(3001, '0.0.0.0'); // Inicia la API HTTP para el Dashboard
  logger.log('🚀 Backend Híbrido: HTTP (3001) y MQTT (1883) activos');
}

bootstrap();