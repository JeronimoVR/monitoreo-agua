import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MuestreosService } from './muestreos.service';
import { CreateMuestreoDto } from './dto/create-muestreo.dto';

/**
 * Controlador específico para la recepción de mensajes MQTT.
 */
@Controller()
export class MuestreosController {
  constructor(private readonly muestreosService: MuestreosService) { }

  /**
   * Maneja los datos enviados por los sensores a través del tópico MQTT.
   * @param data Datos del sensor recibidos (CreateMuestreoDto)
   * @returns El muestreo procesado y creado
   */
  @MessagePattern('sensores/datos')
  handleSensorData(@Payload() data: CreateMuestreoDto) {
    console.info('Datos recibidos del ESP32:', data);
    return this.muestreosService.crear(data);
  }
}