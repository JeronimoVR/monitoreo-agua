import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotificacionesService } from './notificaciones.service';
import { Alerta } from './alerts/entities/alerta.entity';
import { SseService } from '../common/sse/sse.service';
import { MailService } from '../common/mail/mail.service';
import { UsuariosService } from '../users/usuarios.service';
import { Muestreo } from '../sampling/entities/muestreos.entity';

describe('Servicio de notificaciones - Bloque Alertas y reportes', () => {
  let service: NotificacionesService;

  const alertaRepo = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const sseService = {
    enviarEvento: jest.fn(),
  };

  const mailService = {
    enviarCorreo: jest.fn(),
  };

  const usuariosService = {
    getDestinatariosAlertas: jest.fn(),
  };

  const buildMuestreo = (overrides: Partial<Muestreo> = {}): Muestreo =>
    ({
      id: 1,
      id_clasificacion_irca: 1,
      estacionId: 1,
      irca_calculado: 40,
      fechaMuestreo: new Date('2026-06-18T10:00:00.000Z'),
      estacion: { id: 1, nombre: 'Estación Central' } as any,
      clasificacionIrca: {
        id: 1,
        clasificacion: 'RIESGO ALTO',
        descripcion: 'Nivel de riesgo alto',
      } as any,
      medidas: [
        {
          valor: 9,
          parametro: {
            nombre: 'pH',
            unidadMedida: '',
            valorMinimo: 6.5,
            valorMaximo: 8.5,
          },
        } as any,
        {
          valor: 25,
          parametro: {
            nombre: 'Temperatura',
            unidadMedida: '°C',
            valorMinimo: 20,
            valorMaximo: 30,
          },
        } as any,
      ] as any,
      ...overrides,
    }) as Muestreo;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificacionesService,
        {
          provide: getRepositoryToken(Alerta),
          useValue: alertaRepo,
        },
        {
          provide: SseService,
          useValue: sseService,
        },
        {
          provide: MailService,
          useValue: mailService,
        },
        {
          provide: UsuariosService,
          useValue: usuariosService,
        },
      ],
    }).compile();

    service = module.get<NotificacionesService>(NotificacionesService);
  });

  describe('CPU-AR-002 - disparo de notificación por IRCA', () => {
    it('no debe generar alerta cuando el IRCA no supera la condición configurada', async () => {
      const muestreo = buildMuestreo({
        irca_calculado: 10,
        clasificacionIrca: {
          id: 2,
          clasificacion: 'RIESGO BAJO',
          descripcion: 'Bajo',
        } as any,
      });

      const result = await service.evaluarYGenerarAlertas(muestreo);

      expect(result.enviado).toBe(false);
      expect(result.motivo).toContain('no requiere alerta');
      expect(alertaRepo.save).not.toHaveBeenCalled();
      expect(mailService.enviarCorreo).not.toHaveBeenCalled();
      expect(sseService.enviarEvento).not.toHaveBeenCalled();
    });

    it('debe generar alerta cuando el IRCA supera el umbral', async () => {
      const muestreo = buildMuestreo({ irca_calculado: 40 });

      alertaRepo.findOne.mockResolvedValueOnce(null);
      usuariosService.getDestinatariosAlertas.mockResolvedValue(['Msantiagocarabali@estudiante.uniajc.edu.co']);
      alertaRepo.create.mockImplementation((data) => data);
      alertaRepo.save.mockImplementation(async (data) => ({
        id: 99,
        ...data,
      }));
      mailService.enviarCorreo.mockResolvedValue(undefined);

      const result = await service.evaluarYGenerarAlertas(muestreo);

      expect(result.enviado).toBe(true);
      expect(result.alertaId).toBe(99);
      expect(alertaRepo.save).toHaveBeenCalledTimes(1);
      expect(sseService.enviarEvento).toHaveBeenCalledWith(
        expect.objectContaining({ id: 99 }),
        'alerta-irca',
      );
      expect(mailService.enviarCorreo).toHaveBeenCalledTimes(1);
    });

    it('debe generar alerta cuando la clasificación contiene INVIABLE aunque el puntaje no sea alto', async () => {
      const muestreo = buildMuestreo({
        irca_calculado: 20,
        clasificacionIrca: {
          id: 3,
          clasificacion: 'INVIABLE SANITARIAMENTE',
          descripcion: 'Inviable',
        } as any,
      });

      alertaRepo.findOne.mockResolvedValueOnce(null);
      usuariosService.getDestinatariosAlertas.mockResolvedValue(['Msantiagocarabali@estudiante.uniajc.edu.co']);
      alertaRepo.create.mockImplementation((data) => data);
      alertaRepo.save.mockImplementation(async (data) => ({
        id: 100,
        ...data,
      }));
      mailService.enviarCorreo.mockResolvedValue(undefined);

      const result = await service.evaluarYGenerarAlertas(muestreo);

      expect(result.enviado).toBe(true);
      expect(result.alertaId).toBe(100);
      expect(mailService.enviarCorreo).toHaveBeenCalledTimes(1);
    });
  });

  describe('CPU-AR-003A - validar alertas activadas antes de notificar', () => {
    it('no debe enviar notificación cuando no hay destinatarios con alertas activadas', async () => {
      const muestreo = buildMuestreo();

      alertaRepo.findOne.mockResolvedValueOnce(null);
      usuariosService.getDestinatariosAlertas.mockResolvedValue([]);

      const result = await service.evaluarYGenerarAlertas(muestreo);

      expect(usuariosService.getDestinatariosAlertas).toHaveBeenCalledWith(1);
      expect(result.enviado).toBe(false);
      expect(result.motivo).toBe('No hay destinatarios con notificaciones activadas');
      expect(alertaRepo.save).not.toHaveBeenCalled();
      expect(mailService.enviarCorreo).not.toHaveBeenCalled();
    });

    it('debe enviar notificación cuando existen destinatarios con alertas activadas', async () => {
      const muestreo = buildMuestreo();

      alertaRepo.findOne.mockResolvedValueOnce(null);
      usuariosService.getDestinatariosAlertas.mockResolvedValue([
        'Msantiagocarabali@estudiante.uniajc.edu.co',
        'luis@test.com',
      ]);
      alertaRepo.create.mockImplementation((data) => data);
      alertaRepo.save.mockImplementation(async (data) => ({
        id: 101,
        ...data,
      }));
      mailService.enviarCorreo.mockResolvedValue(undefined);

      const result = await service.evaluarYGenerarAlertas(muestreo);

      expect(result.enviado).toBe(true);
      expect(result.destinatarios).toEqual(['Msantiagocarabali@estudiante.uniajc.edu.co', 'luis@test.com']);
      expect(mailService.enviarCorreo).toHaveBeenCalledTimes(2);
    });
  });

  describe('CPU-AR-003B -regla anti-spam relacionada con notificaciones', () => {
    it('no debe reenviar alerta IRCA si ya existe una enviada dentro de las últimas 2 horas', async () => {
      const muestreo = buildMuestreo();

      alertaRepo.findOne.mockResolvedValueOnce({
        id: 1,
        tipo: 'IRCA',
        fechaCreacion: new Date(Date.now() - 60 * 60 * 1000),
      });

      const result = await service.evaluarYGenerarAlertas(muestreo);

      expect(result.enviado).toBe(false);
      expect(result.motivo).toContain('Intervalo de spam no cumplido');
      expect(alertaRepo.save).not.toHaveBeenCalled();
      expect(mailService.enviarCorreo).not.toHaveBeenCalled();
    });
  });
});


