import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alerta } from './alerts/entities/alerta.entity';
import { SseService } from '../common/sse/sse.service';
import { MailService } from '../common/mail/mail.service';

@Injectable()
export class NotificacionesService {
  constructor(
    @InjectRepository(Alerta)
    private alertaRepo: Repository<Alerta>,
    private sseService: SseService,
    private mailService: MailService,
  ) { }

  async procesarDatoSensor(estacionId: number, valor: number, tipoSensor: string) {
    const limite = 9.0;

    if (valor > limite) {

      const ultimaAlerta = await this.alertaRepo.findOne({
        where: { estacion: { id: estacionId }, tipo: 'CRITICA' },
        order: { fechaCreacion: 'DESC' }
      });

      const hace30Minutos = new Date(Date.now() - 30 * 60000);

      if (!ultimaAlerta || ultimaAlerta.fechaCreacion < hace30Minutos) {
        await this.alertaRepo.save({
          mensaje: `Valor crítico: ${valor} (${tipoSensor})`,
          tipo: 'CRITICA',
          estacion: { id: estacionId }
        });
        await this.mailService.enviarCorreo('admin@tesis.com', 'ALERTA CRÍTICA', 'alerta', { valor });
      }
    }
  }

  async crearAlerta(estacionId: number, mensaje: string, tipo: string) {
    const nuevaAlerta = this.alertaRepo.create({
      mensaje,
      tipo,
      estacion: { id: estacionId }
    });
    const alertaGuardada = await this.alertaRepo.save(nuevaAlerta);

    if (tipo === 'CRITICA') {
      await this.mailService.enviarCorreo('admin@tesis.com', 'ALERTA CRÍTICA', 'alerta', { mensaje });
    }

    return alertaGuardada;
  }

  async obtenerAlertasRecientes() {
    return this.alertaRepo.find({
      relations: ['estacion'],
      order: { fechaCreacion: 'DESC' },
      take: 20,
    });
  }
}

