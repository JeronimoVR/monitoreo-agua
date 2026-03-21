import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, Ctx, MqttContext } from '@nestjs/microservices';
import { MuestreosService } from './muestreos.service';
import { CreateMuestreoDto } from './dto/create-muestreo.dto';

@Controller()
export class MqttController {
  constructor(private readonly muestreosService: MuestreosService) { }

  /**
   * Maneja los datos enviados por los sensores a través del tópico MQTT "sensores/datos".
   * Este método procesa los datos entrantes enviándolos al servicio de muestreo.
   * 
   * @param data Datos crudos del sensor recibidos a través del broker MQTT.
   * @param context Contexto de la conexión y mensaje MQTT.
   * @returns El objeto de muestreo procesado y persistido.
   */
  @MessagePattern('sensores/datos')
  async handleSensorData(@Payload() data: any, @Ctx() context: MqttContext) {
    console.info('--- NUEVO MENSAJE MQTT ---');
    console.info('Payload recibido:', JSON.stringify(data, null, 2));

    try {
      const nuevoMuestreo: CreateMuestreoDto = {
        id_estacion: data.id_estacion || data.idEstacion,
        medidas: (data.medidas || []).map(m => ({
          id_parametro: m.id_parametro || m.idParametro,
          valor: m.valor
        }))
      };

      console.info('DTO Construido:', nuevoMuestreo);

      return await this.muestreosService.crear(nuevoMuestreo);

    } catch (error) {
      console.error('Error procesando datos del sensor:', error.message);
    }
  }
}