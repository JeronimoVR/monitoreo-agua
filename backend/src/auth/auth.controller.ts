import { Controller, Post, Body, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';

/**
 * Controlador de Autenticación.
 * 
 * Expone los endpoints HTTP para gestionar inicio de sesión (login),
 * solicitud de recuperación de contraseñas y restablecimiento de las mismas.
 */
@ApiTags('Auth')
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Endpoint para iniciar sesión en la aplicación.
   * Valida las credenciales aportadas y genera un token JWT.
   * 
   * @param body Objeto JSON con `correo` y `password`.
   * @returns Un JWT token válido y la info básica del perfil.
   * @throws {UnauthorizedException} Si las credenciales no son válidas.
   */
  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión', description: 'Valida las credenciales y devuelve un JWT Access Token junto con el perfil básico del usuario.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        correo: { type: 'string', example: 'admin@tesis.com', description: 'Correo electrónico registrado del usuario.' },
        password: { type: 'string', example: 'password123', description: 'Contraseña en texto claro.' }
      },
      required: ['correo', 'password']
    }
  })
  @ApiResponse({ status: 201, description: 'Login exitoso', schema: { example: { access_token: 'eyJhbGciOiJIUzI...', user: { id: 1, nombre: 'Admin', rol: 'ADMIN' } } } })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  async login(@Body() body: any) {
    const user = await this.authService.validateUser(body.correo, body.password);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    return this.authService.login(user);
  }

  /**
   * Endpoint para solicitar la recuperación de contraseña.
   * Recibe un correo y le genera un token hexadecimal único guardado en DB.
   * 
   * @param correo El correo electrónico del usuario.
   * @returns El token de recuperación.
   */
  @Post('recuperar-password')
  @ApiOperation({ summary: 'Solicitar recuperación de contraseña', description: 'Genera un token de un solo uso que se enviará por correo electrónico para restablecer la contraseña.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        correo: { type: 'string', example: 'admin@tesis.com', description: 'Correo electrónico asociado a la cuenta a recuperar.' }
      },
      required: ['correo']
    }
  })
  @ApiResponse({ status: 201, description: 'Proceso iniciado correctamente (se haya o no encontrado el correo por seguridad).' })
  async recuperarPassword(@Body('correo') correo: string) {
    return this.authService.generarTokenRecuperacion(correo);
  }

  /**
   * Endpoint para restablecer la contraseña usando un token previamente generado.
   * 
   * @param body Objeto JSON que debe incluir `token` y `nuevaPassword`.
   * @returns Mensaje de confirmación en caso de éxito.
   */
  @Post('restablecer-password')
  @ApiOperation({ summary: 'Restablecer contraseña', description: 'Permite actualizar la contraseña de un usuario proporcionando un token válido generado previamente.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string', example: 'a1b2c3d4e5f6g7h8i9j0', description: 'El token hexadecimal enviado al correo.' },
        nuevaPassword: { type: 'string', example: 'NuevaClaveSegura2026', description: 'La nueva contraseña deseada.' }
      },
      required: ['token', 'nuevaPassword']
    }
  })
  @ApiResponse({ status: 201, description: 'Contraseña actualizada con éxito', schema: { example: { message: 'Contraseña actualizada con éxito' } } })
  @ApiResponse({ status: 401, description: 'El token es inválido o ha expirado' })
  async restablecerPassword(@Body() body: any) {
    return this.authService.restablecerPassword(body.token, body.nuevaPassword);
  }
}