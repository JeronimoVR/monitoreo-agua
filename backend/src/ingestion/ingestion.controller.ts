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
  async handleSensorData(@Payload() data: any, @Ctx() context: MqttContext) {
    console.info('--- RECEPCIÓN DE DATOS IoT ---');
    console.log('Payload recibido:', JSON.stringify(data));

    try {
      // 1. Normalización (Asegura consistencia entre hardware y backend)
      // El ESP32 puede enviar idEstacion o id_estacion, fecha o fecha_muestreo, etc.
      const nuevoMuestreo: CreateMuestreoDto = {
        id_estacion: Number(data.id_estacion || data.idEstacion || data.stationId),
        fecha_muestreo: data.fecha_muestreo || data.fecha || new Date(),
        medidas: (data.medidas || data.measures || []).map(m => ({
          id_parametro: Number(m.id_parametro || m.idParametro || m.parameterId),
          valor: Number(m.valor || m.value)
        }))
      };

      console.log('Datos normalizados para guardar:', JSON.stringify(nuevoMuestreo));

      // 2. Comunicación con Sampling: Análisis e Inserción
      const result = await this.muestreosService.crear(nuevoMuestreo);

      // 3. Notificación en Tiempo Real vía SSE
      this.sseService.enviarEvento(result, 'nuevo-muestreo');

      return result;
    } catch (error: any) {
      console.error('Error en Ingestión MQTT:', error.message);
      console.error('Stack trace:', error.stack);
      
      // Enviar evento de error vía SSE para el administrador/dashboard
      this.sseService.enviarEvento({
        error: true,
        mensaje: 'Fallo al guardar en Base de Datos desde MQTT',
        detalle: error.message
      }, 'error-db-ingestion');
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
      this.sseService.enviarEvento(data, 'status-sensores');
    } catch (error) {
      console.error('Error en Status MQTT:', error.message);
    }
  }
}