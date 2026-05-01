import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  /**
   * Envía un correo electrónico utilizando una plantilla predefinida.
   * 
   * @param to Dirección de correo del destinatario.
   * @param subject Asunto del correo.
   * @param template Nombre de la plantilla Handlebars a usar (sin extensión).
   * @param context Objeto con datos para inyectar en la plantilla.
   */
  async enviarCorreo(to: string, subject: string, template: string, context: any) {
    await this.mailerService.sendMail({
      to,
      subject,
      template: `./${template}`,
      context,
    });
  }
}
