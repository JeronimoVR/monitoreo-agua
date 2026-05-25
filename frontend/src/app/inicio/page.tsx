'use client';

import { useState, useEffect } from 'react';
import { useNotificationsContext } from '@context/notificacionContext';
import { RiskIndicator } from '@components/ui/RiskIndicator';
import { MapPin, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const { notifications, isSensorConnected } = useNotificationsContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const latest = notifications[0];
  const irca = latest?.irca_calculado ?? 0;

  // Lógica de clasificación e interpretación de rangos técnicos predefinidos
  let nivel = "SIN DATOS";
  let color = "#94a3b8";
  let estadoTexto = "Sin información";
  let estadoDescripcion = "Conecta los sensores para iniciar el análisis automático en tiempo real.";
  let esBuenEstado = true;

  if (isSensorConnected || notifications.length > 0) {
    if (irca === 0 && notifications.length === 0) {
      nivel = "ESPERANDO";
      color = "#3b82f6";
      estadoTexto = "Cargando datos";
      estadoDescripcion = "Estabilizando conexión con los sensores del arroyo...";
    } else if (irca <= 5) {
      nivel = "BAJO";
      color = "#10b981";
      estadoTexto = "El arroyo está en buen estado";
      estadoDescripcion = "El agua del arroyo está en buenas condiciones fisicoquímicas, garantizando un ecosistema adecuado para la preservación de la biodiversidad.";
      esBuenEstado = true;
    } else {
      nivel = irca <= 14 ? "MEDIO" : "ALTO";
      color = irca <= 14 ? "#f59e0b" : "#ef4444";
      estadoTexto = "El arroyo presenta alertas";
      estadoDescripcion = latest?.clasificacionIrca?.descripcion || `Se han detectado desviaciones técnicas en los rangos permisibles (IRCA: ${irca.toFixed(1)}). Se sugiere revisión preventiva.`;
      esBuenEstado = false;
    }
  }

  // Formatear la fecha del muestreo tal como aparece en el diseño refinado
  const formatSamplingDate = (isoString: string) => {
    if (!isoString) return '-- de -- de ---- - --:-- AM';
    const date = new Date(isoString);
    const opciones: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const fechaFormateada = date.toLocaleDateString('es-CO', opciones);
    let horas = date.getHours();
    const minutos = String(date.getMinutes()).padStart(2, '0');
    const ampm = horas >= 12 ? 'AM' : 'PM';
    horas = horas % 12;
    horas = horas ? horas : 12; // el número 0 debe ser 12
    return `${fechaFormateada} - ${horas}:${minutos} ${ampm}`;
  };

  const lastSamplingDate = latest ? formatSamplingDate(latest.fechaMuestreo) : '31 de marzo de 2026 - 10:45 AM';

  return (
    <main className="flex-1 flex flex-col items-center px-6 md:px-12 pt-4 pb-24 bg-[#FAFAFE] w-full max-w-md md:max-w-4xl lg:max-w-5xl mx-auto md:justify-center">
      
      {/* Indicador de Estado Superior Derecho */}
      <div className="w-full flex justify-end mb-4">
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
          isSensorConnected ? 'bg-[#E6F7ED] text-[#10B981]' : 'bg-amber-50 text-amber-600'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isSensorConnected ? 'bg-[#10B981]' : 'bg-amber-500 animate-pulse'}`} />
          {isSensorConnected ? 'Sensores Conectados' : 'Reconectando...'}
        </div>
      </div>

      {/* Sección Central del Anillo del IRCA */}
      <section className="flex flex-col items-center justify-center my-2 w-full">
        <RiskIndicator nivel={nivel} color={color} />
      </section>

      {/* Meta-información de Contexto Geográfico y Temporal */}
      <section className="flex flex-col items-center text-center space-y-1.5 mb-6 px-2">
        <div className="flex items-center justify-center gap-1.5 text-[#6B7280] text-[14px] font-medium">
          <MapPin size={16} className="text-[#9CA3AF]" />
          <span>Ubicación de los sensores: Arroyo Sede Sur, UNIAJC</span>
        </div>
        <div className="flex items-center justify-center gap-1.5 bg-[#F3F4F6] px-2.5 py-0.5 rounded-md text-[#4B5563] text-[12px] font-semibold">
          <Calendar size={13} className="text-[#6B7280]" />
          <span>{mounted ? lastSamplingDate : 'Cargando fecha...'}</span>
        </div>
      </section>

      {/* Card Informativa Descriptiva Consolidada */}
      <section className="bg-white rounded-3xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-100 w-full">
        <h3 className="text-[#0E3B8C] font-extrabold text-2xl text-center leading-tight mb-4">
          ¿Cómo está el arroyo hoy?
        </h3>

        <div className={`text-center font-bold text-[18px] mb-4 ${esBuenEstado ? 'text-[#10B981]' : 'text-amber-500'}`}>
          {estadoTexto}
        </div>

        <div className={`flex gap-3 p-4 rounded-xl items-start ${esBuenEstado ? 'bg-[#E6F7ED]/50 border-l-[4px] border-[#10B981]' : 'bg-amber-50 border-l-[4px] border-amber-500'}`}>
          <div className="mt-0.5 shrink-0">
            {esBuenEstado ? (
              <CheckCircle2 size={18} className="text-[#10B981]" />
            ) : (
              <AlertCircle size={18} className="text-amber-500" />
            )}
          </div>
          <p className="text-[#4B5563] text-[14.5px] leading-relaxed font-medium">
            {estadoDescripcion}
          </p>
        </div>
      </section>

    </main>
  );
}