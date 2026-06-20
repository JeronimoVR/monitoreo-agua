import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EmailLog } from './entities/email-log.entity';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    private readonly mailerService: MailerService,
    @InjectRepository(EmailLog)
    private readonly emailLogRepo: Repository<EmailLog>,
  ) { }

  /**
   * Envía un correo electrónico utilizando una plantilla predefinida y registra el intento.
   */
  async enviarCorreo(to: string, subject: string, template: string, context: any) {
    let emailLog = this.emailLogRepo.create({
      destinatario: to,
      asunto: subject,
      template,
      contexto: context,
      estado: 'PENDIENTE',
      reintentos: 0,
    });
    emailLog = await this.emailLogRepo.save(emailLog);

    await this.ejecutarEnvio(emailLog);
  }

  private async ejecutarEnvio(emailLog: EmailLog) {
    const startTime = Date.now();
    try {
      await this.mailerService.sendMail({
        to: emailLog.destinatario,
        subject: emailLog.asunto,
        template: `./${emailLog.template}`,
        context: emailLog.contexto,
      });

      const endTime = Date.now();
      emailLog.estado = 'EXITOSO';
      emailLog.tiempoEnvioMs = endTime - startTime;
      emailLog.error = '';

      await this.emailLogRepo.save(emailLog);

    } catch (error: unknown) {
      const endTime = Date.now();
      emailLog.estado = 'FALLIDO';
      emailLog.tiempoEnvioMs = endTime - startTime;

      const errorMessage = error instanceof Error ? error.message : String(error);
      emailLog.error = errorMessage.substring(0, 500);

      await this.emailLogRepo.save(emailLog);
      this.logger.error(`Error al enviar correo a ${emailLog.destinatario}: ${emailLog.error}`);

      throw error;
    }
  }

  /**
   * Cron job para reintentar correos fallidos por error de SMTP o conexión.
   * Se ejecuta cada 5 minutos.
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async reintentarCorreosFallidos() {
    const fallidos = await this.emailLogRepo.find({
      where: { estado: 'FALLIDO' },
    });

    const reintentables = fallidos.filter(log => log.reintentos < 3);

    if (reintentables.length > 0) {
      this.logger.log(`Iniciando reintento automático de ${reintentables.length} correos fallidos...`);

      for (const log of reintentables) {
        log.reintentos += 1;
        await this.emailLogRepo.save(log);

        this.logger.log(`Reintento #${log.reintentos} para el correo a ${log.destinatario}`);
        try {
          await this.ejecutarEnvio(log);
        } catch {
        }
      }
    }
  }
}
