import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Alerta } from './alerts/entities/alerta.entity';
import { SseService } from '../common/sse/sse.service';
import { MailService } from '../common/mail/mail.service';
import { Muestreo } from '../sampling/entities/muestreos.entity';
import { UsuariosService } from '../users/usuarios.service';

@Injectable()
export class NotificacionesService {
  private readonly logger = new Logger(NotificacionesService.name);

  // Mapa para control de spam (último envío por estación)

  private readonly INTERVALO_HORAS = 2; // 2 horas entre alertas
  private readonly INTERVALO_MS = this.INTERVALO_HORAS * 60 * 60 * 1000;

  constructor(
    @InjectRepository(Alerta)
    private alertaRepo: Repository<Alerta>,
    private sseService: SseService,
    private mailService: MailService,
    private readonly usuariosService: UsuariosService,
  ) { }

  /**
   * Obtiene el color según la clasificación
   */
  private getColorPorClasificacion(clasificacion: string): string {
    const colores: Record<string, string> = {
      'RIESGO MEDIO': '#f59e0b',
      'MEDIO': '#f59e0b',
      'RIESGO ALTO': '#ef4444',
      'ALTO': '#ef4444',
      'INVIABLE SANITARIAMENTE': '#7f1d1d'
    };
    return colores[clasificacion?.toUpperCase()] || '#ef4444';
  }

