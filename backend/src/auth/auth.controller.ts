import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

/**
 * Controlador de Autenticación.
 * 
 * Expone los endpoints HTTP para gestionar inicio de sesión (login),
 * solicitud de recuperación de contraseñas y restablecimiento de las mismas.
 */
@Controller('auth')
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
  async restablecerPassword(@Body() body: any) {
    return this.authService.restablecerPassword(body.token, body.nuevaPassword);
  }
}