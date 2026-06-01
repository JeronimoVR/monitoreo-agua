import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsuariosService } from './usuarios.service';
import { Usuario } from './entities/usuario.entity';
import { ConfigAlerta } from './entities/config-alerta.entity';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('UsuariosService (QA - CU004)', () => {
  let service: UsuariosService;

  // Mock de Repositorio de Usuarios
  const mockUsuarioRepo = {
    findOne: jest.fn(),
    create: jest.fn().mockImplementation(dto => dto),
    save: jest.fn().mockImplementation(u => Promise.resolve({ id: 1, ...u })),
  };

  // Mock de Repositorio de Configuraciones
  const mockConfigRepo = {
    create: jest.fn().mockImplementation(dto => dto),
    save: jest.fn().mockImplementation(c => Promise.resolve({ id: 1, ...c })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosService,
        {
          provide: getRepositoryToken(Usuario),
          useValue: mockUsuarioRepo,
        },
        {
          provide: getRepositoryToken(ConfigAlerta),
          useValue: mockConfigRepo,
        },
      ],
    }).compile();

    service = module.get<UsuariosService>(UsuariosService);
    jest.clearAllMocks();
  });

  describe('Registro de Usuario (CU004)', () => {
    
    it('debería registrar un usuario y hashear la contraseña exitosamente', async () => {
      const dto = {
        nombre: 'Jeronimo',
        correo: 'jvelezr@estudiante.uniajc.edu.co',
        password: 'Admin123',
        passwordConfirm: 'Admin123',
      };

      mockUsuarioRepo.findOne.mockResolvedValue(null); // Simula que el correo está libre

      const result = await service.crear(dto);

      // QA: Verificar que no se guarde la contraseña en texto plano
      expect(result.passwordHash).toBeDefined();
      expect(result.passwordHash).not.toBe(dto.password);
      
      // QA: Verificar integridad criptográfica
      const isMatch = await bcrypt.compare(dto.password, result.passwordHash);
      expect(isMatch).toBe(true);
      
      expect(mockUsuarioRepo.save).toHaveBeenCalled();
    });

    it('debería lanzar ConflictException si el correo ya existe (Validación de Usuario)', async () => {
      const dto = {
        nombre: 'Jeronimo',
        correo: 'existente@uniajc.edu.co',
        password: 'Admin123',
        passwordConfirm: 'Admin123',
      };

      // Simula que findOne encuentra un usuario con ese correo
      mockUsuarioRepo.findOne.mockResolvedValue({ id: 1, correo: dto.correo });

      await expect(service.crear(dto))
        .rejects.toThrow(ConflictException);
      
      // QA: Verificar que no se llamó al save si el correo ya existía
      expect(mockUsuarioRepo.save).not.toHaveBeenCalled();
    });

    it('debería crear automáticamente una configuración de alertas por defecto al registrarse', async () => {
      const dto = {
        nombre: 'Jeronimo',
        correo: 'nuevo@uniajc.edu.co',
        password: 'Admin123',
        passwordConfirm: 'Admin123',
      };

      mockUsuarioRepo.findOne.mockResolvedValue(null);

      await service.crear(dto);

      // QA: Verificar que se cree la entidad de ConfigAlerta para el nuevo usuario
      expect(mockConfigRepo.create).toHaveBeenCalled();
      expect(mockConfigRepo.save).toHaveBeenCalled();
    });
  });

  describe('Búsqueda y Seguridad', () => {
    it('buscarPorCorreoParaAuth debería retornar el usuario con los campos necesarios', async () => {
      const correo = 'test@agua.com';
      mockUsuarioRepo.findOne.mockResolvedValue({ id: 1, correo });

      const result = await service.buscarPorCorreoParaAuth(correo);
      expect(result?.correo).toBe(correo);
    });
  });
});
