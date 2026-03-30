'use client';

import { useState, useMemo } from 'react';
import { useNotificationsContext } from '@context/notificationContext';
import { useEstacionesContext } from '@context/estacionesContext';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Rectangle 
} from 'recharts';
import { 
  Download, 
  AlertCircle, 
  Droplets,
  BarChart2
} from 'lucide-react';
import { Tabbar } from '@components/layout/tabbar';

// --- COMPONENTE DE BARRA PERSONALIZADA (Reemplazo de Cell) ---
const CustomBarShape = (props: any) => {
  const { x, y, width, height, fill, index, payload, color } = props;
  
  // Lógica: La última barra tiene color sólido, las anteriores tienen opacidad
  // 'payload' contiene los datos originales del punto. 
  // Aquí usamos el index para resaltar la más reciente (final del array)
  const isLast = index === 4; 
  const finalFill = isLast ? color : `${color}33`; // 33 es ~20% opacidad en hex

  return (
    <Rectangle 
      {...props} 
      fill={finalFill} 
      radius={[6, 6, 0, 0]} // Bordes redondeados superiores
    />
  );
};

export default function ReportsPage() {
  const { notifications } = useNotificationsContext();
  const { estacionSeleccionada } = useEstacionesContext();
  const [filter, setFilter] = useState('Mes');

  // 1. Lógica de datos para gráficas y métricas
  const { chartData, turbiedadMetrics, phMetrics } = useMemo(() => {
    // Filtrar por parámetro y tomar los últimos para cada uno
    const getParamData = (p: string) => notifications
      .filter(n => n.parametro?.toUpperCase() === p.toUpperCase())
      .slice(0, 10);

    const turbData = getParamData('TURB');
    const phData = getParamData('PH');

    const calculateMetrics = (data: any[]) => {
      if (data.length === 0) return { value: '--', trend: '--' };
      const latest = data[0].valor;
      const previous = data[1]?.valor;
      
      let trend = '--';
      if (previous !== undefined) {
        const diff = ((latest - previous) / previous) * 100;
        trend = `${diff >= 0 ? '↑' : '↓'} ${Math.abs(diff).toFixed(1)}%`;
      }
      
      return { value: latest.toFixed(2), trend };
    };

    const formattedChartData = [...notifications].reverse().map(n => ({
      name: new Date(n.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      valor: n.valor,
      parametro: n.parametro
    })).slice(-5);

    return { 
      chartData: formattedChartData,
      turbiedadMetrics: calculateMetrics(turbData),
      phMetrics: calculateMetrics(phData)
    };
  }, [notifications]);

  // 2. Exportar a CSV
  const exportToCSV = () => {
    if (notifications.length === 0) return;
    const headers = "Fecha,Parametro,Valor\n";
    const rows = notifications.map(n => `${new Date(n.fecha).toLocaleString()},${n.parametro},${n.valor}\n`).join("");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_${new Date().getTime()}.csv`;
    a.click();
  };

  if (notifications.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-10 text-center space-y-4">
        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
          <AlertCircle size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Sin registros</h2>
        <p className="text-slate-500 max-w-xs text-sm">No se han detectado transmisiones del ESP32 recientemente.</p>
        <Tabbar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32 font-sans animate-in fade-in duration-700">
      <header className="p-6 flex justify-between items-center bg-white border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Droplets className="text-[#0047AB] w-6 h-6" />
          <span className="text-xl font-black text-slate-800 tracking-tighter">AquaLab</span>
        </div>
        <div className="flex items-center gap-2 text-emerald-500 font-bold text-[10px] uppercase tracking-widest">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          Sistema operativo
        </div>
      </header>

      <main className="px-6 py-8 space-y-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-none">Análisis Histórico</h1>
            <p className="text-sm text-slate-500 mt-2">Métricas detalladas por estación.</p>
          </div>

          <div className="flex gap-2">
            <button onClick={exportToCSV} className="bg-[#0047AB] text-white px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-100 active:scale-95 transition-all">
              <Download size={14} /> Exportar CSV
            </button>
          </div>
        </div>

        {/* Gráfica de Barras de Turbiedad */}
        <MiniBarChart 
          label="TURBIEDAD" 
          value={turbiedadMetrics.value} 
          unit="NTU" 
          trend={turbiedadMetrics.trend} 
          color="#1e40af" 
          data={notifications.filter(n => n.parametro?.toUpperCase() === 'TURB').slice(0, 5).reverse()} 
        />

        {/* Gráfica de Barras de PH */}
        <MiniBarChart 
          label="PH" 
          value={phMetrics.value} 
          unit="pH" 
          trend={phMetrics.trend} 
          color="#9a3412" 
          data={notifications.filter(n => n.parametro?.toUpperCase() === 'PH').slice(0, 5).reverse()} 
        />

        {/* Tabla de Mediciones Recientes */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50">
            <h3 className="font-bold text-slate-800">Mediciones recientes</h3>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Fecha</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Valor</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {notifications.slice(0, 5).map((n, i) => (
                <tr key={i} className="text-xs">
                  <td className="px-6 py-4 font-bold text-slate-600">
                    {new Date(n.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}<br/>
                    <span className="font-normal text-slate-400">{new Date(n.fecha).toLocaleTimeString()}</span>
                  </td>
                  <td className="px-6 py-4 font-black text-slate-800">{n.valor} {n.parametro}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${n.tipo === 'ALERTA' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {n.tipo === 'ALERTA' ? 'Crítico' : 'Normal'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      <Tabbar />
    </div>
  );
}

// --- SUB-COMPONENTE ACTUALIZADO (Sin Cell) ---
function MiniBarChart({ label, value, unit, trend, color, data }: any) {
  return (
    <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</h4>
        <BarChart2 size={16} className="text-blue-500" />
      </div>
      <div className="h-28 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <Bar 
              dataKey="valor" 
              shape={<CustomBarShape color={color} />} 
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-between items-end">
        <div>
          <span className="text-2xl font-black text-slate-800">{value}</span>
          <span className="text-[10px] text-slate-400 ml-1 font-bold">{unit}</span>
        </div>
        <span className={`text-[10px] font-black ${trend.includes('↑') ? 'text-orange-600' : 'text-emerald-600'}`}>
          {trend}
        </span>
      </div>
    </div>
  );
}