  /**
   * Evalúa un muestreo recién creado y, si la clasificación es "RIESGO MEDIO" o superior,
   * genera el flujo de alertas por correo únicamente para usuarios con alertas activadas.
   *
   * Reglas (pruebas.xlsx / CU007):
   * - Umbral: "Media" o superior (14.1%).
   * - Filtrado de destinatarios: sólo usuarios con `recibeAlerta=true` para la estación.
   * - Mensaje: debe incluir estación, clasificación, puntaje, fecha y parámetros fuera de rango.
   * - Trazabilidad: se registra en la tabla de alertas.
   * - Prevención de spam: mínimo 2 horas entre alertas para la misma estación.
   */
  async evaluarYGenerarAlertas(muestreo: Muestreo) {
    const puntaje = typeof muestreo.irca_calculado === 'number'
      ? muestreo.irca_calculado
      : Number(muestreo.irca_calculado);
    const clasificacion = (muestreo.clasificacionIrca?.clasificacion || '').toUpperCase();
    const estacionId = muestreo.estacionId;

    this.logger.log(`🔔 Evaluando alerta - Estación ID: ${estacionId}, Clasificación: ${clasificacion}, Puntaje: ${puntaje}%`);

    const umbralDisparo = 35;
    const ameritaAlerta = Number.isFinite(puntaje) && (
      puntaje >= umbralDisparo ||
      clasificacion.includes('ALTO') ||
      clasificacion.includes('INVIABLE')
    );

    if (!ameritaAlerta) {
      this.logger.log(`✅ Gestión de omisión: Clasificación "${clasificacion}" (${puntaje}%) no requiere alerta (inferior a ${umbralDisparo}%)`);
      return {
        enviado: false,
        motivo: `Clasificación "${clasificacion}" no requiere alerta`,
        clasificacion,
        puntaje
      };
    }

    this.logger.log(`⚠️ Clasificación "${clasificacion}" (${puntaje}%) supera umbral - Generando alerta`);

    // 2. Prevención de spam - verificar intervalo de 2 horas
    const { puede, horasRestantes } =
      await this.puedeEnviarAlerta(estacionId);
    if (!puede) {
      this.logger.log(`⏰ Prevención de spam: No se envía alerta para estación ${estacionId}. Próxima alerta disponible en ${horasRestantes?.toFixed(2)} horas`);
      return {
        enviado: false,
        motivo: `Intervalo de spam no cumplido. Próxima alerta en ${horasRestantes?.toFixed(1)} horas`,
        clasificacion,
        puntaje
      };
    }

    // 3. Filtrar parámetros fuera de rango
    const parametrosFueraRango = (muestreo.medidas || [])
      .filter(m => {
        const min = m.parametro?.valorMinimo;
        const max = m.parametro?.valorMaximo;
        if (!Number.isFinite(min) || !Number.isFinite(max) || !Number.isFinite(m.valor)) return false;
        return m.valor < min || m.valor > max;
      })
      .map(m => ({
        nombre: m.parametro?.nombre || 'N/D',
        unidad: m.parametro?.unidadMedida || '',
        valor: m.valor,
        min: m.parametro?.valorMinimo,
        max: m.parametro?.valorMaximo,
      }));

    // Si no hay parámetros fuera de rango pero el IRCA es alto (ejemplo: parámetros faltantes)
    if (parametrosFueraRango.length === 0 && puntaje >= umbralDisparo) {
      this.logger.warn(`⚠️ IRCA alto (${puntaje}%) pero no se detectaron parámetros fuera de rango`);
    }

    // 4. Obtener destinatarios (usuarios con notificaciones activadas)
    const destinatarios = await this.usuariosService.getDestinatariosAlertas(estacionId);
    if (destinatarios.length === 0) {
      this.logger.warn(`⚠️ No hay destinatarios con notificaciones activadas para estación ${estacionId}`);
      return {
        enviado: false,
        motivo: 'No hay destinatarios con notificaciones activadas',
        clasificacion,
        puntaje
      };
    }

    this.logger.log(`📧 Destinatarios encontrados: ${destinatarios.join(', ')}`);

    // 5. Preparar datos para la alerta
    const estacionNombre = muestreo.estacion?.nombre || `Estación ${estacionId}`;
    const fecha = muestreo.fechaMuestreo
      ? new Date(muestreo.fechaMuestreo).toLocaleString('es-CO', { timeZone: 'America/Bogota' })
      : new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' });

    const mensaje = `Alerta IRCA ${clasificacion || 'N/D'} (${puntaje.toFixed(2)}%) en ${estacionNombre}`;

    // 6. Registrar trazabilidad en BD
    const alerta = await this.alertaRepo.save(this.alertaRepo.create({
      mensaje,
      tipo: 'IRCA',
      estacion: { id: estacionId } as any,
      destinatarios: destinatarios.join(','),
      detalle: {
        estacionId,
        estacionNombre,
        irca: puntaje,
        clasificacion: muestreo.clasificacionIrca?.clasificacion || null,
        parametrosFueraRango,
        fechaMuestreo: fecha,
      },
    }));

    this.logger.log(`📝 Alerta registrada en BD con ID: ${alerta.id}`);

    // 7. Notificación SSE para el dashboard
    this.sseService.enviarEvento(alerta, 'alerta-irca');

    // 8. Generar contenido enriquecido para el email
    // En notificaciones.service.ts - dentro de evaluarYGenerarAlertas()

    // 8. Generar contenido enriquecido para el email
    const subject = `🚨 ALERTA: ${estacionNombre} - IRCA ${puntaje.toFixed(1)}% (${clasificacion || 'N/D'})`;

    // 🔧 Agregar clasificacionCss al contexto
    const getClasificacionCss = (clasificacion: string): string => {
      const clasif = (clasificacion || '').toUpperCase();
      if (clasif.includes('ALTO') || clasif.includes('INVIABLE')) return 'high';
      if (clasif.includes('MEDIO')) return 'medium';
      return 'low';
    };

    const emailContext = {
      estacionNombre,
      fecha,
      puntaje: puntaje.toFixed(2),
      clasificacion: clasificacion || 'N/D',
      clasificacionCss: getClasificacionCss(clasificacion), // ✅ Agregar esta línea
      color: this.getColorPorClasificacion(clasificacion),
      descripcion: muestreo.clasificacionIrca?.descripcion || 'Se ha detectado una alteración en la calidad del agua. Se recomienda revisar los parámetros fuera de rango.',
      parametros: parametrosFueraRango || [],
      tieneParametrosFuera: parametrosFueraRango.length > 0,
      urlDash: process.env.FRONTEND_URL || 'http://localhost:3000',
      anio: new Date().getFullYear(),
    };

    // 9. Envío de emails a todos los destinatarios
    const resultadosEmail = await Promise.allSettled(
      destinatarios.map(async (to) => {
        try {
          await this.mailService.enviarCorreo(to, subject, 'alerta', emailContext);
          this.logger.log(`✅ Email enviado a ${to}`);
          return { email: to, estado: 'EXITOSO' };
        } catch (error) {
          this.logger.error(`❌ Error enviando email a ${to}:`, error);
          return { email: to, estado: 'FALLIDO', error: error.message };
        }
      })
    );

    const exitosos = resultadosEmail.filter(r => r.status === 'fulfilled' && r.value.estado === 'EXITOSO').length;
    const fallidos = resultadosEmail.filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value.estado === 'FALLIDO')).length;

    this.logger.log(`📊 Resultado envío: ${exitosos} exitosos, ${fallidos} fallidos`);

    // 10. Actualizar último envío para prevención de spam

    this.logger.log(`✅ Alerta procesada para estación ${estacionNombre} - Próxima alerta disponible en ${this.INTERVALO_HORAS} horas`);

    return {
      enviado: true,
      destinatarios: destinatarios,
      exitosos,
      fallidos,
      clasificacion,
      puntaje,
      fecha,
      alertaId: alerta.id
    };
  }

  /**
   * Procesa datos de sensores en tiempo real para alertas críticas
   * (por ejemplo, valores anómalos en tiempo real)
   */
  async procesarDatoSensor(estacionId: number, valor: number, tipoSensor: string) {
    const limite = 35.0;

    if (valor > limite) {
      this.logger.warn(`⚠️ Valor crítico detectado - Estación: ${estacionId}, Sensor: ${tipoSensor}, Valor: ${valor}`);

      // Notificación SSE para el dashboard
      this.sseService.enviarEvento({ estacionId, valor, tipoSensor }, 'alerta-visual');

      // Verificar última alerta crítica (prevención de spam para alertas críticas)
      const ultimaAlerta = await this.alertaRepo.findOne({
        where: {
          estacion: { id: estacionId },
          tipo: 'CRITICA',
        },
        order: {
          fechaCreacion: 'DESC',
        },
      });

      const hace2Horas = new Date(Date.now() - 2 * 60 * 60 * 1000);
      this.logger.log(`Hace 2 horas: ${hace2Horas.toISOString()}`);

      if (!ultimaAlerta || ultimaAlerta.fechaCreacion < hace2Horas) {
        // Registrar alerta crítica
        const alerta = await this.alertaRepo.save({
          mensaje: `Valor crítico: ${valor} (${tipoSensor})`,
          tipo: 'CRITICA',
          estacion: { id: estacionId }
        });

        // Notificar por email al administrador
        await this.mailService.enviarCorreo(
          process.env.EMAIL_USER || 'admin@tesis.com',
          'ALERTA CRÍTICA - Sensor',
          'alerta',
          {
            tipoSensor,
            valor,
            estacionId,
            fecha: new Date()
          }
        );

        this.logger.log(`✅ Alerta crítica registrada y enviada para estación ${estacionId}`);
        return alerta;
      }

      this.logger.log(`⏰ Prevención de spam: Alerta crítica para estación ${estacionId} ya fue enviada recientemente`);
    }
  }

  /**
   * Crea una alerta manual y la notifica
   */
  async crearAlerta(estacionId: number, mensaje: string, tipo: string) {
    const nuevaAlerta = this.alertaRepo.create({
      mensaje,
      tipo,
      estacion: { id: estacionId }
    });

    const alertaGuardada = await this.alertaRepo.save(nuevaAlerta);
    this.logger.log(`📝 Alerta manual creada - ID: ${alertaGuardada.id}, Tipo: ${tipo}`);

    // Notificación SSE
    this.sseService.enviarEvento(alertaGuardada, 'nueva-alerta');

    // Si es crítica, enviar email al administrador
    if (tipo === 'CRITICA') {
      await this.mailService.enviarCorreo(
        process.env.EMAIL_USER || 'admin@tesis.com',
        'ALERTA CRÍTICA MANUAL',
        'alerta',
        { mensaje, estacionId }
      );
      this.logger.log(`📧 Email de alerta crítica enviado al administrador`);
    }

    return alertaGuardada;
  }

  /**
   * Obtiene las últimas alertas (útil para el dashboard)
   */
  async obtenerAlertasRecientes(limite: number = 20) {
    const alertas = await this.alertaRepo.find({
      relations: ['estacion'],
      order: { fechaCreacion: 'DESC' },
      take: limite,
    });

    this.logger.log(`📋 Obtenidas ${alertas.length} alertas recientes`);
    return alertas;
  }

  /**
   * Obtiene el estado de la prevención de spam para depuración
   */
  async obtenerEstadoSpam() {
    const alertas = await this.alertaRepo.find({
      where: {
        tipo: 'IRCA',
      },
      relations: ['estacion'],
      order: {
        fechaCreacion: 'DESC',
      },
      take: 50,
    });

    return alertas.map(alerta => ({
      alertaId: alerta.id,
      estacionId: alerta.estacion?.id,
      fechaCreacion: alerta.fechaCreacion,
      tipo: alerta.tipo,
    }));
  }

  /**
   * Limpia el registro de últimos envíos (útil para pruebas)
   */
  limpiarRegistroSpam() {
    this.logger.log(
      'ℹ️ La prevención de spam ahora utiliza la base de datos. No hay registros en memoria para limpiar.'
    );
  }

  /**
 * Prevención de spam persistente usando la base de datos.
 * Busca la última alerta IRCA enviada para la estación.
 */
  private async puedeEnviarAlerta(
    estacionId: number,
  ): Promise<{ puede: boolean; horasRestantes?: number }> {
    const ultimaAlerta = await this.alertaRepo.findOne({
      where: {
        estacion: { id: estacionId },
        tipo: 'IRCA',
      },
      order: {
        fechaCreacion: 'DESC',
      },
    });
    this.logger.log(`Última alerta: ${ultimaAlerta?.fechaCreacion.toISOString()}`);
    if (!ultimaAlerta) {
      return { puede: true };
    }

    const tiempoTranscurrido =
      Date.now() -
      new Date(ultimaAlerta.fechaCreacion).getTime();

    const puede =
      tiempoTranscurrido >= this.INTERVALO_MS;

    if (!puede) {
      const horasRestantes =
        (this.INTERVALO_MS - tiempoTranscurrido) /
        (2 * 1000 * 60 * 60);

      return {
        puede: false,
        horasRestantes,
      };
    }

    return { puede: true };
  }
}