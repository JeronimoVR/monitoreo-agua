import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsuariosService } from '../users/usuarios.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TokenRecuperacion } from './entities/token-recuperacion.entity';
import { MailService } from '../common/mail/mail.service';
import { UnauthorizedException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { validate } from 'class-validator';
import { LoginDto } from './dto/login.dto';



// SOLUCIÓN DEFINITIVA PARA BCRYPT: Mockear el módulo antes del describe
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('Pruebas unitarias - Modulo autenticación y acceso', () => {
  let service: AuthService;
  let usuariosService: UsuariosService;
  let tokenRepo: any;
  let jwtService: JwtService;
  let mailService: MailService;

  const mockUser = {
    id: 1,
    nombre: 'Jeronimo',
    correo: 'jvelezr@estudiante.uniajc.edu.co',
    passwordHash: '$2b$10$hashedpassword',
    rol: 'admin',
    configuraciones: [],
  };

  beforeEach(async () => {
    // SILENCIAR CONSOLE.ERROR: Evita que los tests de fallos esperados ensucien la terminal
    jest.spyOn(console, 'error').mockImplementation(() => { });

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
    jwtService = module.get<JwtService>(JwtService);
    mailService = module.get<MailService>(MailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('debe inicializar correctamente el servicio', () => {
    expect(service).toBeDefined();
  });

  describe('CPU-AUT-001 - Validación de formato de correo', () => {
    it('debe aceptar un correo válido y rechazar uno inválido', async () => {
      const dtoValido = new LoginDto();
      dtoValido.correo = 'marvinsantiago201318@gmail.com';
      dtoValido.password = 'Clave123*';

      const dtoInvalido = new LoginDto();
      dtoInvalido.correo = 'marvinsantiago201318gmail.com';
      dtoInvalido.password = 'Clave123*';

      const erroresValido = await validate(dtoValido);
      const erroresInvalido = await validate(dtoInvalido);

      const errorCorreoValido = erroresValido.find(error => error.property === 'correo');
      const errorCorreoInvalido = erroresInvalido.find(error => error.property === 'correo');

      expect(errorCorreoValido).toBeUndefined();
      expect(errorCorreoInvalido).toBeDefined();
      expect(errorCorreoInvalido?.constraints).toHaveProperty('isEmail');
    });
  });

  describe('CPU-AUT-004 - Comparación de contraseña ingresada y cifrada', () => {
    it('debe autenticar cuando las credenciales son válidas', async () => {
      jest.spyOn(usuariosService, 'buscarPorCorreoConPassword').mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(mockUser.correo, 'Admin123');

      expect(result).not.toHaveProperty('passwordHash');
      expect(result.id).toEqual(mockUser.id);
    });

    it('debe rechazar cuando la contraseña no coincide', async () => {
      jest.spyOn(usuariosService, 'buscarPorCorreoConPassword').mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.validateUser(mockUser.correo, 'WrongPass'))
        .rejects.toThrow(UnauthorizedException);
    });

    it('debe rechazar cuando el usuario no existe', async () => {
      jest.spyOn(usuariosService, 'buscarPorCorreoConPassword').mockResolvedValue(null);

      await expect(service.validateUser('otro@correo.com', 'Admin123'))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('CPU-AUT-005 - Generación de JWT', () => {
    it('debe generar un access_token y retornar información básica del usuario', async () => {
      const result = await service.login(mockUser);
      console.log('[Test JWT] Resultado obtenido:', result);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('access_token');
      expect(result.access_token).toBe('mock_jwt_token');
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.correo,
        rol: mockUser.rol,
      });
      expect(result.user.nombre).toBe('Jeronimo');
    });
  });

  describe('CPU-AUT-006 - Token único de recuperación', () => {
    it('debe generar y guardar un token de recuperación', async () => {
      jest.spyOn(usuariosService, 'buscarPorCorreoParaAuth').mockResolvedValue(mockUser);
      tokenRepo.create.mockImplementation((data) => data);
      tokenRepo.save.mockResolvedValue({});
      (mailService.enviarCorreo as jest.Mock).mockResolvedValue(true);

      const result = await service.generarTokenRecuperacion(mockUser.correo);

      console.log('\n--- ESCENARIO 1: USUARIO EXISTE ---');
      console.log('[Test] Correo buscado:', mockUser.correo);
      console.log('[Test] Respuesta del servicio:', result);

      expect(result.message).toContain('Si el correo');
      expect(tokenRepo.create).toHaveBeenCalled();
      expect(tokenRepo.save).toHaveBeenCalled();
      expect(mailService.enviarCorreo).toHaveBeenCalled();
    });

    it('debe retornar mensaje genérico si el correo no existe', async () => {
      jest.spyOn(usuariosService, 'buscarPorCorreoParaAuth').mockResolvedValue(null);

      const result = await service.generarTokenRecuperacion('Marago@test.com');

      console.log('\n--- ESCENARIO 2: USUARIO NO EXISTE ---');
      console.log('[Test] Correo buscado: Marago@test.com');
      console.log('[Test] Respuesta del servicio (Debe ser idéntica por seguridad):', result);

      expect(result.message).toContain('Si el correo');
      expect(tokenRepo.save).not.toHaveBeenCalled();
      expect(mailService.enviarCorreo).not.toHaveBeenCalled();
    });
  });

  describe('CPU-AUT-007 - Expiración del token de recuperación', () => {
    it('debe aceptar un token vigente y actualizar la contraseña', async () => {
      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() + 1);

      const mockRegistro = {
        token: 'token123',
        usado: false,
        fechaExpiracion: expirationDate,
        usuario: mockUser,
      };

      tokenRepo.findOne.mockResolvedValue(mockRegistro);
      tokenRepo.save.mockResolvedValue({ ...mockRegistro, usado: true });

      const result = await service.restablecerPassword('token123', 'NuevaClave2026!');

      expect(result.message).toBe('Contraseña actualizada con éxito');
      expect(usuariosService.actualizarPassword).toHaveBeenCalledWith(1, 'NuevaClave2026!');
      expect(mockRegistro.usado).toBe(true);
    });

    it('debe rechazar un token expirado', async () => {
      const expiredDate = new Date();
      expiredDate.setHours(expiredDate.getHours() - 1);

      tokenRepo.findOne.mockResolvedValue({
        token: 'token_viejo',
        usado: false,
        fechaExpiracion: expiredDate,
        usuario: mockUser,
      });

      await expect(service.restablecerPassword('token_viejo', 'pass'))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('CPU-AUT-008 - Enlace de recuperación con token embebido', () => {
    it('debe construir y enviar una URL de recuperación que contenga el token', async () => {
      process.env.FRONTEND_URL = 'http://localhost:3000';

      jest.spyOn(usuariosService, 'buscarPorCorreoParaAuth').mockResolvedValue(mockUser);
      tokenRepo.create.mockImplementation((data) => data);
      tokenRepo.save.mockResolvedValue({});
      (mailService.enviarCorreo as jest.Mock).mockResolvedValue(true);

      await service.generarTokenRecuperacion(mockUser.correo);

      expect(mailService.enviarCorreo).toHaveBeenCalledWith(
        mockUser.correo,
        'Recuperación de Contraseña - Sistema IoT',
        'recuperación',
        expect.objectContaining({
          nombre: mockUser.nombre,
          url: expect.stringContaining('/reset-password?token='),
        }),
      );
    });

    it('debe lanzar error si falla el envío del correo', async () => {
      jest.spyOn(usuariosService, 'buscarPorCorreoParaAuth').mockResolvedValue(mockUser);
      tokenRepo.create.mockImplementation((data) => data);
      tokenRepo.save.mockResolvedValue({});
      (mailService.enviarCorreo as jest.Mock).mockRejectedValue(new Error('SMTP Error'));

      await expect(service.generarTokenRecuperacion(mockUser.correo))
        .rejects.toThrow(InternalServerErrorException);
    });
  });

  /*describe('validateUser (CU005)', () => {
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
  */

  /*describe('login (CU005)', () => {
    it('debería generar un access_token y retornar info básica del usuario', async () => {
      const result = await service.login(mockUser);

      expect(result).toHaveProperty('access_token');
      expect(result.user.nombre).toBe('Jeronimo');
    });
  });
  */

  /*describe('generarTokenRecuperacion (CU006)', () => {
    it('debería crear un token y llamar al servicio de correo', async () => {
      jest.spyOn(usuariosService, 'buscarPorCorreoParaAuth').mockResolvedValue(mockUser);
      tokenRepo.create.mockReturnValue({ token: '123' });
      tokenRepo.save.mockResolvedValue({});
      (mailService.enviarCorreo as jest.Mock).mockResolvedValue(true);

      const result = await service.generarTokenRecuperacion(mockUser.correo);

      expect(result.message).toContain('Si el correo');
      expect(tokenRepo.save).toHaveBeenCalled();
      expect(mailService.enviarCorreo).toHaveBeenCalled();
    });

    it('debería retornar mensaje genérico si el correo no existe', async () => {
      jest.spyOn(usuariosService, 'buscarPorCorreoParaAuth').mockResolvedValue(null);

      const result = await service.generarTokenRecuperacion('noexiste@test.com');

      expect(result.message).toContain('Si el correo');
      expect(tokenRepo.save).not.toHaveBeenCalled();
      expect(mailService.enviarCorreo).not.toHaveBeenCalled();
    });

    it('debería lanzar InternalServerErrorException si el envío de correo falla', async () => {
      jest.spyOn(usuariosService, 'buscarPorCorreoParaAuth').mockResolvedValue(mockUser);
      (mailService.enviarCorreo as jest.Mock).mockRejectedValue(new Error('SMTP Error'));

      await expect(service.generarTokenRecuperacion(mockUser.correo))
        .rejects.toThrow(InternalServerErrorException);
    });
  });
  */

  /*describe('restablecerPassword (CU006)', () => {
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
  */
});
