import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MuestreosService } from './muestreos.service';
import { CreateMuestreoDto } from './dto/create-muestreo.dto';

@Controller('muestreos')
export class MuestreosController {
  constructor(private readonly muestreosService: MuestreosService) {}

  // --- ENTRADA PARA EL FRONTEND (API REST) ---
  
  @Post()
  async crearMuestreoViaRest(@Body() createMuestreoDto: CreateMuestreoDto) {
    return await this.muestreosService.crear(createMuestreoDto);
  }

  @Get()
  async obtenerTodos() {
    return await this.muestreosService.findAll();
  }

  @Get(':id')
  async obtenerUno(@Param('id') id: number) {
    return await this.muestreosService.findOne(id);
  }

  // --- ENTRADA PARA LOS SENSORES IOT (MQTT) ---

  // Escucha el tópico que definas en el ESP32 (ej: "estaciones/1/datos")
  @MessagePattern('sensores/muestreos')
  async handleMuestreoMqtt(@Payload() data: CreateMuestreoDto) {
    console.log('📥 Dato recibido vía MQTT:', data);
    return await this.muestreosService.crear(data);
  }
}