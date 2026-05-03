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

  // Obtenemos el último valor de cada parámetro para la visualización actual
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

  // Determinar la fecha del último muestreo real
  const lastSamplingDate = notifications.length > 0 
    ? new Date(notifications[0].fechaMuestreo).toLocaleString()
    : '--/--/----, --:--:--';

  const isConnected = mounted ? isSensorConnected : false;

  return (
    <main className="dashboard-container">
      {/* Header del Dashboard */}
      <header className="dashboard-header">
        <div className="status-bar">
          <span className={`badge-${isConnected ? 'connected' : 'disconnected'}`}>
            ● {isConnected ? 'Sensores Conectados' : 'Sensores Desconectados'}
          </span>
          <span className="timestamp">
            Último Muestreo: {mounted ? lastSamplingDate : '--/--/----, --:--:--'}
          </span>
        </div>
      </header>

      <div className="dashboard-grid">
        {/* Lado Izquierdo: Estado General */}
        <section className="risk-overview">
          <h3>Estado general</h3>
          <div className="card-main">
            <RiskIndicator 
              nivel={notifications[0]?.irca_calculado > 0 ? "OPERATIVO" : "SIN DATOS"} 
              color={notifications[0]?.irca_calculado > 5 ? "#f59e0b" : notifications[0]?.irca_calculado > 0 ? "#10b981" : "#94a3b8"} 
            />
            <p>
              {notifications.length > 0 
                ? "Resumen basado en el último muestreo recibido de la estación."
                : "No se han recibido datos de muestreo para esta estación recientemente."}
            </p>
          </div>
        </section>

        {/* Lado Derecho: Grilla de Métricas */}
        <section className="metrics-grid">
          <h3>Métricas actuales</h3>
          <div className="grid-container">
            <MetricCard 
              label="pH" 
              value={ph?.valor !== undefined ? ph.valor : '---'} 
              unit="" 
              description="Acidez o alcalinidad del agua" 
              range="6.5 - 9.5" 
              icon="🧪" 
            />
            <MetricCard 
              label="Temperatura" 
              value={temp?.valor !== undefined ? temp.valor : '---'} 
              unit="°C" 
              description="Temperatura actual de la muestra" 
              range="10.0 - 25.0°C" 
              icon="🌡️" 
            />
            <MetricCard 
              label="Turbidez" 
              value={turb?.valor !== undefined ? turb.valor : '---'} 
              unit="NTU" 
              description="Nivel de claridad del agua" 
              range="< 5.0 NTU" 
              icon="🌫️" 
            />
            <MetricCard 
              label="Conductividad" 
              value={cond?.valor !== undefined ? cond.valor : '---'} 
              unit="µS/cm" 
              description="Concentración de sales disueltas" 
              range="300 - 800 µS/cm" 
              icon="⚡" 
            />
            <MetricCard 
              label="Oxígeno Disuelto" 
              value={od?.valor !== undefined ? od.valor : '---'} 
              unit="mg/L" 
              description="Cantidad de O2 disponible" 
              range="> 4.0 mg/L" 
              icon="🫧" 
            />
          </div>
        </section>
      </div>
    </main>
  );
}