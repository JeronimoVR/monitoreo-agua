import { Injectable } from '@nestjs/common';
import { SseService } from '../common/sse/sse.service';

@Injectable()
export class SensorStatusService {
  constructor(private readonly sseService: SseService) {}

  recordHeartbeat(estacionId: number) {
    if (!Number.isFinite(estacionId)) return;
    const now = Date.now();
    this.sseService.enviarEvento({ estacionId, status: 'online', ts: new Date(now).toISOString() }, 'status-sensores');
  }

  recordStatus(estacionId: number, status: string) {
    if (!Number.isFinite(estacionId)) return;
    const normalized = String(status || '').toLowerCase();
    const online = normalized === 'online' || normalized === 'on' || normalized === '1' || normalized === 'true';
    const now = Date.now();

    this.sseService.enviarEvento({ estacionId, status: online ? 'online' : 'offline', ts: new Date(now).toISOString() }, 'status-sensores');
  }
}

