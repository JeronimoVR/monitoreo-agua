import { Controller, Get, Post, Body, Patch, Param, Delete, Put, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post('registro')
  crear(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.crear(createUsuarioDto);
  }

  @Get(':id')
  obtenerUno(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.buscarPorId(id);
  }

  @Patch(':id')
  actualizar(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateUsuarioDto: UpdateUsuarioDto
  ) {
    return this.usuariosService.actualizar(id, updateUsuarioDto);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.eliminar(id);
  }

  // Ejemplo de ruta de alertas usando el ID del usuario autenticado
  // @UseGuards(JwtAuthGuard)
  @Put('config-alertas/:estacionId')
  actualizarAlertas(
    @Request() req,
    @Param('estacionId', ParseIntPipe) estacionId: number,
    @Body('recibeAlerta') recibeAlerta: boolean,
  ) {
    // El ID se saca del token JWT para mayor seguridad
    return this.usuariosService.actualizarConfigAlerta(req.user.id, estacionId, recibeAlerta);
  }
}