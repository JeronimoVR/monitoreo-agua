// src/app/dashboard/page.tsx
'use client';
import { useNotificationsContext } from '@context/notificationContext';
import { MetricCard } from '@components/ui/metricCard';
import { Droplets, Thermometer, Zap, Activity } from 'lucide-react';

export default function Dashboard() {
  const { notifications } = useNotificationsContext();
  
  // Extraemos el último valor de cada parámetro desde el stream
  // Esto es una simplificación, en la vida real filtrarías el array
  const latest = notifications[0] || {}; 

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Panel de Control</h1>
        <p className="text-gray-500">Monitoreo en tiempo real de la estación seleccionada.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          label="Nivel de pH" 
          value={latest.parametro === 'pH' ? latest.valor : '--'} 
          unit="pH" 
          icon={<Droplets />} 
          status={latest.valor > 9 || latest.valor < 6 ? 'alert' : 'normal'}
        />
        <MetricCard 
          label="Temperatura" 
          value={latest.parametro === 'TEMP' ? latest.valor : '--'} 
          unit="°C" 
          icon={<Thermometer />} 
        />
        <MetricCard 
          label="Turbidez" 
          value={latest.parametro === 'TURB' ? latest.valor : '--'} 
          unit="NTU" 
          icon={<Activity />} 
        />
        <MetricCard 
          label="Conductividad" 
          value={latest.parametro === 'COND' ? latest.valor : '--'} 
          unit="µS/cm" 
          icon={<Zap />} 
        />
      </div>

      {/* Aquí iría la lista de alertas recientes */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h3 className="font-bold mb-4">Registro de Alertas Recientes</h3>
        <div className="space-y-4">
          {notifications.slice(0, 5).map((n, i) => (
            <div key={i} className="flex gap-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
              <span className="font-bold">{new Date(n.fecha).toLocaleTimeString()}</span>
              <span>{n.mensaje}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}