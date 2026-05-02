'use client';
import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit: string;
  description: string;
  range: string;
  icon: string;
  status?: 'normal' | 'warning' | 'critical';
}

export const MetricCard = ({ label, value, unit, description, range, icon, status = 'normal' }: MetricCardProps) => {
  return (
    <div className="metric-card">
      <div className="card-header">
        <span className="icon">{icon}</span>
        <h4>{label}</h4>
        <span className={`status-dot ${status}`}></span>
      </div>
      <div className="card-value">
        <strong>{value}</strong>
        <span>{unit}</span>
      </div>
      <p className="description">{description}</p>
      <div className="range-info">
        <span>Rango Normal</span>
        <strong>{range}</strong>
      </div>
    </div>
  );
};