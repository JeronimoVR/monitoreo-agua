import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';

/**
 * Función encargada de inicializar la aplicación de NestJS,
 * incluyendo la configuración de la API REST (HTTP) y
 * los microservicios usando MQTT.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  app.enableCors();

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.MQTT,
    options: {
      subscribeOptions: { qos: 1 },
      url: `mqtt://${process.env.MQTT_HOST || 'localhost'}:${process.env.MQTT_PORT || 1883}`,
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.PORT || 3001);

  console.log(`🚀 API corriendo en: ${await app.getUrl()}`);
  console.log(`📡 Microservicio MQTT escuchando...`);
}
bootstrap();