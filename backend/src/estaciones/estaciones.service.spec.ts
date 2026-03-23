import { Test, TestingModule } from '@nestjs/testing';
import { EstacionesService } from './estaciones.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Estacion } from './entities/estacion.entity';
import { NotFoundException } from '@nestjs/common';

describe('EstacionesService', () => {
  let service: EstacionesService;
  
  const mockEstacionRepository = {
    create: jest.fn().mockImplementation(dto => dto),
    save: jest.fn().mockImplementation(estacion => Promise.resolve({ id: 1, ...estacion })),
    find: jest.fn().mockResolvedValue([{ id: 1, nombre: 'Estación Central' }]),
    findOneBy: jest.fn().mockImplementation(({ id }) => {
      if (id === 1) return Promise.resolve({ id: 1, nombre: 'Estación Central' });
      return Promise.resolve(null);
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EstacionesService,
        {
          provide: getRepositoryToken(Estacion),
          useValue: mockEstacionRepository,
        },
      ],
    }).compile();

    service = module.get<EstacionesService>(EstacionesService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debería crear una nueva estación exitosamente', async () => {
      const dto = { nombre: 'Planta Florida', ubicacion: 'Valle', latitud: 10, longitud: 10 };
      expect(await service.create(dto)).toEqual({
        id: expect.any(Number),
        ...dto,
      });
    });
  });

  describe('findOne', () => {
    it('debería retornar una estación si existe', async () => {
      const result = await service.findOne(1);
      expect(result.nombre).toEqual('Estación Central');
    });

    it('debería lanzar una NotFoundException si no existe', async () => {
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });
});