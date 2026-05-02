'use client';
import { useState } from 'react';
import { useNotificationsContext } from '@context/notificacionContext';
import { useMuestreoContext } from '@context/muestreoContext';
import { useEstacionesContext } from '@context/estacionesContext';
import { ParameterSparklineCard } from '@components/graficos/ParameterSparklineCard';
import { Button } from '@components/ui/Button';

export default function ReportsPage() {
  const { notifications } = useNotificationsContext();
  const { estacionSeleccionada } = useEstacionesContext();
  const { generarReporte, isExporting } = useMuestreoContext();
  
  const [dateRange, setDateRange] = useState({ start: '2026-04-01', end: '2026-04-30' });

  return (
    <main className="reports-container">
      {/* Sección Superior: Título y Filtros */}
      <header className="reports-header">
        <div className="title-area">
          <h2>Historial de Reportes</h2>
          <p className="timestamp">Última actualización: {new Date().toLocaleString()}</p>
        </div>
        <div className="filter-actions">
          <input type="date" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} />
          <input type="date" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} />
          <Button onClick={() => generarReporte({ inicio: new Date(dateRange.start), fin: new Date(dateRange.end) })} loading={isExporting}>
            📥 Exportar CSV
          </Button>
        </div>
      </header>

      {/* Tarjetas de Resumen Superior */}
      <section className="summary-row">
        <div className="summary-card">
          <span>NIVEL DE RIESGO</span>
          <strong className="status-low">● BAJO</strong>
        </div>
        <div className="summary-card">
          <span>PUNTAJE IRCA</span>
          <strong>4.2%</strong>
          <small className="status-low">Riesgo Bajo</small>
        </div>
      </section>

      {/* Gráfico de Tendencia General IRCA */}
      <section className="main-chart-section">
        <h3>Tendencia General del Índice de Riesgo</h3>
        <p>Evaluación del estado general del agua en el periodo seleccionado.</p>
        <div className="large-chart-placeholder" style={{ height: '300px', backgroundColor: '#f8fafc' }}>
          {/* Aquí irá el gráfico de área principal */}
        </div>
      </section>

      {/* Desglose por Parámetro */}
      <section className="parameters-breakdown">
        <h3>Desglose por Parámetro</h3>
        <div className="sparklines-grid">
          <ParameterSparklineCard 
            label="pH" icon="🧪" status="Normal" average="7.2" unit="" reference="Rango Normal: 6.5 - 9.0" 
          />
          <ParameterSparklineCard 
            label="Temperatura" icon="🌡️" status="Prevención" average="24.5" unit="°C" reference="Rango Normal: 10.0 - 30.0" 
          />
          <ParameterSparklineCard 
            label="Turbidez" icon="🌫️" status="Alerta" average="2.4" unit="NTU" reference="Máx Recomendado: 2.0 NTU" 
          />
          <ParameterSparklineCard 
            label="Conductividad" icon="⚡" status="Normal" average="450" unit="µS/cm" reference="Máx Recomendado: 1000 µS/cm" 
          />
          <ParameterSparklineCard 
            label="Oxígeno Disuelto" icon="🫧" status="Normal" average="7.8" unit="mg/L" reference="Mín Recomendado: 4.0 mg/L" 
          />
        </div>
      </section>
    </main>
  );
}