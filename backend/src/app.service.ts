import { Injectable } from '@nestjs/common';

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
