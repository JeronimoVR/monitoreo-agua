import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MuestreosService } from './muestreos.service';
import { CreateMuestreoDto } from './dto/create-muestreo.dto';

@Controller()
export class MuestreosController {
  constructor(private readonly muestreosService: MuestreosService) {}

  @MessagePattern('sensores/datos') // Tópico MQTT
  handleSensorData(@Payload() data: CreateMuestreoDto) {
    console.info('Datos recibidos del ESP32:', data);
    return this.muestreosService.crear(data);
  }
}