import { Controller, Get, Post, Body, Patch, Param, Delete, Put, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
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
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) { }

  /**
   * Crea un nuevo usuario en el sistema.
   * @param createUsuarioDto Datos del usuario a crear.
   * @returns El usuario creado.
   */
  @Post('registro')
  crear(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.crear(createUsuarioDto);
  }

  /**
   * Obtiene un usuario específico por su ID.
   * @param id Identificador único del usuario.
   * @returns El usuario encontrado.
   */
  @Get(':id')
  @UseGuards(AuthGuard('jwt'), SelfOrAdminGuard)
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
  @UseGuards(AuthGuard('jwt'), SelfOrAdminGuard)
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
  @UseGuards(AuthGuard('jwt'), SelfOrAdminGuard)
  softDelete(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.softDelete(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.eliminar(id);
  }

  /**
   * Actualiza la configuración de alertas de un usuario para una estación específica.
   * El ID del usuario se obtiene del token JWT.
   * @param req Petición HTTP que contiene el usuario autenticado.
   * @param estacionId Identificador de la estación.
   * @param recibeAlerta Indica si el usuario desea recibir alertas.
   * @returns La configuración de alerta actualizada.
   */
  @UseGuards(AuthGuard('jwt'), SelfOrAdminGuard)
  @Put('config-alertas/:estacionId')
  actualizarAlertas(
    @Request() req,
    @Param('estacionId', ParseIntPipe) estacionId: number,
    @Body('recibeAlerta') recibeAlerta: boolean,
  ) {
    return this.usuariosService.actualizarConfigAlerta(req.user.id, estacionId, recibeAlerta);
  }

  /**
   * Obtiene la configuración de alertas de un usuario para una estación específica.
   * El ID del usuario se obtiene del token JWT.
   * @param req Petición HTTP que contiene el usuario autenticado.
   * @param estacionId Identificador de la estación.
   * @returns La configuración de alerta actualizada.
   */
  @Get('config-alertas/:estacionId')
  @UseGuards(AuthGuard('jwt'), SelfOrAdminGuard)
  async getConfig(@Param('estacionId') estacionId: string) {
    return this.usuariosService.getAlertConfig(estacionId);
  }
}