'use client';
import React from 'react';
import dynamic from 'next/dynamic';

// Importación dinámica para evitar errores de SSR con ApexCharts
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface SparklineProps {
  label: string;
  status: 'Normal' | 'Prevención' | 'Alerta';
  average: number | string;
  unit: string;
  reference: string;
  icon: string;
  data?: number[]; // Array de datos históricos
}

export const ParameterSparklineCard = ({ label, status, average, unit, reference, icon, data = [30, 40, 35, 50, 49, 60, 70] }: SparklineProps) => {
  const statusColor = status === 'Normal' ? '#10b981' : status === 'Prevención' ? '#f59e0b' : '#ef4444';

  const chartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'area',
      sparkline: { enabled: true },
      animations: { enabled: true,
        // @ts-ignore: easing exists in ApexCharts but might not be in these types 
      easing: 'easeinout' as const, speed: 800 }
    },
    stroke: { curve: 'smooth', width: 2 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [20, 100]
      }
    },
    colors: [statusColor],
    tooltip: { fixed: { enabled: false }, x: { show: false }, marker: { show: false } }
  };

  return (
    <div className="bg-white rounded-[5vw] p-[5vw] shadow-sm border border-slate-50 flex flex-col gap-[1.5vh]">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-[2vw]">
          <span className="text-[6vw]">{icon}</span>
          <div>
            <h4 className="text-[1rem] font-black text-slate-800 leading-none">{label}</h4>
            <p className="text-[0.7rem] text-slate-400 font-medium mt-1">Historial del periodo</p>
          </div>
        </div>
        <span
          className="px-[2.5vw] py-[0.5vh] rounded-full text-[0.65rem] font-bold uppercase tracking-wider"
          style={{ backgroundColor: `${statusColor}15`, color: statusColor }}
        >
          ● {status}
        </span>
      </div>

      {/* Gráfico de línea pequeño escalable */}
      <div className="h-[8vh] w-full -mx-[2vw]">
        <Chart options={chartOptions} series={[{ data }]} type="area" height="100%" />
      </div>

      <div className="flex justify-between items-end mt-[1vh]">
        <div className="flex flex-col">
          <span className="text-[0.65rem] font-bold text-slate-300 uppercase leading-none mb-1">Promedio</span>
          <p className="text-[1.2rem] font-black text-slate-800 leading-none">
            {average} <span className="text-[0.8rem] font-bold text-slate-400">{unit}</span>
          </p>
        </div>
        <span className="text-[0.65rem] font-bold text-slate-400 bg-slate-50 px-[2vw] py-[0.4vh] rounded-md italic">
          {reference}
        </span>
      </div>
    </div>
  );
};