import { Controller, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MessagePattern, Payload, Ctx, MqttContext } from '@nestjs/microservices';
import { MuestreosService } from '../sampling/muestreos.service'; // Importamos el servicio del otro módulo
import { CreateMuestreoDto } from '../sampling/dto/create-muestreo.dto';
import { SseService } from '../common/sse/sse.service';

@ApiTags('Ingestión MQTT (IoT)')
@Controller()
export class IngestionController {
  constructor(
    private readonly muestreosService: MuestreosService,
    private readonly sseService: SseService
  ) { }

  /**
   * Tópico: sensores/datos
   * Tópico: sensores/datos
   * Obtiene datos de los sensores, los normaliza y solicita su persistencia.
   */
  @ApiOperation({ summary: 'Recepción de datos IoT', description: 'Tópico MQTT: sensores/datos' })
  @MessagePattern('sensores/datos')
  @UsePipes(new ValidationPipe({ transform: true }))
  async handleSensorData(@Payload() data: CreateMuestreoDto, @Ctx() context: MqttContext) {
    console.info('--- RECEPCIÓN DE DATOS IoT ---');

    try {
      // 1. Normalización (Asegura consistencia entre hardware y backend)
      const nuevoMuestreo: CreateMuestreoDto = {
        id_estacion: data.id_estacion || (data as any).idEstacion,
        fecha_muestreo: data.fecha_muestreo || (data as any).fecha || new Date(),
        medidas: (data.medidas || []).map(m => ({
          id_parametro: m.id_parametro || (m as any).idParametro,
          valor: m.valor
        }))
      };

      // 2. Comunicación con Sampling: Análisis e Inserción
      const result = await this.muestreosService.crear(nuevoMuestreo);

      // 3. Notificación en Tiempo Real vía SSE
      this.sseService.enviarEvento(result, 'nuevo-muestreo');

      return result;
    } catch (error) {
      console.error('Error en Ingestión MQTT:', error.message);
    }
  }

  /**
   * Tópico: sensores/status
   * Maneja la disponibilidad del ESP32 (LWT) y la comunica al Dashboard.
   */
  @ApiOperation({ summary: 'Estado de conexión de los sensores', description: 'Tópico MQTT: sensores/status' })
  @MessagePattern('sensores/status')
  async handleStatusUpdate(@Payload() data: any) {
    try {
      this.sseService.enviarEvento(data, 'status-update');
    } catch (error) {
      console.error('Error en Status MQTT:', error.message);
    }
  }
}