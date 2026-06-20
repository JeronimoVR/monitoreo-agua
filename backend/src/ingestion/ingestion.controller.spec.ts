import { Test, TestingModule } from '@nestjs/testing';
import { IngestionController } from './ingestion.controller';
import { MuestreosService } from '../sampling/muestreos.service';
import { SseService } from '../common/sse/sse.service';
import { SensorStatusService } from '../stations/sensor-status.service';

describe('CPU-MON - IngestionController', () => {
  let controller: IngestionController;

  const mockMuestreosService = {
    crear: jest.fn(),
  };

  const mockSseService = {
    enviarEvento: jest.fn(),
  };

  const mockSensorStatusService = {
    recordHeartbeat: jest.fn(),
    recordStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IngestionController],
      providers: [
        { provide: MuestreosService, useValue: mockMuestreosService },
        { provide: SseService, useValue: mockSseService },
        { provide: SensorStatusService, useValue: mockSensorStatusService },
      ],
    }).compile();

    controller = module.get<IngestionController>(IngestionController);
    jest.clearAllMocks();
  });

  describe('CPU-MON-002', () => {
    it('debe normalizar la fecha del payload MQTT y conservarla como fecha_muestreo', async () => {
      const payload = {
        id_estacion: 1,
        fecha: '2026-06-15T17:00:00',
        medidas: [
          { id_parametro: 1, valor: 7.11 },
          { id_parametro: 4, valor: 25.4 },
        ],
      };

      const mockCreated = { id: 99 };
      mockMuestreosService.crear.mockResolvedValue(mockCreated);

      const result = await controller.handleSensorData(payload as any, {} as any);

      expect(mockMuestreosService.crear).toHaveBeenCalledWith(
        expect.objectContaining({
          id_estacion: 1,
          fecha_muestreo: new Date('2026-06-15T17:00:00').toISOString(),
          medidas: [
            { id_parametro: 1, valor: 7.11 },
            { id_parametro: 4, valor: 25.4 },
          ],
        }),
      );

      expect(mockSseService.enviarEvento).toHaveBeenCalledWith(mockCreated, 'nuevo-muestreo');
      expect(mockSensorStatusService.recordHeartbeat).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockCreated);
    });
  });
});