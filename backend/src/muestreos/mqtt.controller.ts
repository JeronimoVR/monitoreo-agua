import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, Ctx, MqttContext } from '@nestjs/microservices';
import { MuestreosService } from './muestreos.service';
import { CreateMuestreoDto } from './dto/create-muestreo.dto';

/**
 * Controlador específico para la recepción de mensajes MQTT.
 */
@Controller()
export class MqttController {
  constructor(private readonly muestreosService: MuestreosService) { }

  /**
   * Maneja los datos enviados por los sensores a través del tópico MQTT.
   * @param data Datos del sensor recibidos (CreateMuestreoDto)
   * @returns El muestreo procesado y creado
   */
  // @MessagePattern('sensores/datos')
  // handleSensorData(@Payload() data: CreateMuestreoDto) {
  //   console.info('Datos recibidos del ESP32:', data);
  //   return this.muestreosService.crear(data);
  // }
  @MessagePattern('sensores/datos')
  async handleSensorData(@Payload() data: any, @Ctx() context: MqttContext) {
    // 1. Ver qué llega exactamente (Crucial para debug)
    console.log('--- NUEVO MENSAJE MQTT ---');
    console.log('Payload recibido:', JSON.stringify(data, null, 2));

    try {
      // 2. Construir el DTO manualmente si quieres seguir usando validaciones
      // o simplemente mapear los datos si los nombres no coinciden
      const nuevoMuestreo: CreateMuestreoDto = {
        id_estacion: data.id_estacion || data.idEstacion,
        medidas: (data.medidas || []).map(m => ({
          id_parametro: m.id_parametro || m.idParametro,
          valor: m.valor
        }))
      };

      console.info('DTO Construido:', nuevoMuestreo);

      // 3. Guardar en DB
      return await this.muestreosService.crear(nuevoMuestreo);

    } catch (error) {
      console.error('Error procesando datos del sensor:', error.message);
    }
  }
}