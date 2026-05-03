'use client';
import { useState, useEffect } from 'react';
import { useNotificationsContext } from '@context/notificacionContext';
import { useEstacionesContext } from '@context/estacionesContext';
import { RiskIndicator } from '@components/ui/RiskIndicator';
import { MetricCard } from '@components/graficos/MetricCard';

export default function DashboardPage() {
  const { notifications, isSensorConnected } = useNotificationsContext();
  const { estacionSeleccionada } = useEstacionesContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getLatestMeasure = (param: string) => {
    for (const n of notifications) {
      const medida = n.medidas?.find(m => m.parametro === param.toUpperCase());
      if (medida) return { ...medida, irca_calculado: n.irca_calculado };
    }
    return null;
  };

  const ph = getLatestMeasure('PH');
  const temp = getLatestMeasure('TEMPERATURA');
  const turb = getLatestMeasure('TURBIDEZ');
  const cond = getLatestMeasure('CONDUCTIVIDAD');
  const od = getLatestMeasure('OXIGENO_DISUELTO');

  const lastSamplingDate = notifications.length > 0 
    ? new Date(notifications[0].fechaMuestreo).toLocaleString()
    : '--/--/----, --:--:--';

  const isConnected = mounted ? isSensorConnected : false;

  return (
    <main className="min-h-screen bg-slate-50 p-[4vw] flex flex-col gap-[3vh]">
      
      {/* Header del Dashboard: Estado de Conectividad (CU009) */}
      <header className="flex flex-col gap-[1vh] sm:flex-row sm:justify-between sm:items-center">
        <div className="flex items-center gap-[2vw]">
          <span className={`px-[3vw] py-[0.5vh] rounded-full text-[0.75rem] font-bold uppercase tracking-wider flex items-center gap-2 ${
            isConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
          }`}>
            <span className={`w-2 h-2 rounded-full animate-pulse ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`} />
            {isConnected ? 'Sensores Conectados' : 'Sensores Desconectados'}
          </span>
        </div>
        <span className="text-slate-400 text-[0.8rem] font-medium">
          Último Muestreo: {mounted ? lastSamplingDate : '--/--/----, --:--:--'}
        </span>
      </header>

      {/* Grid Principal Adaptable */}
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-[4vw] lg:gap-[2vw]">
        
        {/* Lado Izquierdo: Estado General (Enfoque Visual) */}
        <section className="lg:col-span-4 bg-white rounded-[6vw] sm:rounded-[2rem] p-[6vw] sm:p-8 shadow-xl shadow-blue-900/5">
          <h3 className="text-slate-800 font-black text-[1.1rem] mb-[2vh] uppercase tracking-tight">Estado general</h3>
          <div className="flex flex-col items-center">
            <RiskIndicator 
              nivel={notifications[0]?.irca_calculado > 0 ? "OPERATIVO" : "SIN DATOS"} 
              color={notifications[0]?.irca_calculado > 5 ? "#f59e0b" : notifications[0]?.irca_calculado > 0 ? "#10b981" : "#94a3b8"} 
            />
            <p className="text-center text-slate-500 text-[0.9rem] leading-relaxed mt-[2vh]">
              {notifications.length > 0 
                ? "Resumen basado en el último muestreo recibido de la estación."
                : "No se han recibido datos de muestreo para esta estación recientemente."}
            </p>
          </div>
        </section>

        {/* Lado Derecho: Grilla de Métricas (2 columnas en móvil, 3 en desktop) */}
        <section className="lg:col-span-8">
          <h3 className="text-slate-800 font-black text-[1.1rem] mb-[2vh] uppercase tracking-tight">Métricas actuales</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-[3vw] lg:gap-[1.5vw]">
            <MetricCard 
              label="pH" 
              value={ph?.valor ?? '---'} 
              unit="" 
              description="Acidez o alcalinidad" 
              range="6.5 - 9.5" 
              icon="🧪" 
            />
            <MetricCard 
              label="Temp" 
              value={temp?.valor ?? '---'} 
              unit="°C" 
              description="Temperatura muestra" 
              range="10 - 25°C" 
              icon="🌡️" 
            />
            <MetricCard 
              label="Turbidez" 
              value={turb?.valor ?? '---'} 
              unit="NTU" 
              description="Claridad del agua" 
              range="< 5.0" 
              icon="🌫️" 
            />
            <MetricCard 
              label="Cond." 
              value={cond?.valor ?? '---'} 
              unit="µS/cm" 
              description="Sales disueltas" 
              range="300 - 800" 
              icon="⚡" 
            />
            <MetricCard 
              label="Oxígeno" 
              value={od?.valor ?? '---'} 
              unit="mg/L" 
              description="O2 disponible" 
              range="> 4.0" 
              icon="🫧" 
            />
          </div>
        </section>
      </div>
    </main>
  );
}