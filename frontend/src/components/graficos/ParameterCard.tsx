'use client';

import React from 'react';

interface ParameterCardProps {
  name: string;
  icon: React.ReactNode;
  value: number | string;
  unit: string;
  min: number;
  max: number;
  description: string;
  history: number[];
  isAlert: boolean;
}

export const ParameterCard = ({
  name, icon, value, unit, min, max, description, history, isAlert
}: ParameterCardProps) => {

  // Definición de límites basada en el tipo de parámetro
  const rangeText = min === 0 && max === 0 ? '---' : 
                    min === 0 ? `Máx Recomendado: ${max} ${unit}` : 
                    max === 0 ? `Mín Recomendado: ${min} ${unit}` : 
                    `Rango Normal: ${min} - ${max} ${unit}`;

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-[0_10px_25px_rgba(0,0,0,0.015)] flex flex-col">
      
      {/* Top Info Header */}
      <div className="flex justify-between items-start mb-1.5">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${isAlert ? 'text-[#EF4444]' : 'text-[#6B7280]'}`}>
            {icon}
          </div>
          <h4 className="text-[#111827] font-extrabold text-[17px]">{name}</h4>
        </div>
        
        {/* Badge de Estado Dinámico de Usabilidad */}
        <div className="text-right">
          <div className={`text-xl font-extrabold ${isAlert ? 'text-[#EF4444]' : 'text-[#111827]'}`}>
            {typeof value === 'number' ? value.toFixed(1) : value} <span className="text-xs font-semibold text-[#9CA3AF]">{unit}</span>
          </div>
          <span className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded mt-1 ${
            isAlert ? 'bg-[#FEE2E2] text-[#EF4444]' : 'text-[#10B981]'
          }`}>
            {isAlert ? '▲ FUERA DE RANGO / ALERTA' : '✓ Normal'}
          </span>
        </div>
      </div>

      {/* Descripción técnica */}
      <p className="text-[#6B7280] text-[13px] leading-relaxed font-medium mb-3 pl-1">
        {description || `Medición analítica automatizada del parámetro ${name} en el cuerpo hídrico.`}
      </p>

      {/* Gráfico de Tendencia Local Lineal (Sparkline) */}
      <div className={`h-14 w-full rounded-xl overflow-hidden flex items-end ${isAlert ? 'bg-red-50/30' : 'bg-slate-50/40'}`}>
        <ParameterSparkline data={history} color={isAlert ? '#EF4444' : '#111827'} />
      </div>

      {/* Footer con Umbral Técnico */}
      <div className="mt-2.5 pt-2.5 border-t border-slate-50 flex justify-between items-center text-[11px] font-bold text-[#9CA3AF] px-1">
        <span>{rangeText}</span>
      </div>

    </div>
  );
};

// SVG renderizado en tiempo real para la micro-curva
function ParameterSparkline({ data, color }: { data: number[], color: string }) {
  if (!data || data.length === 0) return <div className="m-auto text-[11px] text-slate-300 font-medium">Estabilizando señal...</div>;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const width = 350;
  const height = 50;
  
  const points = data.map((val, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 8) - 4;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg className="w-full h-full p-1.5" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <polyline fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}