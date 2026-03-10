import { Injectable } from '@nestjs/common';

/**
 * Servicio principal de la aplicación.
 */
@Injectable()
export class AppService {
  /**
   * Retorna un mensaje de saludo.
   * @returns Cadena de texto de saludo
   */
  getHello(): string {
    return 'Hello World!';
  }
}
