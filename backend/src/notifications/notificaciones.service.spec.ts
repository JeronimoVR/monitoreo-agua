import { Test, TestingModule } from '@nestjs/testing';
import { NotificacionesService } from './notificaciones.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Alerta } from './alerts/entities/alerta.entity';
import { SseService } from '../common/sse/sse.service';
import { MailService } from '../common/mail/mail.service';
import { Repository } from 'typeorm';
import { UsuariosService } from '../users/usuarios.service';

describe('NotificacionesService (QA - Alertas y Real-time)', () => {
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
});
