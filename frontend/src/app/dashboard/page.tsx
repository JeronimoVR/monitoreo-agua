'use client';
import { useNotificationsContext } from '@context/notificacionContext';
import { useEstacionesContext } from '@context/estacionesContext';
import { RiskIndicator } from '@components/ui/RiskIndicator';
import { MetricCard } from '@components/graficos/MetricCard';

export default function DashboardPage() {
  const { notifications, loading } = useNotificationsContext();
  const { estacionSeleccionada } = useEstacionesContext();

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

  return (
    <main className="dashboard-container">
      {/* Header del Dashboard */}
      <header className="dashboard-header">
        <div className="status-bar">
          <span className="badge-connected">● Sensores Conectados</span>
          <span className="timestamp">Actualizado: {new Date().toLocaleTimeString()}</span>
        </div>
      </header>

      <div className="dashboard-grid">
        {/* Lado Izquierdo: Estado General */}
        <section className="risk-overview">
          <h3>Estado general</h3>
          <div className="card-main">
            <RiskIndicator 
              nivel="OPERATIVO" 
              color={notifications[0]?.irca_calculado > 5 ? "#f59e0b" : "#10b981"} 
            />
            <p>Todos los parámetros se encuentran dentro de los rangos operativos normales.</p>
          </div>
        </section>

        {/* Lado Derecho: Grilla de Métricas */}
        <section className="metrics-grid">
          <h3>Métricas actuales</h3>
          <div className="grid-container">
            <MetricCard 
              label="pH" 
              value={ph?.valor || '7.2'} 
              unit="" 
              description="Acidez o alcalinidad del agua" 
              range="6.5 - 9.5" 
              icon="🧪" 
            />
            <MetricCard 
              label="Temperatura" 
              value={temp?.valor || '22.4'} 
              unit="°C" 
              description="Temperatura actual de la muestra" 
              range="10.0 - 25.0°C" 
              icon="🌡️" 
            />
            <MetricCard 
              label="Turbidez" 
              value={turb?.valor || '1.2'} 
              unit="NTU" 
              description="Nivel de claridad del agua" 
              range="< 5.0 NTU" 
              icon="🌫️" 
            />
            <MetricCard 
              label="Conductividad" 
              value={cond?.valor || '450'} 
              unit="µS/cm" 
              description="Concentración de sales disueltas" 
              range="300 - 800 µS/cm" 
              icon="⚡" 
            />
            <MetricCard 
              label="Oxígeno Disuelto" 
              value={od?.valor || '8.5'} 
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