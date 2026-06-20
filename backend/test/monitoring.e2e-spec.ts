import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { MuestreosController } from '../src/sampling/muestreos.controller';
import { MuestreosService } from '../src/sampling/muestreos.service';

describe('CPI-MON: Integración — Monitoreo y Consulta', () => {
  let app: INestApplication;

  const mockMuestreosService = {
    findAllHistory: jest.fn(),
    getFilteredMuestreos: jest.fn(),
    generateCsvBuffer: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [MuestreosController],
      providers: [
        { provide: MuestreosService, useValue: mockMuestreosService },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await app.close();
  });
  // ─────────────────────────────────────────────────────────────────────────────
  // CPI-MON-001
  // CU005 — Verificar la recuperación de las últimas lecturas desde la BD
  // y su visualización en el dashboard
  // ─────────────────────────────────────────────────────────────────────────────
  describe('CPI-MON-001', () => {
    it('debe recuperar las últimas lecturas con los 5 parámetros y timestamp', async () => {
      mockMuestreosService.findAllHistory.mockResolvedValue([
        {
          id: 1,
          fechaMuestreo: '2026-06-15T18:00:00.000Z',
          ircacalculado: 4.2,
          clasificacionIrca: { id: 1, clasificacion: 'SIN RIESGO' },
          medidas: [
            { valor: 7.1, parametro: { nombre: 'pH' } },
            { valor: 24.5, parametro: { nombre: 'Temperatura' } },
            { valor: 120, parametro: { nombre: 'Conductividad' } },
            { valor: 2.1, parametro: { nombre: 'Turbidez' } },
            { valor: 6.3, parametro: { nombre: 'Oxígeno Disuelto' } },
          ],
        },
      ]);

      const response = await request(app.getHttpServer())
        .get('/muestreos/historial/1')
        .expect(200);

      expect(mockMuestreosService.findAllHistory).toHaveBeenCalledWith(1);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].fechaMuestreo).toBeDefined();
      expect(response.body[0].medidas).toHaveLength(5);

      const nombres = response.body[0].medidas.map((m: any) => m.parametro.nombre);
      expect(nombres).toEqual(
        expect.arrayContaining([
          'pH',
          'Temperatura',
          'Conductividad',
          'Turbidez',
          'Oxígeno Disuelto',
        ]),
      );
    });
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // CPI-MON-003
  // CU007 — Verificar el comportamiento del sistema cuando no hay datos históricos
  // ─────────────────────────────────────────────────────────────────────────────
  describe('CPI-MON-002', () => {
    it('debe responder sin datos históricos cuando la BD está vacía', async () => {
      mockMuestreosService.findAllHistory.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/muestreos/historial/1')
        .expect(200);

      expect(mockMuestreosService.findAllHistory).toHaveBeenCalledWith(1);
      expect(response.body).toEqual([]);
    });
  });
// ─────────────────────────────────────────────────────────────────────────────
  // CPI-MON-005
  // CU006 — Verificar la consulta del último cálculo de IRCA y su despliegue
  // ─────────────────────────────────────────────────────────────────────────────
  describe('CPI-MON-003', () => {
    it('debe consultar el último cálculo de IRCA con clasificación y hora', async () => {
      mockMuestreosService.findAllHistory.mockResolvedValue([
        {
          id: 22,
          fechaMuestreo: '2026-06-15T18:10:00.000Z',
          ircacalculado: 13.95,
          clasificacionIrca: { id: 2, clasificacion: 'RIESGO BAJO' },
          medidas: [
            { valor: 7.0, parametro: { nombre: 'pH' } },
          ],
        },
      ]);

      const response = await request(app.getHttpServer())
        .get('/muestreos/historial/1')
        .expect(200);

      expect(response.body[0]).toEqual(
        expect.objectContaining({
          ircacalculado: 13.95,
          fechaMuestreo: '2026-06-15T18:10:00.000Z',
        }),
      );
      expect(response.body[0].clasificacionIrca).toEqual(
        expect.objectContaining({
          clasificacion: 'RIESGO BAJO',
        }),
      );
    });
  });
});