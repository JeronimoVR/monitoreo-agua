import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsuariosModule } from '../users/usuarios.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenRecuperacion } from './entities/token-recuperacion.entity';
import { MailModule } from '../common/mail/mail.module';

/**
 * Módulo de Autenticación.
 * 
 * Este módulo agrupa y provee todos los componentes (Controladores y Servicios) 
 * relacionados con la seguridad y acceso: Inicio de sesión (Login con JWT) y 
 * flujos de recuperación de contraseñas.
 */
@Module({
  imports: [
    UsuariosModule,
    PassportModule,
    TypeOrmModule.forFeature([TokenRecuperacion]),
    MailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule, MailModule, UsuariosModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || process.env.JWT_SECRET,
        signOptions: { expiresIn: '120h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [PassportModule, JwtModule, JwtStrategy, AuthService],
})
export class AuthModule { }