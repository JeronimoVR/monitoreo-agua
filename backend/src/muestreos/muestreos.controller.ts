import { Controller, Query, Res, Post, Body, Get, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MuestreosService } from './muestreos.service';
import { CreateMuestreoDto } from './dto/create-muestreo.dto';
import express from 'express';

/**
 * Controlador para la gestión de muestreos y medidas de calidad de agua.
 */
@ApiTags('Muestreos')
@ApiBearerAuth()
@Controller('muestreos')
export class MuestreosController {
  constructor(private readonly muestreosService: MuestreosService) { }

  /**
   * Crea un nuevo registro de muestreo a través de la API REST.
   * @param createMuestreoDto Datos del muestreo a crear
   * @returns El muestreo creado
   */
  @Post()
  @ApiOperation({ summary: 'Crear muestreo manualmente', description: 'Permite registrar un muestreo de agua de forma manual vía REST.' })
  @ApiResponse({ status: 201, description: 'Muestreo creado exitosamente.' })
  async crearMuestreoViaRest(@Body() createMuestreoDto: CreateMuestreoDto) {
    return await this.muestreosService.crear(createMuestreoDto);
  }

  // Endpoint @Get() duplicado eliminado para evitar conflictos con el de filtros.

  /**
   * Obtiene un muestreo en específico por su identificador.
   * @param id Identificador único del muestreo
   * @returns Muestreo encontrado
   */
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un muestreo por ID' })
  @ApiParam({ name: 'id', description: 'ID del muestreo', example: 1 })
  @ApiResponse({ status: 200, description: 'Detalle del muestreo.' })
  @ApiResponse({ status: 404, description: 'Muestreo no encontrado.' })
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
  @ApiOperation({ summary: 'Obtener todos los muestreos', description: 'Devuelve todos los registros sin paginación.' })
  async obtenerMuestreos() {
    return await this.muestreosService.findAll();
  }

  @Get('filtro/busqueda')
  @ApiOperation({ summary: 'Obtener muestreos filtrados', description: 'Filtra los muestreos por estación, parámetro y fechas.' })
  @ApiQuery({ name: 'estacionId', required: true, description: 'ID de la estación', example: '1' })
  @ApiQuery({ name: 'parametro', required: false, description: 'ID del parámetro', example: '2' })
  @ApiQuery({ name: 'fechaInicio', required: false, description: 'Fecha de inicio (ISO)', example: '2026-01-01' })
  @ApiQuery({ name: 'fechaFin', required: false, description: 'Fecha de fin (ISO)', example: '2026-12-31' })
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
  @ApiOperation({ summary: 'Exportar datos a CSV', description: 'Exporta los datos filtrados a un archivo CSV descargable.' })
  @ApiQuery({ name: 'estacionId', required: true, description: 'ID de la estación' })
  @ApiResponse({ status: 200, description: 'Archivo CSV generado.' })
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
  @ApiOperation({ summary: 'Obtener historial reciente', description: 'Obtiene los últimos 20 muestreos de una estación dada.' })
  @ApiParam({ name: 'idEstacion', description: 'ID de la estación', example: 1 })
  @ApiResponse({ status: 200, description: 'Lista de los últimos 20 muestreos.' })
  async getHistorial(@Param('idEstacion', ParseIntPipe) idEstacion: number) {
    return this.muestreosService.findAllHistory(idEstacion);
  }
}