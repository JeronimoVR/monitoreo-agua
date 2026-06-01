import React, { useMemo } from 'react';
import { Activity } from 'lucide-react';

interface ChartData { valor: number; hora: string; }

export function IrcaChartCard({ data }: { data: ChartData[] }) {
  // Memoizar los datos para evitar re-renderizados innecesarios
  const chartData = useMemo(() => data, [data]);
  
  // Extraer solo las horas para el eje X
  const horas = useMemo(() => chartData.map(d => d.hora), [chartData]);
  
  // Extraer solo los valores para el gráfico
  const valores = useMemo(() => chartData.map(d => d.valor), [chartData]);

  return (
    <section className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-slate-900 font-extrabold text-lg">Historial de Calidad del Agua (Gráfico IRCA)</h3>
          <Activity size={20} className="text-blue-600" />
        </div>
        <p className="text-slate-500 text-xs font-medium leading-relaxed max-w-2xl">
          El Índice de Riesgo de la Calidad del Agua (IRCA) es un puntaje que clasifica el riesgo para la salud humana.
        </p>
      </div>

      <div className="mt-6 flex gap-3">
        <div className="flex flex-col justify-between text-[10px] font-bold text-slate-400 pb-6 pt-2 text-right w-8">
          <span>100%</span>
          <span>75%</span>
          <span>50%</span>
          <span>25%</span>
          <span>0%</span>
        </div>
        <div className="flex-1 flex flex-col">
          <div className="h-36 w-full bg-slate-50 rounded-xl overflow-hidden flex items-end relative border border-slate-100">
            <SimpleSparkline 
              valores={valores} 
              color="#0056C6" 
            />
          </div>
          <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2 px-2 uppercase tracking-wider">
            {horas.map((hora, i) => (
              <span key={i} suppressHydrationWarning>{hora}</span>
            ))}
          </div>
        </div>
      </div>
      
      
    </section>
  );
}

function SimpleSparkline({ valores, color }: { valores: number[]; color: string }) {
  // Usar useMemo para que el SVG solo se recalcule cuando los valores cambian
  const svgPoints = useMemo(() => {
    if (!valores || valores.length === 0) return null;
    
    const max = 100;
    const min = 0;
    const range = max - min;
    const width = 600;
    const height = 140;
    const padding = 12;

    const points = valores.map((val, index) => {
      const x = valores.length > 1 
        ? (index / (valores.length - 1)) * width 
        : width / 2;
      const y = height - ((val - min) / range) * (height - padding * 2) - padding;
      return `${x},${y}`;
    }).join(' ');

    return points;
  }, [valores]);

  if (!valores || valores.length === 0) {
    return <div className="m-auto text-xs text-slate-300 font-bold">Calculando flujos...</div>;
  }

  return (
    <svg 
      className="w-full h-full" 
      viewBox="0 0 600 140" 
      preserveAspectRatio="none"
      style={{ minHeight: '140px' }}
    >
      {/* Líneas de referencia horizontales */}
      <line x1="0" y1={140 * 0.25} x2={600} y2={140 * 0.25} stroke="#E2E8F0" strokeDasharray="4,4" strokeWidth="1" />
      <line x1="0" y1={140 * 0.5} x2={600} y2={140 * 0.5} stroke="#E2E8F0" strokeDasharray="4,4" strokeWidth="1" />
      <line x1="0" y1={140 * 0.75} x2={600} y2={140 * 0.75} stroke="#E2E8F0" strokeDasharray="4,4" strokeWidth="1" />
      
      {/* Línea base en 0 */}
      <line x1="0" y1={140 - 12} x2={600} y2={140 - 12} stroke="#CBD5E1" strokeWidth="1" />
      
      {/* Área bajo la curva (opcional - para mejor visualización) */}
      <polygon
        fill={`${color}10`}
        points={`${svgPoints} ${600},${140 - 12} 0,${140 - 12}`}
      />
      
      {/* Línea de la curva */}
      <polyline 
        fill="none" 
        stroke={color} 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        points={svgPoints || ''} 
      />
      
      {/* Puntos de datos (opcional - para mejor visualización) */}
      {valores.map((val, idx) => {
        const x = valores.length > 1 
          ? (idx / (valores.length - 1)) * 600 
          : 300;
        const y = 140 - ((val - 0) / 100) * (140 - 24) - 12;
        return (
          <circle
            key={idx}
            cx={x}
            cy={y}
            r="3"
            fill="white"
            stroke={color}
            strokeWidth="2"
          />
        );
      })}
    </svg>
  );
}