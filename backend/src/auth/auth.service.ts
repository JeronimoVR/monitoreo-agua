import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { UsuariosService } from '../usuarios/usuarios.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { TokenRecuperacion } from './entities/token-recuperacion.entity';

/**
 * Servicio de Autenticación.
 * 
 * Maneja lógicas de negocio críticas como la revisión de credenciales en base 
 * de datos, firmas criptográficas para JSON Web Tokens y control del 
 * flujo de reseteo de contraseñas (generación/quema de tokens).
 */
@Injectable()
export class AuthService {
  constructor(
    private usuariosService: UsuariosService,
    @InjectRepository(TokenRecuperacion)
    private tokenRepo: Repository<TokenRecuperacion>,
    private jwtService: JwtService
  ) {}

  /**
   * Valida si existe un usuario con el correo solicitado y comprueba que 
   * la contraseña envíada (texto claro) concuerde con el Hash (`bcrypt`) guardado en base de datos.
   * 
   * @param correo El correo electrónico registrado.
   * @param pass La contraseña sin encriptar.
   * @returns Datos del usuario si hay coincidencias, u objeto `null` en caso de error.
   */
  // 1. Validar que el usuario existe y la contraseña es correcta
  async validateUser(correo: string, pass: string): Promise<any> {
    const usuario = await this.usuariosService.buscarPorCorreoConPassword(correo);
    
    if (usuario && (await bcrypt.compare(pass, usuario.passwordHash))) {
      const { passwordHash, ...result } = usuario;
      return result; // Retornamos el usuario sin el hash
    }
    return null;
  }

  /**
   * Forma y firma el JWT final del inicio de sesión (Access Token) que usará
   * el cliente en las cabeceras `Authorization` de llamadas subsecuentes.
   * 
   * @param user El usuario resultante del método `validateUser`.
   * @returns El Bearer Token configurado basado en las opciones del servidor.
   */
  // 2. Generar el JWT
  async login(user: any) {
    const payload = { sub: user.id, email: user.correo, rol: user.rol };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nombre: user.nombre
      }
    };
  }

  /**
   * Inicia el proceso de recuperación de contraseña creando un token
   * con expiración horaria e insertándolo de forma segura en la base de datos con TypeORM.
   * 
   * @param correo Correo electrónico al cual atar la recuperación.
   * @throws {NotFoundException} Si no existe cuenta bajo el correo proveído.
   * @returns Objeto de información y el `token` creado.
   */
  // Paso 4, 5 y 6 del Caso de Uso
  async generarTokenRecuperacion(correo: string) {
    const usuario = await this.usuariosService.buscarPorCorreoParaAuth(correo);
    if (!usuario) throw new NotFoundException('No hay una cuenta asociada a ese email');

    const token = randomBytes(32).toString('hex');
    const fechaExpiracion = new Date();
    fechaExpiracion.setHours(fechaExpiracion.getHours() + 1); // Expira en 1 hora

    const nuevoToken = this.tokenRepo.create({
      token,
      fechaExpiracion,
      usuario,
      usado: false,
    });

    await this.tokenRepo.save(nuevoToken);
    
    // Por ahora retornamos el token para tus pruebas en Postman
    return { message: 'Token generado', token }; 
  }

  /**
   * Concluye el reinicio de contraseña tras validar que el token emitido
   * en `generarTokenRecuperacion` sea el propuesto y aún se halle vigente, marcándolo
   * como inhabilitado para evitar repeticiones (prevención replay atacks).
   * 
   * @param token Cadena alfanumérica secreta que se generó para resetear la contraseña del correo que pidió el cambio.
   * @param nuevaPassword Nueva contraseña que aplicará el operario al registrarse en el sistema.
   * @throws {UnauthorizedException} Si el token caducó en tiempo, o ya fue reclamado.
   * @returns Objeto `{ message: string }` indicando la correcta renovación de credencial.
   */
  // Paso 9 y 12 del Caso de Uso
  async restablecerPassword(token: string, nuevaPassword: string) {
    const registro = await this.tokenRepo.findOne({
      where: { token, usado: false },
      relations: ['usuario'],
    });

    if (!registro || registro.fechaExpiracion < new Date()) {
      throw new UnauthorizedException('El token es inválido o ha expirado');
    }

    // Actualizamos la contraseña en el servicio de usuarios
    await this.usuariosService.actualizarPassword(registro.usuario.id, nuevaPassword);

    // Marcamos el token como usado para que no se repita (Seguridad)
    registro.usado = true;
    await this.tokenRepo.save(registro);

    return { message: 'Contraseña actualizada con éxito' };
  }
}