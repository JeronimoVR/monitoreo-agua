import { Controller, Get, MessageEvent, Sse } from "@nestjs/common";
import { Observable } from "rxjs";
import { SseService } from "./sse/sse.service";
import { NotificacionesService } from "./notificaciones.service";

@Controller('notificaciones')
export class NotificacionesController {
  constructor(
    private readonly notificacionesService: NotificacionesService,
    private readonly sseService: SseService
  ) {}

  @Get('historial')
  obtenerHistorial() {
    return this.notificacionesService.obtenerAlertasRecientes();
  }
}
