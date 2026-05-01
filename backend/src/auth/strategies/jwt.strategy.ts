import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuariosService } from '../../users/usuarios.service';
import { ConfigService } from '@nestjs/config';

/**
 * Estrategia de Autenticación JWT utilizando Passport.
 * 
 * Su labor consiste en procesar y validar todo Token JWT que se anexe como un Bearer 
 * Token en los encabezados HTTP antes de dar el "visto bueno" de seguridad
 * en las rutas del servidor.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly configService: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'TU_SEMILLA_SECRETA',
    });
  }

  /**
   * Método interno sobre-escrito ejecutado automáticamente si la verificación
   * criptográfica inicial del JWT tuvo éxito. Procede además a interceptar y buscar que
   * el identificador siga ligado a una cuenta real en la DB.
   * 
   * @param payload Contiene los metadatos desencriptados y confiables (Ej: email, roles y id).
   * @throws {UnauthorizedException} Si el UUID asociado ya no es admisible en base de datos.
   * @returns Objeto inyectado en la API del router internamente como `req.user`.
   */
  async validate(payload: any) {
    const usuario = await this.usuariosService.buscarPorId(payload.sub);

    if (!usuario) {
      throw new UnauthorizedException('Usuario no encontrado o token inválido');
    }

    return {
      id: payload.sub,
      correo: payload.email,
      rol: payload.rol
    };
  }
}