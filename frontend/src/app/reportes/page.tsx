'use client';

import { useState, useEffect } from 'react';
import { useNotificationsContext } from '@context/notificacionContext';
import { useMuestreoContext } from '@context/muestreoContext';
import { 
  Calendar, Download, AlertTriangle, Activity, 
  Waves, Zap, Thermometer, Wind 
} from 'lucide-react';
import { ParameterCard } from '@components/graficos/ParameterCard';

export default function ReportsPage() {
  const { notifications, isSensorConnected } = useNotificationsContext();
  const { descargarCSV, isExporting } = useMuestreoContext();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const latest = notifications[0];
  const irca = latest?.irca_calculado ?? 0;

  // Lógica para extraer la métrica más reciente por parámetro
  const getLatestMeasure = (paramName: string) => {
    for (const n of notifications) {
      // @ts-ignore - Estructura dinámica en tiempo de ejecución del backend
      const medida = n.medidas?.find(m => m.parametro?.nombre?.toUpperCase() === paramName.toUpperCase());
      if (medida) return { 
        valor: medida.valor, 
        unit: (medida.parametro?.unidadMedida || (medida as any).unidad || '').trim(),
        min: medida.parametro?.valorMinimo ?? 0,
        max: medida.parametro?.valorMaximo ?? 0,
        desc: medida.parametro?.descripcion || '',
        // Historial simulado/real para el gráfico lineal (Sparkline)
        history: notifications
          .map(sample => {
            // @ts-ignore
            const m = sample.medidas?.find(med => med.parametro?.nombre?.toUpperCase() === paramName.toUpperCase());
            return m ? m.valor : null;
          })
          .filter(v => v !== null)
          .reverse()
          .slice(-10) // Últimas 10 muestras
      };
    }
    return null;
  };

  // Mapeo estructurado de parámetros con sus respectivos íconos nativos
  const allParams = [
    { name: 'pH', icon: <Activity size={20} /> },
    { name: 'Turbidez', icon: <Waves size={20} /> },
    { name: 'Conductividad', icon: <Zap size={20} /> },
    { name: 'Temperatura', icon: <Thermometer size={20} /> },
    { name: 'Oxígeno Disuelto', icon: <Wind size={20} /> }
  ].map(p => ({
    ...p,
    data: getLatestMeasure(p.name)
  }));

  // Separar parámetros: Alertas (Fuera de rango) vs Normales
  const alertParams = allParams.filter(p => {
    if (!p.data) return false;
    return p.data.valor < p.data.min || p.data.valor > p.data.max;
  });

  const normalParams = allParams.filter(p => {
    if (!p.data) return true; // Si no hay datos, se queda abajo en espera
    return p.data.valor >= p.data.min && p.data.valor <= p.data.max;
  });

  // Historial del IRCA global para el primer gráfico
  const ircaHistory = notifications.map(n => n.irca_calculado).reverse().slice(-10);

  return (
    <main className="flex-1 flex flex-col px-6 pt-4 pb-24 bg-[#FAFAFE] w-full max-w-md mx-auto space-y-6">
      
      {/* Top Bar con Estado de Conexión */}
      <div className="w-full flex justify-end">
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
          isSensorConnected ? 'bg-[#E6F7ED] text-[#10B981]' : 'bg-amber-50 text-amber-600'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isSensorConnected ? 'bg-[#10B981]' : 'bg-amber-500 animate-pulse'}`} />
          {isSensorConnected ? 'Sensores Conectados' : 'Reconectando...'}
        </div>
      </div>

      {/* Rango de Análisis Temporal */}
      <section className="bg-[#F0F2FA] border border-[#E2E6F5] rounded-xl p-3 flex items-center justify-between text-[#4B5563] text-xs font-semibold">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-[#6B7280]" />
          <span>PERÍODO DE ANÁLISIS:</span>
          <span className="text-[#0E3B8C]">Mar 01 - Mar 31, 2026</span>
        </div>
      </section>

      {/* Acción de Exportación Principal */}
      <button 
        onClick={descargarCSV}
        disabled={isExporting}
        className="w-full bg-[#0056C6] text-white py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2 text-base transition-all active:scale-[0.98] shadow-md shadow-blue-600/10 disabled:opacity-50"
      >
        <Download size={18} className="stroke-[2.5]" />
        {isExporting ? 'Exportando...' : 'Exportar CSV'}
      </button>

      {/* Resumen Ejecutivo Superior (Widgets) */}
      <section className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-4 text-center shadow-[0_4px_15px_rgba(0,0,0,0.01)]">
          <span className="text-xs font-bold text-[#9CA3AF] uppercase block mb-1">Nivel de Riesgo</span>
          <span className="text-[#10B981] font-extrabold text-lg flex items-center justify-center gap-1">
            ✓ BAJO
          </span>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-4 text-center shadow-[0_4px_15px_rgba(0,0,0,0.01)]">
          <span className="text-xs font-bold text-[#9CA3AF] uppercase block mb-1">Puntaje IRCA</span>
          <span className="text-[#111827] font-extrabold text-xl block">{irca.toFixed(1)}%</span>
          <span className="text-[#10B981] text-[11px] font-bold">Riesgo Bajo</span>
        </div>
      </section>

      {/* Tarjeta de Tendencia Global del IRCA */}
      <section className="bg-white border border-slate-100 rounded-3xl p-5 shadow-[0_10px_25px_rgba(0,0,0,0.015)]">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-[#111827] font-extrabold text-lg">Tendencia IRCA</h3>
          <Activity size={18} className="text-[#9CA3AF]" />
        </div>
        <p className="text-[#6B7280] text-xs leading-relaxed font-medium mb-4">
          El Índice de Riesgo de la Calidad del Agua (IRCA) es un puntaje que evalúa la potabilidad. Permite identificar preventivamente niveles de contaminación.
        </p>
        {/* Gráfico Sparkline del IRCA */}
        <div className="h-20 w-full bg-slate-50/50 rounded-xl overflow-hidden flex items-end">
          <SimpleSparkline data={ircaHistory} color="#0056C6" />
        </div>
        <div className="flex justify-between text-[10px] text-[#9CA3AF] font-bold mt-2 px-1">
          <span>01 Oct</span>
          <span>15 Oct</span>
          <span>31 Oct</span>
        </div>
      </section>

      {/* ⚠️ SECCIÓN CRÍTICA: ALERTAS ACTUALES (Solo si hay parámetros fuera de rango) */}
      {mounted && alertParams.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-[#EF4444] font-extrabold text-base uppercase tracking-wider px-1">
            <AlertTriangle size={18} className="fill-[#EF4444] text-white" />
            <h3>Alertas Actuales</h3>
          </div>
          <div className="flex flex-col gap-4">
            {alertParams.map((p, idx) => (
              <ParameterCard 
                key={idx}
                name={p.name}
                icon={p.icon}
                value={p.data?.valor ?? '---'}
                unit={p.data?.unit ?? ''}
                min={p.data?.min ?? 0}
                max={p.data?.max ?? 0}
                description={p.data?.desc ?? ''}
                history={p.data?.history || []}
                isAlert={true}
              />
            ))}
          </div>
        </section>
      )}

      {/* SECCIÓN GENERAL: ANÁLISIS DE PARÁMETROS (Resto de métricas en rango normal) */}
      <section className="space-y-3 pt-2">
        <h3 className="text-[#111827] font-extrabold text-lg px-1">Análisis de Parámetros</h3>
        <div className="flex flex-col gap-4">
          {normalParams.map((p, idx) => (
            <ParameterCard 
              key={idx}
              name={p.name}
              icon={p.icon}
              value={p.data?.valor ?? '---'}
              unit={p.data?.unit ?? ''}
              min={p.data?.min ?? 0}
              max={p.data?.max ?? 0}
              description={p.data?.desc ?? ''}
              history={p.data?.history || []}
              isAlert={false}
            />
          ))}
        </div>
      </section>

    </main>
  );
}

// Subcomponente atómico local ultra-ligero para dibujar las curvas de tendencia en SVG puro
function SimpleSparkline({ data, color }: { data: number[], color: string }) {
  if (!data || data.length === 0) return <div className="m-auto text-xs text-slate-300">Sin histórico</div>;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min;
  const width = 350;
  const height = 70;
  
  const points = data.map((val, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 10) - 5;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg className="w-full h-full p-2" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polyline fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}