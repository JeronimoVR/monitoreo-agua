import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificacionesService } from './notificaciones.service';
import { NotificacionesController } from './notificaciones.controller';
import { SseService } from './sse/sse.service';
import { Alerta } from './alerts/entities/alerta.entity';
import { MailModule } from './mail/mail.module';
import { sseController } from './sse/sse.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Alerta]),
    MailModule,
  ],
  controllers: [NotificacionesController, sseController],
  providers: [NotificacionesService, SseService],
  exports: [NotificacionesService, SseService],
})
export class NotificacionesModule {}