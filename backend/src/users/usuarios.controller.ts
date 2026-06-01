import { Controller, Get, Post, Body, Patch, Param, Delete, Put, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { AuthGuard } from '@nestjs/passport';
import { SelfOrAdminGuard } from 'src/auth/guards/selfAdmin.guards';
import { RolesGuard } from 'src/auth/guards/roles.guards';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { UserRole } from './entities/usuario.entity';

/**
 * Controlador que maneja las rutas HTTP para la gestión de usuarios.
 */
@ApiTags('Usuarios')
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) { }

  /**
   * Crea un nuevo usuario en el sistema.
   * @param createUsuarioDto Datos del usuario a crear.
   * @returns El usuario creado.
   */
  @Post('registro')
  @ApiOperation({ summary: 'Registrar un nuevo usuario', description: 'Crea una cuenta de usuario con rol estándar.' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o el correo ya existe.' })
  crear(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.crear(createUsuarioDto);
  }

  /**
   * Obtiene un usuario específico por su ID.
   * @param id Identificador único del usuario.
   * @returns El usuario encontrado.
   */
  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), SelfOrAdminGuard)
  @ApiOperation({ summary: 'Obtener perfil de usuario', description: 'Retorna la información de un usuario. Requiere ser el propio usuario o administrador.' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Datos del usuario retornados con éxito.' })
  @ApiResponse({ status: 403, description: 'No tiene permisos para ver este perfil.' })
  findOneById(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.buscarPorId(id);
  }

  /**
   * Actualiza los datos de un usuario existente.
   * @param id Identificador del usuario a actualizar.
   * @param updateUsuarioDto Datos a actualizar.
   * @returns El usuario actualizado.
   */
  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), SelfOrAdminGuard)
  @ApiOperation({ summary: 'Actualizar usuario', description: 'Actualiza nombre o contraseña. Requiere ser el propio usuario o administrador.' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario actualizado exitosamente.' })
  actualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUsuarioDto: UpdateUsuarioDto
  ) {
    return this.usuariosService.actualizar(id, updateUsuarioDto);
  }

  /**
   * Realiza un borrado lógico de un usuario.
   * @param id Identificador del usuario a eliminar.
   * @returns El resultado de la operación.
   */
  @Patch(':id/eliminar')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), SelfOrAdminGuard)
  @ApiOperation({ summary: 'Desactivar usuario', description: 'Realiza un borrado lógico (soft delete). Requiere ser el propio usuario o administrador.' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario desactivado correctamente.' })
  softDelete(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.softDelete(id);
  }

  /**
   * Elimina un usuario definitivamente.
   */
  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar usuario (Admin)', description: 'Elimina físicamente un usuario de la base de datos. Solo administradores.' })
  @ApiParam({ name: 'id', description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado permanentemente.' })
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.eliminar(id);
  }

  /**
   * Actualiza la configuración de alertas de un usuario para una estación específica.
   */
  @Put('config-alertas/:estacionId')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Configurar alertas de estación', description: 'Activa o desactiva las notificaciones por correo para una estación específica.' })
  @ApiParam({ name: 'estacionId', description: 'ID de la estación' })
  @ApiBody({ schema: { properties: { recibeAlerta: { type: 'boolean', example: true } } } })
  @ApiResponse({ status: 200, description: 'Configuración de alerta actualizada.' })
  actualizarAlertas(
    @Request() req,
    @Param('estacionId', ParseIntPipe) estacionId: number,
    @Body('recibeAlerta') recibeAlerta: boolean,
  ) {
    return this.usuariosService.actualizarConfigAlerta(req.user.id, estacionId, recibeAlerta);
  }

  /**
   * Obtiene la configuración de alertas de un usuario para una estación específica.
   */
  @Get('config-alertas/:estacionId')
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Consultar configuración de alerta', description: 'Obtiene si el usuario tiene activas las alertas para una estación.' })
  @ApiParam({ name: 'estacionId', description: 'ID de la estación' })
  @ApiResponse({ status: 200, description: 'Estado de la configuración de alerta.' })
  async getConfig(@Request() req, @Param('estacionId', ParseIntPipe) estacionId: number) {
    return this.usuariosService.getAlertConfigForUser(req.user.id, estacionId);
  }
}
