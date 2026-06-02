import { Injectable, UnauthorizedException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { UsuariosService } from '../users/usuarios.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { TokenRecuperacion } from './entities/token-recuperacion.entity';
import { MailService } from '../common/mail/mail.service';

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
    private readonly mailService: MailService,
    private jwtService: JwtService
  ) { }

  /**
   * Valida si existe un usuario con el correo solicitado y comprueba que 
   * la contraseña envíada (texto claro) concuerde con el Hash (`bcrypt`) guardado en base de datos.
   * 
   * @param correo El correo electrónico registrado.
   * @param pass La contraseña sin encriptar.
   * @returns Datos del usuario si hay coincidencias, u objeto `null` en caso de error.
   */
  async validateUser(correo: string, pass: string): Promise<any> {
    console.log(`[Login] Intentando validar usuario con correo: ${correo}`);
    const user = await this.usuariosService.buscarPorCorreoConPassword(correo);

    if (!user) {
      console.log(`[Login] Usuario no encontrado para el correo: ${correo}`);
      throw new UnauthorizedException('Credenciales inválidas o el usuario no existe');
    }

    console.log(`[Login] Usuario encontrado. ID: ${user.id}`);
    console.log(`[Login] Hash en base de datos: "${user.passwordHash}"`);
    console.log(`[Login] Contraseña proporcionada en texto plano (longitud): ${pass ? pass.length : 0}`);

    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    console.log(`[Login] ¿Coincide la contraseña?: ${isMatch}`);

    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas o el usuario no existe');
    }
    const { passwordHash, ...result } = user;
    return result;
  }

  /**
   * Forma y firma el JWT final del inicio de sesión (Access Token) que usará
   * el cliente en las cabeceras `Authorization` de llamadas subsecuentes.
   * 
   * @param user El usuario resultante del método `validateUser`.
   * @returns El Bearer Token configurado basado en las opciones del servidor.
   */
  async login(user: any) {
    const payload = { sub: user.id, email: user.correo, rol: user.rol };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nombre: user.nombre,
        rol: user.rol
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
  async generarTokenRecuperacion(correo: string) {
    const usuario = await this.usuariosService.buscarPorCorreoParaAuth(correo);
    if (!usuario) {
      // Devolver éxito genérico para prevenir enumeración
      return { message: 'Si el correo está registrado, recibirá un enlace de recuperación pronto' };
    }

    const token = randomBytes(32).toString('hex');
    const fechaExpiracion = new Date();
    fechaExpiracion.setHours(fechaExpiracion.getHours() + 1);
    const nuevoToken = this.tokenRepo.create({
      token,
      fechaExpiracion,
      usuario,
      usado: false,
    });
    await this.tokenRepo.save(nuevoToken);

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    try {
      await this.mailService.enviarCorreo(
        usuario.correo,
        'Recuperación de Contraseña - Sistema IoT',
        'recuperación',
        {
          nombre: usuario.nombre,
          url: resetLink
        }
      );
    } catch (error) {
      console.error('Error al enviar correo:', error);
      throw new InternalServerErrorException('No se pudo enviar el correo de recuperación');
    }

    return { message: 'Si el correo está registrado, recibirá un enlace de recuperación pronto' };
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
  async restablecerPassword(token: string, nuevaPassword: string) {
    // Buscar el token con su relación de usuario
    const registro = await this.tokenRepo.findOne({
      where: { token },
      relations: ['usuario'],
    });

    if (!registro) {
      throw new UnauthorizedException('El token es inválido o no existe');
    }

    if (registro.usado) {
      throw new UnauthorizedException('Este token ya ha sido utilizado. Por favor, solicita uno nuevo.');
    }

    if (registro.fechaExpiracion < new Date()) {
      throw new UnauthorizedException('El token ha expirado. Por favor, solicita uno nuevo.');
    }

    // Actualizar la contraseña del usuario
    await this.usuariosService.actualizarPassword(registro.usuario.id, nuevaPassword);

    // Marcar el token como usado (Quemar el token)
    registro.usado = true;
    await this.tokenRepo.save(registro);

    return { message: 'Contraseña actualizada con éxito' };
  }

  

}