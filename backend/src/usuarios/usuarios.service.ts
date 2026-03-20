import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { ConfigAlerta } from './entities/config-alerta.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(ConfigAlerta)
    private readonly configRepo: Repository<ConfigAlerta>,
  ) {}

  async crear(dto: CreateUsuarioDto) {
    const existe = await this.usuarioRepo.findOne({ where: { correo: dto.correo } });
    if (existe) throw new ConflictException('El correo ya está registrado');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const nuevo = this.usuarioRepo.create({ ...dto, passwordHash });
    return await this.usuarioRepo.save(nuevo);
  }

  async buscarPorId(id: number) {
    const usuario = await this.usuarioRepo.findOneBy({ id });
    if (!usuario) throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    return usuario;
  }

  // Este lo usará tu AuthModule para el login
  async buscarPorCorreoConPassword(correo: string) {
    return await this.usuarioRepo.createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.correo = :correo', { correo })
      .getOne();
  }

  async actualizar(id: number, dto: UpdateUsuarioDto) {
    const usuario = await this.buscarPorId(id);

    if (dto.password) {
      const salt = await bcrypt.genSalt(10);
      usuario.passwordHash = await bcrypt.hash(dto.password, salt);
    }
    
    if (dto.nombre) usuario.nombre = dto.nombre;
    return await this.usuarioRepo.save(usuario);
  }

  async eliminar(id: number) {
    const usuario = await this.buscarPorId(id);
    return await this.usuarioRepo.softRemove(usuario); // Borrado lógico
  }

  async actualizarConfigAlerta(usuarioId: number, estacionId: number, recibe: boolean) {
    let config = await this.configRepo.findOne({
      where: { usuario: { id: usuarioId }, estacion: { id: estacionId } }
    });

    if (!config) {
      config = this.configRepo.create({
        usuario: { id: usuarioId },
        estacion: { id: estacionId },
        recibeAlerta: recibe
      });
    } else {
      config.recibeAlerta = recibe;
    }
    return await this.configRepo.save(config);
  }
}