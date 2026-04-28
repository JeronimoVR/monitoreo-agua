import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { MessagePattern, Payload, Ctx, MqttContext } from '@nestjs/microservices';
import { MuestreosService } from './muestreos.service';
import { CreateMuestreoDto } from './dto/create-muestreo.dto';
import { SseService } from '../notificaciones/sse/sse.service';

@Controller()
export class MqttController {
  constructor(private readonly muestreosService: MuestreosService,
    private readonly sseService: SseService
  ) { }

  /**
   * Maneja los datos enviados por los sensores a través del tópico MQTT "sensores/datos".
   * Este método procesa los datos entrantes enviándolos al servicio de muestreo.
   * 
   * @param data Datos crudos del sensor recibidos a través del broker MQTT.
   * @param context Contexto de la conexión y mensaje MQTT.
   * @returns El objeto de muestreo procesado y persistido.
   */
  @MessagePattern('sensores/datos')
  @UsePipes(new ValidationPipe({ transform: true }))
  async handleSensorData(@Payload() data: CreateMuestreoDto, @Ctx() context: MqttContext) {
    console.info('--- NUEVO MENSAJE MQTT ---');
    console.info('Payload recibido:', JSON.stringify(data, null, 2));

    try {
      // Normalizamos el payload para asegurar que cumpla con el DTO en caso de variaciones de formato
      const nuevoMuestreo: CreateMuestreoDto = {
        id_estacion: data.id_estacion || (data as any).idEstacion,
        fecha_muestreo: data.fecha_muestreo || (data as any).fecha,
        medidas: (data.medidas || []).map(m => ({
          id_parametro: m.id_parametro || (m as any).idParametro,
          valor: m.valor
        }))
      };

      console.info('DTO Construido:', nuevoMuestreo);

      const result = await this.muestreosService.crear(nuevoMuestreo);
      this.sseService.enviarEvento(result, 'nuevo-muestreo');
      return result;

    } catch (error) {
      console.error('Error procesando datos del sensor:', error.message);
    }
  }

  /**
   * Recibe actualizaciones del estado de conexión de los sensores a través del tópico MQTT "sensores/status".
   * Redirige esta información al frontend en tiempo real mediante Server-Sent Events (SSE).
   * 
   * @param data Payload JSON indicando el estado del sensor (ej. conectado/desconectado).
   * @param context Contexto del mensaje MQTT.
   */
  @MessagePattern('sensores/status')
  async handleStatusUpdate(@Payload() data: any, @Ctx() context: MqttContext) {
    console.info('--- NUEVO MENSAJE STATUS ---');
    try {
      this.sseService.enviarEvento(data, 'status-update');
    } catch (error) {
      console.error('Error procesando status del sensor:', error.message);
    }
  }

}