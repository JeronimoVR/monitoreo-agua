import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ConfigAlerta } from './entities/config-alerta.entity';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(ConfigAlerta)
    private configRepo: Repository<ConfigAlerta>,
  ) {}

  async crear(createUsuarioDto: CreateUsuarioDto) {
    const { password, correo, ...datosUsuario } = createUsuarioDto;

    // Verificar si el correo ya existe
    const existe = await this.usuarioRepo.findOne({ where: { correo } });
    if (existe) throw new ConflictException('El correo ya está registrado');

    // Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const nuevoUsuario = this.usuarioRepo.create({
      ...datosUsuario,
      correo,
      passwordHash,
    });

    return await this.usuarioRepo.save(nuevoUsuario);
  }

  async buscarPorCorreo(correo: string) {
    return await this.usuarioRepo.findOne({ 
      where: { correo },
      select: ['id', 'nombre', 'correo', 'passwordHash', 'rol'] // Incluimos el hash para Auth
    });
  }

  async findAll() {
    return await this.usuarioRepo.find();
  }

  async actualizarPerfil(id: number, updateDto: UpdateUsuarioDto) {
    const usuario = await this.usuarioRepo.findOneBy({ id });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    if (updateDto.password) {
      const salt = await bcrypt.genSalt(10);
      usuario.passwordHash = await bcrypt.hash(updateDto.password, salt);
    }

    if (updateDto.nombre) usuario.nombre = updateDto.nombre;

    return await this.usuarioRepo.save(usuario);
  }

  // Editar configuración de alertas
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