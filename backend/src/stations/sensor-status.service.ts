import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { SseService } from '../common/sse/sse.service';

type SensorState = {
  lastSeenMs: number;
  online: boolean;
};

@Injectable()
export class SensorStatusService {
  private readonly states = new Map<number, SensorState>();

  private readonly offlineAfterMs = 30_000;

  constructor(private readonly sseService: SseService) {}

  recordHeartbeat(estacionId: number) {
    if (!Number.isFinite(estacionId)) return;
    const current = this.states.get(estacionId);
    const now = Date.now();
    const wasOffline = current ? !current.online : true;

    this.states.set(estacionId, { lastSeenMs: now, online: true });

    if (wasOffline) {
      this.sseService.enviarEvento({ estacionId, status: 'online', ts: new Date(now).toISOString() }, 'status-sensores');
    }
  }

  recordStatus(estacionId: number, status: string) {
    if (!Number.isFinite(estacionId)) return;
    const normalized = String(status || '').toLowerCase();
    const online = normalized === 'online' || normalized === 'on' || normalized === '1' || normalized === 'true';
    const now = Date.now();

    this.states.set(estacionId, { lastSeenMs: now, online });
    this.sseService.enviarEvento({ estacionId, status: online ? 'online' : 'offline', ts: new Date(now).toISOString() }, 'status-sensores');
  }

  @Interval(5_000)
  checkOffline() {
    const now = Date.now();
    for (const [estacionId, state] of this.states.entries()) {
      if (!state.online) continue;
      if (now - state.lastSeenMs > this.offlineAfterMs) {
        this.states.set(estacionId, { lastSeenMs: state.lastSeenMs, online: false });
        this.sseService.enviarEvento({ estacionId, status: 'offline', ts: new Date(now).toISOString() }, 'status-sensores');
      }
    }
  }
}

