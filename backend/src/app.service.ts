import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  /**
   * Retorna un mensaje de saludo.
   * @returns Cadena de texto de saludo
   */
  Welcome(): string {
    return 'Bienvenido al sistema de monitoreo de calidad del agua!\n Para la documentacion de la Api dirigete a /api/docs\n';
  }
}
