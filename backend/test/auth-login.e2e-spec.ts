import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, UnauthorizedException, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { ThrottlerGuard } from '@nestjs/throttler';

describe('Pruebas de integración - Inicio de sesión', () => {
  let app: INestApplication;

  const mockAuthService = {
    validateUser: jest.fn(),
    login: jest.fn(),
    generarTokenRecuperacion: jest.fn(),
    restablecerPassword: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    if (app) {
      await app.close();
    }
  });

  it('CPI-AUT-003 - debe iniciar sesión correctamente y generar token', async () => {
    const payload = {
      correo: 'jvelezr@estudiante.uniajc.edu.co',
      password: 'Admin123',
    };

    const mockUser = {
      id: 1,
      nombre: 'Jeronimo',
      correo: payload.correo,
      rol: 'admin',
    };

    mockAuthService.validateUser.mockResolvedValue(mockUser);
    mockAuthService.login.mockResolvedValue({
      access_token: 'mock_jwt_token',
      user: {
        id: 1,
        nombre: 'Jeronimo',
        rol: 'admin',
      },
    });

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(payload)
      .expect(201);

    expect(mockAuthService.validateUser).toHaveBeenCalledWith(payload.correo, payload.password);
    expect(mockAuthService.login).toHaveBeenCalledWith(mockUser);

    expect(response.body).toEqual({
      access_token: 'mock_jwt_token',
      user: {
        id: 1,
        nombre: 'Jeronimo',
        rol: 'admin',
      },
    });
  });

  it('CPI-AUT-004 - debe rechazar el inicio de sesión con credenciales incorrectas', async () => {
    const payload = {
      correo: 'jvelezr@estudiante.uniajc.edu.co',
      password: 'ClaveIncorrecta123',
    };

    mockAuthService.validateUser.mockRejectedValue(
      new UnauthorizedException('Credenciales inválidas o el usuario no existe'),
    );

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send(payload)
      .expect(401);

    expect(mockAuthService.validateUser).toHaveBeenCalledWith(payload.correo, payload.password);
    expect(mockAuthService.login).not.toHaveBeenCalled();

    expect(response.body.statusCode).toBe(401);
    expect(response.body.message).toBe('Credenciales inválidas o el usuario no existe');
  });
});