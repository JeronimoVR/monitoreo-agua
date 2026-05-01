import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { Usuario } from './entities/usuario.entity';
import { ConfigAlerta } from './entities/config-alerta.entity';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, ConfigAlerta]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService, PassportModule],
})
export class UsuariosModule {}