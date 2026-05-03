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
  
  // Colores de estado basados en la lógica de AquaLab
  const statusColors = {
    normal: 'bg-emerald-500',
    warning: 'bg-amber-500',
    critical: 'bg-red-500'
  };

  return (
    <div className="bg-white rounded-[5vw] sm:rounded-2xl p-[4vw] sm:p-5 shadow-sm border border-slate-100 flex flex-col justify-between hover:shadow-md transition-shadow">
      
      {/* Header de la Card */}
      <div className="flex justify-between items-start mb-[1vh]">
        <div className="flex flex-col">
          <span className="text-[6vw] sm:text-[24px] mb-[0.5vh]">{icon}</span>
          <h4 className="text-[3.5vw] sm:text-[0.9rem] font-black text-slate-800 uppercase tracking-tight leading-none">
            {label}
          </h4>
        </div>
        <span className={`w-[2.5vw] h-[2.5vw] max-w-[10px] max-h-[10px] rounded-full mt-1 ${statusColors[status]}`} />
      </div>

      {/* Valor Principal */}
      <div className="my-[1.5vh]">
        <div className="flex items-baseline gap-[1vw]">
          <strong className="text-[8vw] sm:text-[2rem] font-black text-slate-900 leading-none">
            {value}
          </strong>
          <span className="text-[3vw] sm:text-[0.8rem] font-bold text-slate-400">
            {unit}
          </span>
        </div>
        <p className="text-[2.8vw] sm:text-[0.7rem] text-slate-400 font-medium leading-tight mt-[0.5vh]">
          {description}
        </p>
      </div>

      {/* Info de Rango: Muy importante para el análisis del investigador */}
      <div className="mt-[1vh] pt-[1vh] border-t border-slate-50">
        <div className="flex justify-between items-center text-[2.5vw] sm:text-[0.65rem]">
          <span className="text-slate-400 font-bold uppercase tracking-tighter">Normal</span>
          <strong className="text-slate-600 bg-slate-50 px-[2vw] py-[0.2vh] rounded-full">
            {range}
          </strong>
        </div>
      </div>
    </div>
  );
};