import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: process.env.FRONTEND_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.MQTT,
    options: {
      url: `mqtt://${process.env.MQTT_HOST}:${process.env.MQTT_PORT}`,
      clientId: 'backend_water_project_docker',
      username: process.env.MQTT_USER,
      password: process.env.MQTT_PASSWORD,
      subscribeOptions: { qos: 2 },
    },
  });

  const config = new DocumentBuilder()
    .setTitle('Monitoreo de Agua')
    .setDescription('API para el monitoreo de la calidad del agua')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('monitoreo-agua')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true
  }));

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  await app.startAllMicroservices();

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`🚀 API REST: http://localhost:${port}/api`);
  console.log(`📡 MQTT: Conectado a ${process.env.MQTT_HOST || 'mosquitto'}`);
}
bootstrap();