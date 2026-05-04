'use client';
import { useState, useEffect } from 'react';
import { useNotificationsContext } from '@context/notificacionContext';
import { useEstacionesContext } from '@context/estacionesContext';
import { RiskIndicator } from '@components/ui/RiskIndicator';
import { MetricCard } from '@components/graficos/MetricCard';
import { Parametro } from '@shared/sampling/dto/parametro.dto';

export default function DashboardPage() {
  const { notifications } = useNotificationsContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getLatestMeasure = (paramName: string) => {
    for (const n of notifications) {
      // @ts-ignore - En tiempo de ejecución el backend envía el objeto completo 'parametro'
      const medida = n.medidas?.find(m => m.parametro?.nombre?.toUpperCase() === paramName.toUpperCase());
      if (medida) return { 
        valor: medida.valor, 
        unit: medida.parametro?.unidadMedida || '',
        min: medida.parametro?.valorMinimo ?? 0,
        max: medida.parametro?.valorMaximo ?? 0,
        desc: medida.parametro?.descripcion || ''
      };
    }
    return null;
  };


  const getStatus = (val: number | string, min: number, max: number) => {
    if (val === '---' || val === undefined) return 'normal';
    const numVal = Number(val);
    if (numVal < min || numVal > max) return 'critical';
    return 'normal';
  };

  const latest = notifications[0];
  const lastSamplingDate = latest 
    ? new Date(latest.fechaMuestreo).toLocaleString()
    : '--/--/----, --:--:--';

  // Parámetros dinámicos desde la base de datos
  const params = ['pH', 'Turbidez', 'Conductividad', 'Temperatura', 'Oxígeno Disuelto'].map(name => ({
    name,
    data: getLatestMeasure(name)
  }));

  const riskColor = latest?.irca_calculado > 35 ? "#ef4444" : latest?.irca_calculado > 5 ? "#f59e0b" : latest?.irca_calculado > 0 ? "#10b981" : "#94a3b8";

  return (
    <main className="p-[4vw] flex flex-col gap-[3vh]">
      
      {/* Sub-header con información de tiempo */}
      <div className="flex justify-between items-center px-2">
        <h2 className="text-slate-400 text-[0.75rem] font-black uppercase tracking-widest">
          Estación: SITIO DE PRUEBA
        </h2>
        <span className="text-slate-400 text-[0.75rem] font-medium">
          Muestreo: {mounted ? lastSamplingDate : '--/--/----, --:--:--'}
        </span>
      </div>

      {/* Grid Principal */}
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-[4vw] lg:gap-[2vw]">
        
        {/* Lado Izquierdo: Análisis Dinámico */}
        <section className="lg:col-span-4 bg-white rounded-[6vw] sm:rounded-[2rem] p-[6vw] sm:p-8 shadow-xl shadow-blue-900/5 flex flex-col border border-slate-100">
          <h3 className="text-slate-800 font-black text-[1.1rem] mb-[2vh] uppercase tracking-tight">Análisis de Riesgo</h3>
          <div className="flex flex-col items-center flex-1 justify-center">
            <RiskIndicator 
              nivel={latest?.clasificacionIrca?.clasificacion || (latest ? "SIN RIESGO" : "SIN DATOS")} 
              color={riskColor} 
            />
            <div className="mt-[2vh] text-center">
              <p className="text-slate-800 font-bold text-[1rem] mb-2 uppercase tracking-wide">
                {latest?.clasificacionIrca?.clasificacion || "Esperando datos..."}
              </p>
              <p className="text-slate-500 text-[0.85rem] leading-relaxed">
                {latest?.clasificacionIrca?.descripcion || "Conecta los sensores para iniciar el análisis automático de la calidad del agua en tiempo real."}
              </p>
            </div>
          </div>
        </section>

        {/* Lado Derecho: Métricas Dinámicas */}
        <section className="lg:col-span-8">
          <h3 className="text-slate-800 font-black text-[1.1rem] mb-[2vh] uppercase tracking-tight">Métricas en Tiempo Real</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-[3vw] lg:gap-[1.5vw]">
            {params.map((p, idx) => {
              const val = p.data?.valor ?? '---';
              const range = p.data ? `${p.data.min} - ${p.data.max}` : '---';
              const icons = ['🧪', '🌫️', '⚡', '🌡️', '🫧'];
              return (
                <MetricCard 
                  key={idx}
                  label={p.name} 
                  value={val} 
                  unit={p.data?.unit || ''} 
                  description={p.data?.desc || 'Esperando parámetro...'} 
                  range={range} 
                  icon={icons[idx] || '📊'} 
                  status={getStatus(val, p.data?.min || 0, p.data?.max || 0)}
                />
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}