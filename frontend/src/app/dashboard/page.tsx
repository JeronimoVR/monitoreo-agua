'use client';
import { useState, useEffect } from 'react';
import { useNotificationsContext } from '@context/notificacionContext';
import { RiskIndicator } from '@components/ui/RiskIndicator';
import { MetricCard } from '@components/graficos/MetricCard';
import { Droplets, Waves, Zap, Thermometer, Wind, Activity } from 'lucide-react';

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

  const icons = [
    <Activity size={24} />, 
    <Waves size={24} />, 
    <Zap size={24} />, 
    <Thermometer size={24} />, 
    <Wind size={24} />
  ];

  return (
    <main className="p-[5vw] flex flex-col gap-[4vh]">
      
      {/* Page Header */}
      <section className="flex flex-col gap-[1vh]">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-slate-800 font-black text-[1.5rem] tracking-tight uppercase leading-none">
              Panel de Control
            </h2>
            <p className="text-slate-500 font-medium text-[0.9rem] mt-[0.5vh]">
              Monitoreo en tiempo real de la estación.
            </p>
          </div>
          <div className="text-right">
            <span className="text-slate-400 text-[0.7rem] font-bold uppercase tracking-widest block">
              Muestreo
            </span>
            <span className="text-slate-600 text-[0.8rem] font-medium">
              {mounted ? lastSamplingDate : '--/--/----, --:--:--'}
            </span>
          </div>
        </div>
        
        <div className="h-[0.5vh] w-full bg-slate-100 rounded-full overflow-hidden mt-[1vh]">
          <div className="h-full bg-blue-600 w-[40%] rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"></div>
        </div>
      </section>

      {/* Grid Principal */}
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-[5vw] lg:gap-[2vw]">
        
        {/* Lado Izquierdo: Análisis Dinámico */}
        <section className="lg:col-span-5 bg-white rounded-[8vw] sm:rounded-[2rem] p-[8vw] sm:p-10 shadow-xl shadow-blue-900/5 flex flex-col border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[30vw] h-[30vw] bg-blue-50/50 rounded-full -mr-[15vw] -mt-[15vw] z-0"></div>
          
          <div className="relative z-10">
            <h3 className="text-slate-800 font-black text-[1.1rem] mb-[1vh] uppercase tracking-tight">Análisis de Calidad</h3>
            <div className="flex flex-col items-center flex-1 justify-center py-[2vh]">
              <RiskIndicator 
                nivel={latest?.clasificacionIrca?.clasificacion || (latest ? (latest.irca_calculado > 35 ? "ALTO" : "BAJO") : "SIN DATOS")} 
                color={riskColor} 
              />
              <div className="mt-[2vh] text-center">
                <p className="text-slate-800 font-bold text-[1.2rem] mb-2 uppercase tracking-wide">
                  RIESGO {latest?.clasificacionIrca?.clasificacion || (latest ? (latest.irca_calculado > 35 ? "ALTO" : "BAJO") : "Esperando datos...")}
                </p>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-slate-500 text-[0.9rem] leading-relaxed">
                    {latest?.clasificacionIrca?.descripcion || "Conecta los sensores para iniciar el análisis automático en tiempo real."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Lado Derecho: Métricas Dinámicas */}
        <section className="lg:col-span-7 flex flex-col gap-[2.5vh]">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-800 font-black text-[1.1rem] uppercase tracking-tight">Parámetros Críticos</h3>
            <div className="px-[3vw] py-[0.5vh] bg-blue-50 text-blue-600 rounded-full text-[0.7rem] font-bold">
              ESTACIÓN: SITIO DE PRUEBA
            </div>
          </div>
          
          <div className="flex flex-col gap-[2vh]">
            {params.map((p, idx) => {
              const val = p.data?.valor ?? '---';
              const range = p.data ? `${p.data.min} - ${p.data.max}` : '---';
              return (
                <MetricCard 
                  key={idx}
                  label={p.name} 
                  value={val} 
                  unit={p.data?.unit || ''} 
                  description={p.data?.desc || 'Esperando parámetro...'} 
                  range={range} 
                  icon={icons[idx] || <Activity size={24} />} 
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