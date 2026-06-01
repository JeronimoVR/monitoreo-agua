'use client';

import { useMemo, useCallback } from 'react';
import { useNotificationsContext } from '@context/notificacionContext';
import { RiskIndicator } from '@components/ui/RiskIndicator';
import { MapPin, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { SensorStatus } from '@components/graficos/SensorStatus';

export default function DashboardPage() {
  const { notifications, isSensorConnected } = useNotificationsContext();
  const latest = notifications[0];
  const ircaActual = latest?.irca_calculado ?? 0;
  const hasResults = notifications.length > 0;

  // --- CONTROL HORARIO CENTRALIZADO ---
  const normalizarHoraLocal = useCallback((isoString: string) => {
    if (!isoString) return { horaStr: '---', fullStr: '---', fechaFormateada: '---' };

    const fecha = new Date(isoString);

    const horaStr = fecha.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC',
    });

    const fullStr = fecha.toLocaleString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: 'UTC',
    });

    const fechaFormateada = fecha.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    });

    return { horaStr, fullStr, fechaFormateada };
  }, []);

  // --- CLASIFICACIÓN UNIFICADA DE RIESGO CON PALETA DE COLORES OPTIMIZADA ---
  const clasificacion = useMemo(() => {
    // 1. Sin datos o sin conexión inicial
    if (!hasResults && !isSensorConnected) {
      return {
        nivel: 'SIN DATOS',
        nivelIndicador: 'SIN DATOS',
        colorIndicador: '#94a3b8',
        colorTexto: 'text-slate-400',
        bg: 'bg-slate-50',
        border: 'border-slate-200',
        estadoTexto: 'Sin información',
        estadoDescripcion: 'Conecta los sensores para iniciar el análisis automático en tiempo real.',
        esBuenEstado: true,
        alertBg: 'bg-slate-50 border-slate-300',
        alertIconColor: 'text-slate-400'
      };
    }

    // 2. Cargando / Esperando datos
    if (ircaActual === 0 && notifications.length === 0) {
      return {
        nivel: 'ESPERANDO',
        nivelIndicador: 'ESPERANDO',
        colorIndicador: '#3b82f6',
        colorTexto: 'text-blue-600',
        bg: 'bg-blue-50/60',
        border: 'border-blue-200',
        estadoTexto: 'Cargando datos',
        estadoDescripcion: 'Conectando con los sensores del arroyo...',
        esBuenEstado: true,
        alertBg: 'bg-blue-50/30 border-blue-200',
        alertIconColor: 'text-blue-500'
      };
    }

    const backendNivel = latest?.clasificacionIrca?.clasificacion;
    const backendDesc = latest?.clasificacionIrca?.descripcion;

    // 3. Rango: 0% - 5% (SIN RIESGO)
    if (ircaActual <= 5) {
      return {
        nivel: backendNivel || 'SIN RIESGO',
        nivelIndicador: backendNivel || 'SIN RIESGO',
        colorIndicador: '#059669', // Emerald 600
        colorTexto: 'text-emerald-600',
        bg: 'bg-emerald-50/60',
        border: 'border-emerald-200',
        estadoTexto: 'El arroyo está en buen estado',
        estadoDescripcion: backendDesc || 'El agua del arroyo está en buenas condiciones fisicoquímicas, garantizando un ecosistema adecuado para la preservación de la biodiversidad.',
        esBuenEstado: true,
        alertBg: 'bg-emerald-50/40 border-emerald-200',
        alertIconColor: 'text-emerald-600'
      };
    } 
    
    // 4. Rango: 5.1% - 14% (RIESGO BAJO)
    if (ircaActual <= 14) {
      return {
        nivel: backendNivel || 'RIESGO BAJO',
        nivelIndicador: backendNivel || 'RIESGO BAJO',
        colorIndicador: '#16a34a', // Green 600
        colorTexto: 'text-green-600',
        bg: 'bg-green-50/60',
        border: 'border-green-200',
        estadoTexto: 'El arroyo presenta un riesgo bajo',
        estadoDescripcion: backendDesc || `Se han detectado desviaciones técnicas menores en los rangos permisibles (IRCA: ${ircaActual.toFixed(2)}%). Se sugiere control preventivo.`,
        esBuenEstado: true,
        alertBg: 'bg-green-50/40 border-green-200',
        alertIconColor: 'text-green-600'
      };
    }
    
    // 5. Rango: 14.1% - 35% (RIESGO MEDIO)
    if (ircaActual <= 35) {
      return {
        nivel: backendNivel || 'RIESGO MEDIO',
        nivelIndicador: backendNivel || 'RIESGO MEDIO',
        colorIndicador: '#f59e0b', // Amber 500
        colorTexto: 'text-amber-500',
        bg: 'bg-amber-50/60',
        border: 'border-amber-200',
        estadoTexto: 'El arroyo presenta alertas medias',
        estadoDescripcion: backendDesc || `Alerta moderada. El índice de riesgo de la calidad del agua se encuentra en un ${ircaActual.toFixed(2)}%. Requiere atención en las variables alteradas.`,
        esBuenEstado: false,
        alertBg: 'bg-amber-50/50 border-amber-200',
        alertIconColor: 'text-amber-500'
      };
    }
    
    // 6. Rango: 35.1% - 80% (RIESGO ALTO)
    if (ircaActual <= 80) {
      return {
        nivel: backendNivel || 'RIESGO ALTO',
        nivelIndicador: backendNivel || 'RIESGO ALTO',
        colorIndicador: '#ea580c', // Orange 600
        colorTexto: 'text-orange-600',
        bg: 'bg-orange-50/60',
        border: 'border-orange-200',
        estadoTexto: 'Alerta crítica en el arroyo',
        estadoDescripcion: backendDesc || `Atención: El arroyo presenta un índice de riesgo alto del ${ircaActual.toFixed(2)}%. Las condiciones representan una alteración seria de los parámetros estables.`,
        esBuenEstado: false,
        alertBg: 'bg-orange-50/40 border-orange-200',
        alertIconColor: 'text-orange-600'
      };
    }
    
    // 7. Rango: 80.1% - 100% (INVIABLE SANITARIAMENTE)
    return {
      nivel: backendNivel || 'INVIABLE SANITARIAMENTE',
      nivelIndicador: backendNivel || 'INVIABLE SANITARIAMENTE',
      colorIndicador: '#dc2626', // Red 600
      colorTexto: 'text-red-400',
      bg: 'bg-red-50/60',
      border: 'border-red-200',
      estadoTexto: 'Inviable Sanitariamente',
      estadoDescripcion: backendDesc || `Emergencia ambiental: Índice de riesgo crítico (${ircaActual.toFixed(2)}%). El agua supera todos los límites técnicos permitidos.`,
      esBuenEstado: false,
      alertBg: 'bg-red-50/40 border-red-200',
      alertIconColor: 'text-red-600'
    };
  }, [ircaActual, hasResults, isSensorConnected, notifications.length, latest]);

  // Formatear la fecha del muestreo
  const lastSamplingDate = useMemo(() => {
    if (!latest?.fechaMuestreo) return '';
    
    const { fechaFormateada, horaStr } = normalizarHoraLocal(latest.fechaMuestreo);
    return `${fechaFormateada} - ${horaStr}`;
  }, [latest, normalizarHoraLocal]);

  return (
    <main className="min-h-screen bg-[#FAFAFE]">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 xl:px-10 pt-6 pb-12">
        
        {/* BARRA SUPERIOR */}
        <div className="w-full flex flex-row justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6">
          <div className="flex items-center gap-2">
            <svg width="22" height="28" viewBox="0 0 26 33" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-600">
              <path d="M13.4469 28.05C13.7719 28.0225 14.0495 27.8919 14.2797 27.6581C14.5099 27.4244 14.625 27.1425 14.625 26.8125C14.625 26.4275 14.5031 26.1181 14.2594 25.8844C14.0156 25.6506 13.7042 25.5475 13.325 25.575C12.2146 25.6575 11.0365 25.3481 9.79063 24.6469C8.54479 23.9456 7.75937 22.6737 7.43437 20.8312C7.38021 20.5287 7.23802 20.2812 7.00781 20.0888C6.7776 19.8962 6.51354 19.8 6.21563 19.8C5.83646 19.8 5.525 19.9444 5.28125 20.2331C5.0375 20.5219 4.95625 20.8587 5.0375 21.2437C5.49792 23.7463 6.58125 25.5338 8.2875 26.6062C9.99375 27.6787 11.7135 28.16 13.4469 28.05ZM13 33C9.28958 33 6.19531 31.7075 3.71719 29.1225C1.23906 26.5375 0 23.32 0 19.47C0 16.72 1.07656 13.7294 3.22969 10.4981C5.38281 7.26688 8.63958 3.7675 13 0C17.3604 3.7675 20.6172 7.26688 22.7703 10.4981C24.9234 13.7294 26 16.72 26 19.47C26 23.32 24.7609 26.5375 22.2828 29.1225C19.8047 31.7075 16.7104 33 13 33Z" fill="currentColor" />
            </svg>
            <span className="text-[#0E3B8C] font-extrabold text-lg tracking-tight">AquaLab</span>
          </div>
          <SensorStatus isConnected={isSensorConnected} />
        </div>

        {/* CONTENIDO PRINCIPAL - Grid para web */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* COLUMNA IZQUIERDA - Indicador IRCA */}
          <div className="space-y-6">

            {/* Anillo del IRCA */}
            <section className="flex flex-col items-center justify-center w-full">
              <RiskIndicator 
                nivel={clasificacion.nivelIndicador} 
                color={clasificacion.colorIndicador} 
              />
            </section>

            {/* Meta-información Geográfica y Temporal */}
            <section className="flex flex-col items-center text-center space-y-2 px-2">
              <div className="flex items-center justify-center gap-1.5 text-[#6B7280] text-[14px] font-medium">
                <MapPin size={16} className="text-[#9CA3AF]" />
                <span>Ubicación de los sensores: Arroyo Sede Sur, UNIAJC</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 bg-[#F3F4F6] px-3 py-1 rounded-md text-[#4B5563] text-[12px] font-semibold">
                <Calendar size={13} className="text-[#6B7280]" />
                <span suppressHydrationWarning>{lastSamplingDate}</span>
              </div>
            </section>
          </div>

          {/* COLUMNA DERECHA - Card Informativa */}
          <div className="h-full">
            <section className={`bg-white rounded-3xl p-6 md:p-8 shadow-lg border transition-all duration-300 ${clasificacion.border} ${clasificacion.bg} w-full h-full flex flex-col justify-center`}>
              <h3 className="text-[#0E3B8C] font-extrabold text-2xl text-center leading-tight mb-4">
                ¿Cómo está el arroyo hoy?
              </h3>

              <div className={`text-center font-black text-[20px] mb-4 uppercase tracking-wide ${clasificacion.colorTexto}`}>
                {clasificacion.estadoTexto}
              </div>

              {/* Contenedor interno de la Alerta con colores mapeados de la paleta */}
              <div className={`flex gap-3 p-4 rounded-xl items-start border-l-[4px] transition-all duration-300 ${clasificacion.alertBg}`}>
                <div className="mt-0.5 shrink-0">
                  {clasificacion.esBuenEstado ? (
                    <CheckCircle2 size={18} className="text-emerald-600" />
                  ) : (
                    <AlertCircle size={18} className={clasificacion.alertIconColor} />
                  )}
                </div>
                <p className="text-[#4B5563] text-[14.5px] leading-relaxed font-semibold">
                  {clasificacion.estadoDescripcion}
                </p>
              </div>
            </section>
          </div>

        </div>
      </div>
    </main>
  );
}