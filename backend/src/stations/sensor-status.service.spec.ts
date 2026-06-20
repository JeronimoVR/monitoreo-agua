import { Test, TestingModule } from '@nestjs/testing';
import { SensorStatusService } from './sensor-status.service';
import { SseService } from '../common/sse/sse.service';

describe('CPU-MON-005 - Interpretación de estado de conectividad', () => {
  let service: SensorStatusService;
  let sseService: { enviarEvento: jest.Mock };

  beforeEach(async () => {
    sseService = {
      enviarEvento: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SensorStatusService,
        {
          provide: SseService,
          useValue: sseService,
        },
      ],
    }).compile();

    service = module.get<SensorStatusService>(SensorStatusService);
  });

  it('debe interpretar "online" como conectado y emitir status online', () => {
    service.recordStatus(1, 'online');

    expect(sseService.enviarEvento).toHaveBeenCalledWith(
      expect.objectContaining({
        estacionId: 1,
        status: 'online',
        ts: expect.any(String),
      }),
      'status-sensores',
    );
  });

  it('debe interpretar "on" como conectado y emitir status online', () => {
    service.recordStatus(1, 'on');

    expect(sseService.enviarEvento).toHaveBeenCalledWith(
      expect.objectContaining({
        estacionId: 1,
        status: 'online',
        ts: expect.any(String),
      }),
      'status-sensores',
    );
  });

  it('debe interpretar "1" como conectado y emitir status online', () => {
    service.recordStatus(1, '1');

    expect(sseService.enviarEvento).toHaveBeenCalledWith(
      expect.objectContaining({
        estacionId: 1,
        status: 'online',
        ts: expect.any(String),
      }),
      'status-sensores',
    );
  });

  it('debe interpretar "true" como conectado y emitir status online', () => {
    service.recordStatus(1, 'true');

    expect(sseService.enviarEvento).toHaveBeenCalledWith(
      expect.objectContaining({
        estacionId: 1,
        status: 'online',
        ts: expect.any(String),
      }),
      'status-sensores',
    );
  });

  it('debe interpretar "offline" como desconectado y emitir status offline', () => {
    service.recordStatus(1, 'offline');

    expect(sseService.enviarEvento).toHaveBeenCalledWith(
      expect.objectContaining({
        estacionId: 1,
        status: 'offline',
        ts: expect.any(String),
      }),
      'status-sensores',
    );
  });

  it('debe interpretar un valor no reconocido como desconectado y emitir status offline', () => {
    service.recordStatus(1, 'desconectado');

    expect(sseService.enviarEvento).toHaveBeenCalledWith(
      expect.objectContaining({
        estacionId: 1,
        status: 'offline',
        ts: expect.any(String),
      }),
      'status-sensores',
    );
  });
});

describe('CPU-MON-006 - Marca temporal de actualización de conectividad', () => {
  let service: SensorStatusService;
  let sseService: { enviarEvento: jest.Mock };

  beforeEach(async () => {
    sseService = {
      enviarEvento: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SensorStatusService,
        {
          provide: SseService,
          useValue: sseService,
        },
      ],
    }).compile();

    service = module.get<SensorStatusService>(SensorStatusService);
  });

  it('debe emitir una marca de tiempo ISO válida al registrar heartbeat', () => {
    service.recordHeartbeat(7);

    expect(sseService.enviarEvento).toHaveBeenCalledWith(
      expect.objectContaining({
        estacionId: 7,
        status: 'online',
        ts: expect.any(String),
      }),
      'status-sensores',
    );

    const eventoEmitido = sseService.enviarEvento.mock.calls[0][0];

    expect(() => new Date(eventoEmitido.ts).toISOString()).not.toThrow();
    expect(new Date(eventoEmitido.ts).toISOString()).toBe(eventoEmitido.ts);
  });
});