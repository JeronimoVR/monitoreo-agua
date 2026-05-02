'use client';
import React from 'react';

interface SparklineProps {
  label: string;
  status: 'Normal' | 'Prevención' | 'Alerta';
  average: number | string;
  unit: string;
  reference: string;
  icon: string;
}

export const ParameterSparklineCard = ({ label, status, average, unit, reference, icon }: SparklineProps) => {
  const statusColor = status === 'Normal' ? '#10b981' : status === 'Prevención' ? '#f59e0b' : '#ef4444';

  return (
    <div className="sparkline-card">
      <div className="card-top">
        <span className="icon">{icon}</span>
        <h4>{label}</h4>
        <span className="badge" style={{ backgroundColor: `${statusColor}20`, color: statusColor }}>
          ● {status}
        </span>
      </div>
      <div className="mini-chart-placeholder">
        {/* Aquí se integrará el componente de gráfico de línea pequeño */}
        <div style={{ height: '40px', background: `linear-gradient(transparent, ${statusColor}10)` }}></div>
      </div>
      <div className="card-stats">
        <p>Promedio: <strong>{average} {unit}</strong></p>
        <span className="reference">{reference}</span>
      </div>
    </div>
  );
};