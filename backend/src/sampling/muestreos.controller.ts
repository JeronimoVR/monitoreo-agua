import { Controller, Query, Res, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { MuestreosService } from './muestreos.service';
import express from 'express';

@ApiTags('Muestreos')
@Controller('muestreos')
export class MuestreosController {
  constructor(private readonly muestreosService: MuestreosService) { }

  @Get('filtro/busqueda')
  @ApiOperation({ summary: 'Consultar datos con filtros (Dashboard)', description: 'Retorna una lista de muestreos filtrados por estación, parámetro y rango de fechas.' })
  @ApiQuery({ name: 'estacionId', required: false, description: 'ID de la estación a filtrar' })
  @ApiQuery({ name: 'parametro', required: false, description: 'Nombre o ID del parámetro' })
  @ApiQuery({ name: 'fechaInicio', required: false, description: 'Fecha de inicio (ej. 2024-01-01)' })
  @ApiQuery({ name: 'fechaFin', required: false, description: 'Fecha de fin (ej. 2024-12-31)' })
  @ApiResponse({ status: 200, description: 'Lista de muestreos que coinciden con los filtros.' })
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

  @Get('export')
  @ApiOperation({ summary: 'Generar reporte CSV técnico', description: 'Exporta los datos de muestreos en formato CSV en base a los filtros proporcionados.' })
  @ApiQuery({ name: 'estacionId', required: false, description: 'ID de la estación a filtrar para el reporte' })
  @ApiQuery({ name: 'parametro', required: false, description: 'Nombre o ID del parámetro' })
  @ApiQuery({ name: 'fechaInicio', required: false, description: 'Fecha de inicio del reporte' })
  @ApiQuery({ name: 'fechaFin', required: false, description: 'Fecha de fin del reporte' })
  @ApiResponse({ status: 200, description: 'Archivo CSV generado exitosamente.' })
  async exportData(@Query() filters: any, @Res() res: express.Response) {
    const buffer = await this.muestreosService.generateCsvBuffer(filters);
    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="muestreo-aqualab-${Date.now()}.csv"`,
    });
    return res.send(buffer);
  }

  @Get('historial/:idEstacion')
  @ApiOperation({ summary: 'Historial reciente (Gráficos)', description: 'Obtiene los últimos 20 muestreos de una estación específica para su visualización.' })
  @ApiParam({ name: 'idEstacion', description: 'ID de la estación', type: Number })
  @ApiResponse({ status: 200, description: 'Historial reciente retornado exitosamente.' })
  @ApiResponse({ status: 404, description: 'Estación no encontrada.' })
  async getHistorial(@Param('idEstacion', ParseIntPipe) idEstacion: number) {
    return this.muestreosService.findAllHistory(idEstacion);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalle de un muestreo', description: 'Obtiene toda la información detallada de un registro de muestreo específico.' })
  @ApiParam({ name: 'id', description: 'ID del muestreo', type: Number })
  @ApiResponse({ status: 200, description: 'Detalle del muestreo retornado con éxito.' })
  @ApiResponse({ status: 404, description: 'Muestreo no encontrado.' })
  async obtenerUno(@Param('id', ParseIntPipe) id: number) {
    return await this.muestreosService.findOne(id);
  }
}