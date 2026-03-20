import { Controller, Post, Body, Get, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MuestreosService } from './muestreos.service';
import { CreateMuestreoDto } from './dto/create-muestreo.dto';

/**
 * Controlador para la gestión de muestreos y medidas de calidad de agua.
 */
@Controller('muestreos')
export class MuestreosController {
  constructor(private readonly muestreosService: MuestreosService) { }

  /**
   * Crea un nuevo registro de muestreo a través de la API REST.
   * @param createMuestreoDto Datos del muestreo a crear
   * @returns El muestreo creado
   */
  @Post()
  async crearMuestreoViaRest(@Body() createMuestreoDto: CreateMuestreoDto) {
    return await this.muestreosService.crear(createMuestreoDto);
  }

  /**
   * Obtiene todos los muestreos registrados a través de la API REST.
   * @returns Lista de muestreos
   */
  @Get()
  async obtenerTodos() {
    return await this.muestreosService.findAll();
  }

  /**
   * Obtiene un muestreo en específico por su identificador.
   * @param id Identificador único del muestreo
   * @returns Muestreo encontrado
   */
  @Get(':id')
  async obtenerUno(@Param('id', ParseIntPipe) id: number) {
    return await this.muestreosService.findOne(id);
  }

  /**
   * Elimina un muestreo específico por su identificador.
   * @param id Identificador único del muestreo a eliminar
   * @returns El muestreo eliminado
   */
  @Delete(':id')
  async eliminar(@Param('id', ParseIntPipe) id: number) {
    return await this.muestreosService.eliminar(id);
  }

  /**
   * Maneja los datos de muestreo entrantes a través del protocolo MQTT provenientes de los sensores IoT.
   * @param data Datos del muestreo recibidos por MQTT
   * @returns El muestreo creado
   */
  @MessagePattern('sensores/muestreos')
  async handleMuestreoMqtt(@Payload() data: CreateMuestreoDto) {
    console.log('📥 Dato recibido vía MQTT:', data);
    return await this.muestreosService.crear(data);
  }
}