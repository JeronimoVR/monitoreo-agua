import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { Usuario } from './entities/usuario.entity';
import { ConfigAlerta } from './entities/config-alerta.entity'; // Nueva entidad

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, ConfigAlerta]) // Agregamos ConfigAlerta
  ],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService],
})
export class UsuariosModule {}