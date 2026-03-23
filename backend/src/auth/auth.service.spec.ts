import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsuariosService } from '../usuarios/usuarios.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TokenRecuperacion } from './entities/token-recuperacion.entity';
import { MailService } from '../notificaciones/mail/mail.service';
import { UnauthorizedException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// SOLUCIÓN DEFINITIVA PARA BCRYPT: Mockear el módulo antes del describe
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usuariosService: UsuariosService;
  let tokenRepo: any;
  let mailService: MailService;

  const mockUser = {
    id: 1,
    nombre: 'Jeronimo',
    correo: 'jvelezr@estudiante.uniajc.edu.co',
    passwordHash: '$2b$10$hashedpassword',
    configuraciones: [],
  };

  beforeEach(async () => {
    // SILENCIAR CONSOLE.ERROR: Evita que los tests de fallos esperados ensucien la terminal
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsuariosService,
          useValue: {
            buscarPorCorreoConPassword: jest.fn(),
            buscarPorCorreoParaAuth: jest.fn(),
            actualizarPassword: jest.fn(),
          },
        },
        { provide: MailService, useValue: { enviarCorreo: jest.fn() } },
        { provide: JwtService, useValue: { sign: jest.fn().mockReturnValue('mock_jwt_token') } },
        {
          provide: getRepositoryToken(TokenRecuperacion),
          useValue: { create: jest.fn(), save: jest.fn(), findOne: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usuariosService = module.get<UsuariosService>(UsuariosService);
    tokenRepo = module.get(getRepositoryToken(TokenRecuperacion));
    mailService = module.get<MailService>(MailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser (CU005)', () => {
    it('debería retornar el usuario (sin password) si las credenciales son válidas', async () => {
      jest.spyOn(usuariosService, 'buscarPorCorreoConPassword').mockResolvedValue(mockUser);
      // Usar el mock de bcrypt definido arriba
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(mockUser.correo, 'Admin123');

      expect(result).not.toHaveProperty('passwordHash');
      expect(result.id).toEqual(mockUser.id);
    });

    it('debería lanzar UnauthorizedException si la contraseña no coincide', async () => {
      jest.spyOn(usuariosService, 'buscarPorCorreoConPassword').mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.validateUser(mockUser.correo, 'WrongPass'))
        .rejects.toThrow(UnauthorizedException);
    });

    it('debería lanzar UnauthorizedException si el usuario no existe', async () => {
      jest.spyOn(usuariosService, 'buscarPorCorreoConPassword').mockResolvedValue(null);

      await expect(service.validateUser('otro@correo.com', 'Admin123'))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login (CU005)', () => {
    it('debería generar un access_token y retornar info básica del usuario', async () => {
      const result = await service.login(mockUser);

      expect(result).toHaveProperty('access_token');
      expect(result.user.nombre).toBe('Jeronimo');
    });
  });

  describe('generarTokenRecuperacion (CU006)', () => {
    it('debería crear un token y llamar al servicio de correo', async () => {
      jest.spyOn(usuariosService, 'buscarPorCorreoParaAuth').mockResolvedValue(mockUser);
      tokenRepo.create.mockReturnValue({ token: '123' });
      tokenRepo.save.mockResolvedValue({});
      (mailService.enviarCorreo as jest.Mock).mockResolvedValue(true);

      const result = await service.generarTokenRecuperacion(mockUser.correo);

      expect(result.message).toContain('Se ha enviado un código');
      expect(tokenRepo.save).toHaveBeenCalled();
      expect(mailService.enviarCorreo).toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException si el correo no existe', async () => {
      jest.spyOn(usuariosService, 'buscarPorCorreoParaAuth').mockResolvedValue(null);

      await expect(service.generarTokenRecuperacion('noexiste@test.com'))
        .rejects.toThrow(NotFoundException);
    });

    it('debería lanzar InternalServerErrorException si el envío de correo falla', async () => {
      jest.spyOn(usuariosService, 'buscarPorCorreoParaAuth').mockResolvedValue(mockUser);
      (mailService.enviarCorreo as jest.Mock).mockRejectedValue(new Error('SMTP Error'));

      await expect(service.generarTokenRecuperacion(mockUser.correo))
        .rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('restablecerPassword (CU006)', () => {
    it('debería actualizar la contraseña y marcar el token como usado', async () => {
      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() + 1);

      const mockRegistro = {
        token: 'token123',
        usado: false,
        fechaExpiracion: expirationDate,
        usuario: mockUser
      };

      tokenRepo.findOne.mockResolvedValue(mockRegistro);
      tokenRepo.save.mockResolvedValue({ ...mockRegistro, usado: true });

      const result = await service.restablecerPassword('token123', 'NuevaClave2026!');

      expect(result.message).toBe('Contraseña actualizada con éxito');
      expect(usuariosService.actualizarPassword).toHaveBeenCalledWith(1, 'NuevaClave2026!');
      expect(mockRegistro.usado).toBe(true);
    });

    it('debería fallar si el token ya fue usado o ha expirado', async () => {
      const expiredDate = new Date();
      expiredDate.setHours(expiredDate.getHours() - 1);

      tokenRepo.findOne.mockResolvedValue({
        token: 'token_viejo',
        usado: false,
        fechaExpiracion: expiredDate,
        usuario: mockUser
      });

      await expect(service.restablecerPassword('token_viejo', 'pass'))
        .rejects.toThrow(UnauthorizedException);
    });
  });
});