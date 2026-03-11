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
  app.enableCors();

  // Configuración del Microservicio Híbrido
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.MQTT,
    options: {
      url: `mqtt://${process.env.MQTT_HOST || 'mosquitto'}:${process.env.MQTT_PORT || 1883}`,
      // Importante: En Docker, a veces Nest necesita el clientId para no desconectarse
      clientId: 'backend_water_project', 
      subscribeOptions: { qos: 1 },
    },
  });

  // Pipe Global (Afecta a HTTP)
  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true, 
    forbidNonWhitelisted: true 
  }));

  // Arrancar primero los microservicios
  await app.startAllMicroservices();
  
  // Luego arrancar HTTP
  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 API REST: http://localhost:${port}/api`);
  console.log(`📡 MQTT: Conectado a ${process.env.MQTT_HOST || 'mosquitto'}`);
}
bootstrap();