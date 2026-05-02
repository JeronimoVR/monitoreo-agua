'use client';

interface RiskIndicatorProps {
  nivel: string; // Ej: "BAJO", "MEDIO", "ALTO"
  color?: string;
}

export const RiskIndicator = ({ nivel, color = 'green' }: RiskIndicatorProps) => {
  return (
    <div className="risk-container">
      <div className="risk-circle" style={{ borderColor: color }}>
        <span>NIVEL DE RIESGO</span>
        <strong style={{ color: color }}>{nivel}</strong>
      </div>
    </div>
  );
};