'use client';

import { useNotificationsContext } from '@context/notificationContext';
import { useEstacionesContext } from '@context/estacionesContext';
import { MetricCard } from '@components/ui/metricCard';
import { RealTimeChart } from '@components/graficos/realTimeChart';
import { 
  Droplets, 
  Thermometer, 
  Zap, 
  Activity, 
  Waves, 
  Search 
} from 'lucide-react';

export default function Dashboard() {
  const { notifications } = useNotificationsContext();
  const { estacionSeleccionada } = useEstacionesContext();

  // Función para obtener el último valor registrado de un parámetro específico
  const getLatestValue = (parametro: string) => {
    const record = notifications.find((n) => n.parametro === parametro);
    return record ? record.valor : '--';
  };

  // Preparamos los datos para el gráfico (invertidos para orden cronológico)
  const chartData = [...notifications].reverse();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Encabezado del Dashboard */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Panel de monitoreo</h1>
          <p className="text-slate-500 text-sm">
            Visualización de datos para: <span className="font-semibold text-blue-600">{estacionSeleccionada?.nombre || 'Seleccione una estación'}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 bg-white border rounded-lg hover:bg-gray-50 transition-colors">
            <Search size={20} className="text-gray-400" />
          </button>
        </div>
      </header>

      {/* Grid de Métricas (5 Columnas para cubrir los sensores del DFRobot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard 
          label="Nivel de pH" 
          value={getLatestValue('pH')} 
          unit="pH" 
          icon={<Droplets />} 
          status={Number(getLatestValue('pH')) > 9 || Number(getLatestValue('pH')) < 6 ? 'alert' : 'normal'}
        />
        <MetricCard 
          label="Oxígeno Dis." 
          value={getLatestValue('DO')} 
          unit="mg/L" 
          icon={<Waves />} 
        />
        <MetricCard 
          label="Temperatura" 
          value={getLatestValue('TEMP')} 
          unit="°C" 
          icon={<Thermometer />} 
        />
        <MetricCard 
          label="Turbidez" 
          value={getLatestValue('TURB')} 
          unit="NTU" 
          icon={<Activity />} 
        />
        <MetricCard 
          label="Conductividad" 
          value={getLatestValue('COND')} 
          unit="µS/cm" 
          icon={<Zap />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de comportamiento (Ocupa 2/3) */}
        <div className="lg:col-span-2">
          <RealTimeChart data={chartData} />
        </div>

        {/* Log de Actividad / Terminal (Ocupa 1/3) */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-lg flex flex-col h-[400px]">
          <div className="p-4 border-b border-slate-800 flex justify-between items-center">
            <h3 className="text-white text-sm font-bold flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              Actividad en tiempo real
            </h3>
            <span className="text-slate-500 text-[10px] font-mono uppercase tracking-widest">Live Stream</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] space-y-2 custom-scrollbar">
            {notifications.length === 0 && (
              <p className="text-slate-600 italic">Estableciendo conexión con los sensores...</p>
            )}
            {notifications.map((n, i) => (
              <div key={i} className="flex gap-2 border-l border-slate-700 pl-2 py-1">
                <span className="text-blue-500 shrink-0">[{new Date(n.fecha).toLocaleTimeString()}]</span>
                <span className={n.tipo === 'ALERTA' ? 'text-red-400' : 'text-slate-300'}>
                  {n.mensaje}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}