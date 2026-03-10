import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, Put, ParseIntPipe } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  // 1. Registro Público: Cualquier persona puede crear una cuenta
  @Post('registro')
  crear(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.crear(createUsuarioDto);
  }

  // 2. Obtener perfil: Protegido por JWT
  // @UseGuards(JwtAuthGuard) <-- Descomentar cuando configures Auth
  @Get('perfil')
  obtenerPerfil(@Request() req) {
    // req.user viene del JWT una vez validado
    return this.usuariosService.buscarPorCorreo(req.user.email);
  }

  // 3. Editar datos personales (Nombre/Password)
  // El correo no se incluye en el UpdateUsuarioDto para cumplir tu regla
  // @UseGuards(JwtAuthGuard)
  @Patch('actualizar-perfil')
  actualizar(@Request() req, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    const userId = req.user.id; // Obtenemos el ID directamente del token
    return this.usuariosService.actualizarPerfil(userId, updateUsuarioDto);
  }

  // 4. Editar configuraciones de alertas
  // @UseGuards(JwtAuthGuard)
  @Put('config-alertas/:estacionId')
  actualizarAlertas(
    @Request() req,
    @Param('estacionId', ParseIntPipe) estacionId: number,
    @Body('recibeAlerta') recibeAlerta: boolean,
  ) {
    const userId = req.user.id;
    return this.usuariosService.actualizarConfigAlerta(userId, estacionId, recibeAlerta);
  }

  // 5. Lista de usuarios (Solo para admins en el futuro)
  @Get()
  findAll() {
    return this.usuariosService.findAll();
  }
}