// muestreos.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { MuestreosService } from './muestreos.service';
import { Muestreo } from './entities/muestreos.entity';
import { Medida } from './entities/medidas.entity';
import { IrcaMotorReglasService } from '../ircaRulesEngine/ircaClasificacion.service';
import { NotificacionesService } from '../notifications/notificaciones.service';

describe('CPU-MON - MuestreosService', () => {
  let service: MuestreosService;

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  const mockMuestreoRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
  };

  const mockMedidaRepo = {
    save: jest.fn(),
  };

  const mockIrcaService = {
    calcularIrca: jest.fn(),
  };

  const mockNotificacionesService = {
    evaluarYGenerarAlertas: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MuestreosService,
        { provide: getRepositoryToken(Muestreo), useValue: mockMuestreoRepo },
        { provide: getRepositoryToken(Medida), useValue: mockMedidaRepo },
        { provide: IrcaMotorReglasService, useValue: mockIrcaService },
        { provide: NotificacionesService, useValue: mockNotificacionesService },
      ],
    }).compile();

    service = module.get<MuestreosService>(MuestreosService);
    jest.clearAllMocks();
  });

  describe('CPU-MON-001', () => {
    it('debe consultar muestreos filtrados por estación con relaciones para visualización', async () => {
      const mockData = [
        {
          id: 10,
          fechaMuestreo: new Date('2026-06-15T12:00:00.000Z'),
          estacion: { id: 1, nombre: 'Estación Central' },
          clasificacionIrca: { id: 1, clasificacion: 'SIN RIESGO' },
          medidas: [
            { valor: 7.2, parametro: { nombre: 'pH' } },
            { valor: 24.5, parametro: { nombre: 'Temperatura' } },
          ],
        },
      ];

      mockQueryBuilder.getMany.mockResolvedValue(mockData);

      const result = await service.getFilteredMuestreos({ estacionId: '1' });

      expect(mockMuestreoRepo.createQueryBuilder).toHaveBeenCalledWith('m');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('m.estacion', 'estacion');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('m.clasificacionIrca', 'clasificacionIrca');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('m.medidas', 'medidas');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('medidas.parametro', 'parametro');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('m.estacionId = :estacionId', { estacionId: 1 });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('m.fechaMuestreo', 'DESC');
      expect(result).toEqual(mockData);
    });
  });



  describe('CPU-MON-003', () => {
  it('debe retornar una lista vacía cuando no existen datos para la estación consultada', async () => {
    mockQueryBuilder.getMany.mockResolvedValue([]);

    const result = await service.getFilteredMuestreos({ estacionId: '1' });

    expect(mockQueryBuilder.where).toHaveBeenCalledWith('m.estacionId = :estacionId', { estacionId: 1 });
    expect(result).toEqual([]);
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });

  it('debe lanzar BadRequestException si estacionId no es numérico', async () => {
    await expect(
      service.getFilteredMuestreos({ estacionId: 'abc' }),
    ).rejects.toThrow(BadRequestException);
  });
  });
});