import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { EstacionesService } from './estaciones.service';
import { CreateEstacionDto } from './dto/create-estacion.dto';
import { UpdateEstacionDto } from './dto/update-estacion.dto';
import { Roles } from '../auth/decorators/roles.decorators';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/auth/guards/roles.guards';
import { UserRole } from 'src/users/entities/usuario.entity';

@ApiTags('estaciones')
@Controller('estaciones')
export class EstacionesController {
    constructor(private readonly estacionesService: EstacionesService) { }

    @Post()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Crear una nueva estación' })
    @ApiResponse({ status: 201, description: 'La estación ha sido creada exitosamente.' })
    @ApiResponse({ status: 401, description: 'No autorizado.' })
    @ApiResponse({ status: 403, description: 'Prohibido. Se requiere rol de ADMIN.' })
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    create(@Body() createEstacionDto: CreateEstacionDto) {
        return this.estacionesService.create(createEstacionDto);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todas las estaciones' })
    @ApiResponse({ status: 200, description: 'Lista de todas las estaciones.' })
    findAll() {
        return this.estacionesService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener una estación por ID' })
    @ApiParam({ name: 'id', description: 'ID de la estación' })
    @ApiResponse({ status: 200, description: 'La estación encontrada.' })
    @ApiResponse({ status: 404, description: 'Estación no encontrada.' })
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.estacionesService.findOne(id);
    }

    @Patch(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Actualizar una estación por ID' })
    @ApiParam({ name: 'id', description: 'ID de la estación' })
    @ApiResponse({ status: 200, description: 'La estación ha sido actualizada exitosamente.' })
    @ApiResponse({ status: 401, description: 'No autorizado.' })
    @ApiResponse({ status: 403, description: 'Prohibido. Se requiere rol de ADMIN.' })
    @ApiResponse({ status: 404, description: 'Estación no encontrada.' })
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    update(@Param('id', ParseIntPipe) id: number, @Body() updateEstacionDto: UpdateEstacionDto) {
        return this.estacionesService.update(id, updateEstacionDto);
    }

    @Delete(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Eliminar permanentemente una estación por ID' })
    @ApiParam({ name: 'id', description: 'ID de la estación' })
    @ApiResponse({ status: 200, description: 'La estación ha sido eliminada exitosamente.' })
    @ApiResponse({ status: 401, description: 'No autorizado.' })
    @ApiResponse({ status: 403, description: 'Prohibido. Se requiere rol de ADMIN.' })
    @ApiResponse({ status: 404, description: 'Estación no encontrada.' })
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.estacionesService.remove(id);
    }

    @Patch(':id/eliminar')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Borrado lógico (soft delete) de una estación por ID' })
    @ApiParam({ name: 'id', description: 'ID de la estación' })
    @ApiResponse({ status: 200, description: 'La estación ha sido borrada lógicamente.' })
    @ApiResponse({ status: 401, description: 'No autorizado.' })
    @ApiResponse({ status: 403, description: 'Prohibido. Se requiere rol de ADMIN.' })
    @ApiResponse({ status: 404, description: 'Estación no encontrada.' })
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(UserRole.ADMIN)
    softDelete(@Param('id', ParseIntPipe) id: number) {
        return this.estacionesService.softDelete(id);
    }
}