import { Controller, Sse, MessageEvent } from '@nestjs/common';
import { SseService } from './sse.service';
import { Observable } from 'rxjs';

@Controller('sse')
export class sseController {
  constructor(private readonly sseService: SseService) { }

  @Sse('stream')
  streamEvents(): Observable<MessageEvent> {
    return this.sseService.getEventStream();
  }
}