/*describe('NotificacionesService (QA - Alertas y Real-time)', () => {
  let service: NotificacionesService;
  let alertaRepo: Repository<Alerta>;
  let sseService: SseService;
  let mailService: MailService;

  const mockAlertaRepo = {
    create: jest.fn().mockImplementation(dto => dto),
    save: jest.fn().mockImplementation(alerta => Promise.resolve({ id: 1, fechaCreacion: new Date(), ...alerta })),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockSseService = {
    enviarEvento: jest.fn(),
  };

  const mockMailService = {
    enviarCorreo: jest.fn().mockResolvedValue(true),
  };

  const mockUsuariosService = {
    getDestinatariosAlertas: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificacionesService,
        { provide: getRepositoryToken(Alerta), useValue: mockAlertaRepo },
        { provide: SseService, useValue: mockSseService },
        { provide: MailService, useValue: mockMailService },
        { provide: UsuariosService, useValue: mockUsuariosService },
      ],
    }).compile();

    service = module.get<NotificacionesService>(NotificacionesService);
    alertaRepo = module.get<Repository<Alerta>>(getRepositoryToken(Alerta));
    sseService = module.get<SseService>(SseService);
    mailService = module.get<MailService>(MailService);

    jest.clearAllMocks();
  });

  describe('procesarDatoSensor (Lógica de Alerta Crítica)', () => {

    it('debería enviar evento SSE si el valor supera el límite (9.0)', async () => {
      await service.procesarDatoSensor(1, 10.5, 'pH');

      expect(mockSseService.enviarEvento).toHaveBeenCalledWith(
        expect.objectContaining({ valor: 10.5 }),
        'alerta-visual'
      );
    });

    it('NO debería guardar alerta ni enviar correo si la última alerta crítica fue hace menos de 30 minutos', async () => {
      // Simulamos una alerta creada hace 10 minutos
      const hace10Minutos = new Date(Date.now() - 10 * 60000);
      mockAlertaRepo.findOne.mockResolvedValue({ fechaCreacion: hace10Minutos });

      await service.procesarDatoSensor(1, 15.0, 'Turbiedad');

      expect(mockAlertaRepo.save).not.toHaveBeenCalled();
      expect(mockMailService.enviarCorreo).not.toHaveBeenCalled();
    });

    it('DEBERÍA guardar alerta y enviar correo si no existen alertas previas', async () => {
      mockAlertaRepo.findOne.mockResolvedValue(null);

      await service.procesarDatoSensor(1, 12.0, 'pH');

      expect(mockAlertaRepo.save).toHaveBeenCalled();
      expect(mockMailService.enviarCorreo).toHaveBeenCalled();
    });

    it('DEBERÍA guardar alerta y enviar correo si la última fue hace más de 30 minutos', async () => {
      // Simulamos una alerta creada hace 40 minutos
      const hace40Minutos = new Date(Date.now() - 40 * 60000);
      mockAlertaRepo.findOne.mockResolvedValue({ fechaCreacion: hace40Minutos });

      await service.procesarDatoSensor(1, 12.0, 'pH');

      expect(mockAlertaRepo.save).toHaveBeenCalled();
      expect(mockMailService.enviarCorreo).toHaveBeenCalled();
    });
  });

  describe('crearAlerta', () => {
    it('debería enviar evento SSE "nueva-alerta" para cualquier tipo de alerta', async () => {
      const dto = { estacionId: 1, mensaje: 'Prueba', tipo: 'INFORMATIVA' };
      await service.crearAlerta(dto.estacionId, dto.mensaje, dto.tipo);

      expect(mockSseService.enviarEvento).toHaveBeenCalledWith(
        expect.any(Object),
        'nueva-alerta'
      );
    });

    it('debería enviar correo solo si el tipo es "CRITICA"', async () => {
      await service.crearAlerta(1, 'Mensaje Crítico', 'CRITICA');
      expect(mockMailService.enviarCorreo).toHaveBeenCalled();

      jest.clearAllMocks();

      await service.crearAlerta(1, 'Mensaje Informativo', 'INFO');
      expect(mockMailService.enviarCorreo).not.toHaveBeenCalled();
    });
  });
  */



