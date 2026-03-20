import { Injectable } from '@nestjs/common';
import { Subject, Observable, map } from 'rxjs';

@Injectable()
export class SseService {
  private readonly events$ = new Subject<any>();

  enviarEvento(data: any, tipo: string = 'sensor-update') {
    this.events$.next({ data, tipo });
  }

  getEventStream(): Observable<MessageEvent> {
    return this.events$.asObservable().pipe(
      map((event) => ({
        data: event.data,
        type: event.tipo,
      } as MessageEvent))
    );
  }
}