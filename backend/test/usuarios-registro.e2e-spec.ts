import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ConflictException, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { UsuariosController } from '../src/users/usuarios.controller';
import { UsuariosService } from '../src/users/usuarios.service';

describe('Pruebas de integración - Registro de usuarios', () => {
  let app: INestApplication;

  const mockUsuariosService = {
    crear: jest.fn(),
    changePassword: jest.fn(),
    actualizarConfigAlerta: jest.fn(),
    getAlertConfigForUser: jest.fn(),
    buscarPorId: jest.fn(),
    actualizar: jest.fn(),
    softDelete: jest.fn(),
    eliminar: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UsuariosController],
      providers: [
        {
          provide: UsuariosService,
          useValue: mockUsuariosService,
        },
      ],
    }).compile();

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
    await app.close();
  });

  it('CPI-AUT-001 - debe registrar un usuario correctamente', async () => {
  const payload = {
    nombre: 'Juan Pablo Giraldo',
    correo: 'juanpablogiraldo@gmail.com',
    password: 'Juan2026*',
  };

  mockUsuariosService.crear.mockResolvedValue({
    id: 1,
    nombre: payload.nombre,
    correo: payload.correo,
  });

  const response = await request(app.getHttpServer())
    .post('/usuarios/registro')
    .send(payload)
    .expect(201);

  expect(mockUsuariosService.crear).toHaveBeenCalledWith(
    expect.objectContaining({
      nombre: payload.nombre,
      correo: payload.correo,
      password: payload.password,
    }),
  );

  expect(response.body.id).toBe(1);
  expect(response.body.nombre).toBe(payload.nombre);
  expect(response.body.correo).toBe(payload.correo);
});

  it('CPI-AUT-002 - debe rechazar el registro cuando el correo ya existe', async () => {
    mockUsuariosService.crear.mockRejectedValue(
      new ConflictException('El correo ya está registrado'),
    );

    const payload = {
      nombre: 'Marvin Santiago',
      correo: 'marvinsantiago201318@gmail.com',
      password: 'Clave123*',
    };

    const response = await request(app.getHttpServer())
      .post('/usuarios/registro')
      .send(payload)
      .expect(409);

    expect(mockUsuariosService.crear).toHaveBeenCalledWith(
      expect.objectContaining({
        nombre: payload.nombre,
        correo: payload.correo,
        password: payload.password,
      }),
    );

    expect(response.body.statusCode).toBe(409);
    expect(response.body.message).toBe('El correo ya está registrado');
  });
});