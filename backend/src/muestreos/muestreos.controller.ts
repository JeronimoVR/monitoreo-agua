import { Controller, Query, Res, Post, Body, Get, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MuestreosService } from './muestreos.service';
import { CreateMuestreoDto } from './dto/create-muestreo.dto';
import express from 'express';

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
   * Maneja los datos de muestreo entrantes a través del protocolo MQTT provenientes de los sensores IoT.
   * @param data Datos del muestreo recibidos por MQTT
   * @returns El muestreo creado
   */
  @MessagePattern('sensores/muestreos')
  async handleMuestreoMqtt(@Payload() data: CreateMuestreoDto) {
    console.log('📥 Dato recibido vía MQTT:', data);
    return await this.muestreosService.crear(data);
  }

  @Get('all')
  async obtenerMuestreos() {
    return await this.muestreosService.findAll();
  }

  @Get()
  async findAll(
    @Query('estacionId') estacionId: string,
    @Query('parametro') parametro: string,
    @Query('fechaInicio') fechaInicio: string,
    @Query('fechaFin') fechaFin: string,
  ) {
    return this.muestreosService.getFilteredMuestreos({
      estacionId,
      parametro,
      fechaInicio,
      fechaFin,
    });
  }

  // GET /api/muestreos/export
  @Get('export')
  async exportData(
    @Query() filters: any,
    @Res() res: express.Response,
  ) {
    const buffer = await this.muestreosService.generateCsvBuffer(filters);

    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="reporte-muestreo-${Date.now()}.csv"`,
    });

    return res.send(buffer);
  }

  @Get('historial/:idEstacion')
  async getHistorial(@Param('idEstacion', ParseIntPipe) idEstacion: number) {
    return this.muestreosService.findAllHistory(idEstacion);
  }
}