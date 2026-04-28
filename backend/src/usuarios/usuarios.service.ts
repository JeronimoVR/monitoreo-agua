import { Injectable, ConflictException, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { ConfigAlerta } from './entities/config-alerta.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import * as bcrypt from 'bcrypt';

/**
 * Servicio encargado de la lógica de negocio para la gestión de usuarios
 * y sus configuraciones de alertas.
 */
@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
    @InjectRepository(ConfigAlerta)
    private readonly configRepository: Repository<ConfigAlerta>,
  ) { }

  validateEmail(email: string): boolean {
    const emailRegex = /^(([^<>()[\]\\.,;:\s@”]+(\.[^<>()[\]\\.,;:\s@”]+)*)|(“.+”))@((\[[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}\.[0–9]{1,3}])|(([a-zA-Z\-0–9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(email);
  }


  /**
   * Crea un nuevo usuario validando que el correo no exista previamente
   * y cifrando su contraseña.
   * @param dto Objeto con los datos para crear el usuario.
   * @returns El usuario recién creado guardado en base de datos.
   * @throws ConflictException Si el correo ya está registrado.
   */
  async crear(dto: CreateUsuarioDto) {
    const existe = await this.usuariosRepository.findOne({ where: { correo: dto.correo } });
    if (existe) throw new ConflictException('El correo ya está registrado');
    
    if (dto.correo && !this.validateEmail(dto.correo)) {
      throw new BadRequestException('El formato del correo es inválido');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    try {
      const nuevo = this.usuariosRepository.create({ ...dto, passwordHash });
      const usuarioGuardado = await this.usuariosRepository.save(nuevo);

      const nuevaConfig = this.configRepository.create({
        usuario: usuarioGuardado,
        recibeAlerta: true,
      });
      await this.configRepository.save(nuevaConfig);

      return usuarioGuardado;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error inesperado al crear el usuario. Por favor, inténtelo de nuevo más tarde.'
      );
    }
  }

  /**
   * Busca un usuario por su identificador único.
   * @param id El ID del usuario a buscar.
   * @returns El usuario encontrado.
   * @throws NotFoundException Si no existe un usuario con ese ID.
   */
  async buscarPorId(id: number) {
    const usuario = await this.usuariosRepository.findOneBy({ id });
    if (!usuario) throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    return usuario;
  }

  /**
   * Busca un usuario por su correo electrónico incluyendo su contraseña cifrada.
   * Este método es utilizado principalmente por el módulo de autenticación (AuthModule).
   * @param correo El correo del usuario a buscar.
   * @returns El usuario con su hash de contraseña, si se encuentra.
   */
  // Este lo usará tu AuthModule para el login
  async buscarPorCorreoConPassword(correo: string) {
    const usuario = await this.usuariosRepository.createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.correo = :correo', { correo })
      .getOne();

    return usuario || null;
  }

  /**
   * Actualiza la información de un usuario existente.
   * Si se proporciona una nueva contraseña, esta será cifrada antes de guardarse.
   * @param id El ID del usuario a actualizar.
   * @param dto Los datos a actualizar.
   * @returns El usuario actualizado.
   */
  async actualizar(id: number, dto: UpdateUsuarioDto) {
    const usuario = await this.buscarPorId(id);

    if (dto.password) {
      const salt = await bcrypt.genSalt(10);
      usuario.passwordHash = await bcrypt.hash(dto.password, salt);
    }

    if (dto.nombre) usuario.nombre = dto.nombre;
    try {
      return await this.usuariosRepository.save(usuario);
    } catch (error) {
      throw new InternalServerErrorException(`Error al actualizar el usuario con ID ${id}`);
    }
  }

  /**
   * Realiza un borrado lógico de un usuario (soft delete).
   * @param id El ID del usuario a eliminar.
   * @returns El usuario eliminado o el resultado de la operación.
   */
  async eliminar(id: number) {
    const usuario = await this.buscarPorId(id);
    try {
      return await this.usuariosRepository.softRemove(usuario); // Borrado lógico
    } catch (error) {
      throw new InternalServerErrorException(`Error al eliminar el usuario con ID ${id}`);
    }
  }

  /**
   * Crea o actualiza la configuración de alertas de un usuario para una estación.
   * @param usuarioId El ID del usuario.
   * @param estacionId El ID de la estación.
   * @param recibe Booleano que indica si debe recibir alertas.
   * @returns La configuración de alerta insertada o actualizada.
   */
  async actualizarConfigAlerta(usuarioId: number, estacionId: number, recibe: boolean) {
    try {
      let config = await this.configRepository.findOne({
        where: { usuario: { id: usuarioId }, estacion: { id: estacionId } }
      });

      if (!config) {
        config = this.configRepository.create({
          usuario: { id: usuarioId },
          estacion: { id: estacionId },
          recibeAlerta: recibe
        });
      } else {
        config.recibeAlerta = recibe;
      }
      return await this.configRepository.save(config);
    } catch (error) {
      throw new BadRequestException('Error al actualizar la configuración de alertas. Verifique que la estación exista.');
    }
  }

  async actualizarPassword(id: number, nuevaPassword: string) {
    const usuario = await this.buscarPorId(id);
    const salt = await bcrypt.genSalt(10);
    usuario.passwordHash = await bcrypt.hash(nuevaPassword, salt);
    return await this.usuariosRepository.save(usuario);
  }

  async buscarPorCorreoParaAuth(correo: string) {
    return await this.usuariosRepository.findOne({ where: { correo } });
  }

  async getAlertConfig(estacionId: string) {
    return await this.configRepository.find({ where: { estacion: { id: parseInt(estacionId) } }, relations: ['usuario'] });
  }
}