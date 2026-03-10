import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Configuración de la API REST
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  app.enableCors(); // Permitir que Next.js se conecte

  // 2. Configuración del Microservicio MQTT
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.MQTT,
    options: {
      subscribeOptions: { qos: 1 },
      url: `mqtt://${process.env.MQTT_HOST || 'localhost'}:${process.env.MQTT_PORT || 1883}`,
    },
  });

  // Iniciar microservicios y luego la app HTTP
  await app.startAllMicroservices();
  await app.listen(process.env.PORT || 3001);
  
  console.log(`🚀 API corriendo en: ${await app.getUrl()}`);
  console.log(`📡 Microservicio MQTT escuchando...`);
}
bootstrap();