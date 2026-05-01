import { Test, TestingModule } from '@nestjs/testing';
import { MuestreosService } from './muestreos.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Muestreo } from './entities/muestreos.entity';
import { Medida } from './entities/medidas.entity';
import { IrcaMotorReglasService } from '../ircaRulesEngine/ircaClasificacion.service';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';

describe('MuestreosService (QA - CU001 & CU003)', () => {
  let service: MuestreosService;
  let ircaService: IrcaMotorReglasService;

  // Mocks de Repositorios
  const mockMuestreoRepo = {
    create: jest.fn().mockImplementation(dto => dto),
    save: jest.fn().mockImplementation(m => Promise.resolve({ id: 100, ...m })),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockMedidaRepo = {
    save: jest.fn().mockResolvedValue([]),
  };

  // Mock del Motor de Reglas
  const mockIrcaService = {
    calcularIrca: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MuestreosService,
        { provide: getRepositoryToken(Muestreo), useValue: mockMuestreoRepo },
        { provide: getRepositoryToken(Medida), useValue: mockMedidaRepo },
        { provide: IrcaMotorReglasService, useValue: mockIrcaService },
      ],
    }).compile();

    service = module.get<MuestreosService>(MuestreosService);
    ircaService = module.get<IrcaMotorReglasService>(IrcaMotorReglasService);
    jest.clearAllMocks();
  });

  describe('crear (CU001 - Capturar y Transmitir)', () => {
    const dto = {
      id_estacion: 1,
      medidas: [
        { id_parametro: 1, valor: 7.2 },
        { id_parametro: 2, valor: 1.5 }
      ]
    };

    it('debería crear un muestreo, calcular IRCA y guardar las medidas', async () => {
      // 1. Definir qué devuelve el motor de reglas
      const mockResultadoIrca = { puntaje: 5.0, clasificacion: { id: 1, nombre: 'SIN RIESGO' } };
      mockIrcaService.calcularIrca.mockResolvedValue(mockResultadoIrca);

      const result = await service.crear(dto as any);

      // QA: Verificar que se llamó al motor de reglas con las medidas correctas
      expect(ircaService.calcularIrca).toHaveBeenCalledWith(dto.medidas);

      // QA: Verificar que el muestreo guardado tiene el puntaje del motor
      expect(result.irca_calculado).toBe(5.0);
      expect(result.id).toBe(100);

      // QA: Verificar que las medidas se intentaron guardar
      expect(mockMedidaRepo.save).toHaveBeenCalled();
    });

    it('debería lanzar InternalServerErrorException si el motor de reglas falla', async () => {
      mockIrcaService.calcularIrca.mockRejectedValue(new Error('Error de cálculo'));

      await expect(service.crear(dto as any))
        .rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findOne & consultarPorEstacion (CU003 - Visualizar Históricos)', () => {
    it('findOne: debería retornar un muestreo si existe', async () => {
      const mockResult = { id: 1, irca_calculado: 0 };
      mockMuestreoRepo.findOne.mockResolvedValue(mockResult);

      const result = await service.findOne(1);
      expect(result).toEqual(mockResult);
    });

    it('findOne: debería lanzar NotFoundException si no existe', async () => {
      mockMuestreoRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999))
        .rejects.toThrow(NotFoundException);
    });

    it('consultarPorEstacion: debería buscar con las relaciones de medidas y clasificación', async () => {
      mockMuestreoRepo.find.mockResolvedValue([]);

      await service.consultarPorEstacion(1);

      expect(mockMuestreoRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id_estacion: 1 },
          relations: ['medidas', 'clasificacionIrca']
        })
      );
    });
  });


});