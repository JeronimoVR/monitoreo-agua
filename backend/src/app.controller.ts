import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * Controlador principal de la aplicación.
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  /**
   * Endpoint de prueba para verificar que el API está en funcionamiento.
   * @returns Un mensaje de saludo
   */
  @Get()
  Welcome(): string {
    return this.appService.Welcome();
  }
}
