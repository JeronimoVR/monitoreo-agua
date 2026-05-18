import { Controller, Sse, MessageEvent } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SseService } from './sse.service';
import { Observable } from 'rxjs';

@ApiTags('SSE (Real-time)')
@Controller('sse')
export class sseController {
  constructor(private readonly sseService: SseService) { }

  @Sse('stream')
  @ApiOperation({ 
    summary: 'Stream de eventos en tiempo real', 
    description: 'Establece una conexión de Server-Sent Events para recibir actualizaciones en tiempo real (ej. nuevos muestreos, cambios de estado de sensores).' 
  })
  @ApiResponse({ status: 200, description: 'Conexión SSE establecida exitosamente.' })
  streamEvents(): Observable<MessageEvent> {
    return this.sseService.getEventStream();
  }
}
