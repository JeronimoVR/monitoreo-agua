'use client';

import React, { useState, useRef } from 'react';

interface ParameterCardProps {
  name: string;
  icon: React.ReactNode;
  value: number | string;
  unit: string;
  min: number;
  max: number;
  description: string;
  history: number[];
  labels: string[];
  isAlert: boolean;
}

export const ParameterCard = ({
  name,
  icon,
  value,
  unit,
  min,
  max,
  description,
  history,
  labels,
  isAlert
}: ParameterCardProps) => {

  // Definición de límites basada en el tipo de parámetro
  const getRangeText = () => {
    if (min === 0 && max === 0) return '---';
    //if (min === 0) return `Máx Recomendado: ${max} ${unit}`;
    //zif (max === 0) return `Mín Recomendado: ${min} ${unit}`;
    return `Rango Normal: ${min} - ${max} ${unit}`;
  };

  // Normalizar límites: si solo hay máximo, el mínimo es 0
  const normalizedMin = min === 0 && max > 0 ? 0 : min;
  const normalizedMax = max;

  // --- CÁLCULO DE ESCALAS COMPARTIDAS PARA EJES Y GRÁFICO ---
  const allValues = [...history];
  if (normalizedMin !== undefined && normalizedMin > 0) allValues.push(normalizedMin);
  if (normalizedMax !== undefined && normalizedMax > 0) allValues.push(normalizedMax);

  const axisMax = allValues.length > 0 ? Math.max(...allValues, 1) : normalizedMax || 100;
  const axisMin = allValues.length > 0 ? Math.min(...allValues, 0) : normalizedMin || 0;
  const axisMid = (axisMax + axisMin) / 2;

  // Estrategia para extraer los puntos de tiempo clave del eje X de manera equidistante
  const labelInicio = labels[0] || '---';
  const labelFin = labels[labels.length - 1] || '---';
  const labelMitad = labels.length > 2 ? labels[Math.floor(labels.length / 2)] : '';

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-[0_10px_25px_rgba(0,0,0,0.015)] flex flex-col justify-between">
      
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
            isAlert ? 'bg-[#FEE2E2] text-[#EF4444]' : 'bg-[#D1FAE5] text-[#059669]'
          }`}>
            {isAlert ? '▲ FUERA DE RANGO' : '✓ Normal'}
          </span>
        </div>
      </div>

      {/* Descripción técnica */}
      <p className="text-[#6B7280] text-[13px] leading-relaxed font-medium mb-4 pl-1">
        {description || `Medición analítica automatizada del parámetro ${name} en el cuerpo hídrico.`}
      </p>

      {/* --- CONTENEDOR DEL GRÁFICO CON EJES COMPLETOS --- */}
      <div className="flex gap-2 w-full my-1">
        
        {/* Eje Y: Unidades de Medida y Límites */}
        <div className="flex flex-col justify-between text-[9px] font-bold text-slate-400 h-16 text-right w-8 select-none pb-1">
          <span>{axisMax.toFixed(1)}</span>
          <span>{axisMid.toFixed(1)}</span>
          <span>{axisMin.toFixed(1)}</span>
        </div>

        {/* Bloque Gráfico + Eje X Dinámico */}
        <div className="flex-1 flex flex-col">
          <div className={`h-16 w-full rounded-xl overflow-hidden flex items-end relative border border-slate-100/50 ${
            isAlert ? 'bg-red-50/20' : 'bg-slate-50/40'
          }`}>
            <ParameterSparkline 
              data={history} 
              labels={labels}
              color={isAlert ? '#EF4444' : '#0056C6'} 
              limitMin={normalizedMin} 
              limitMax={normalizedMax}
              computedMin={axisMin}
              computedMax={axisMax}
              unit={unit}
            />
          </div>
          
          {/* Eje X: Línea temporal real calculada dinámicamente */}
          <div className="flex justify-between text-[9px] font-black text-slate-400 mt-1.5 px-1 uppercase tracking-wider" suppressHydrationWarning>
            <span>{labelInicio}</span>
            <span>{labelMitad}</span>
            <span>{labelFin}</span>
          </div>
        </div>

      </div>

      {/* Footer con Umbral Técnico */}
      <div className="mt-3.5 pt-2.5 border-t border-slate-50 flex justify-between items-center text-[11px] font-bold text-[#9CA3AF] px-1">
        <span>{getRangeText()}</span>
      </div>

    </div>
  );
};

interface SparklineProps {
  data: number[];
  labels: string[];
  color: string;
  limitMin: number;
  limitMax: number;
  computedMin: number;
  computedMax: number;
  unit: string;
}

interface TooltipInfo {
  x: number;
  y: number;
  value: number;
  label: string;
  isVisible: boolean;
}

function ParameterSparkline({ data, labels, color, limitMin, limitMax, computedMin, computedMax, unit }: SparklineProps) {
  const [tooltip, setTooltip] = useState<TooltipInfo>({
    x: 0,
    y: 0,
    value: 0,
    label: '',
    isVisible: false
  });
  const svgRef = useRef<HTMLDivElement>(null);

  if (!data || data.length === 0) return <div className="m-auto text-[11px] text-slate-300 font-medium">Estabilizando señal...</div>;
  
  const range = computedMax - computedMin || 1;
  const width = 350;
  const height = 64; 
  const padding = 6;
  
  const toY = (val: number) => height - ((val - computedMin) / range) * (height - padding * 2) - padding;
  const toX = (index: number) => (data.length > 1 ? (index / (data.length - 1)) * width : width / 2);

  // Verificar si hay límites definidos
  const hasValidMin = limitMin !== undefined && limitMin >= 0;
  const hasValidMax = limitMax !== undefined && limitMax > 0;
  const hasValidRange = hasValidMin && hasValidMax && limitMax > limitMin;

  // Calcular las posiciones Y de los límites
  const maxLineY = hasValidMax ? toY(limitMax) : null;
  const minLineY = hasValidMin ? toY(limitMin) : null;

  // Calcular el área verde entre límites
  const showGreenArea = hasValidRange && minLineY !== null && maxLineY !== null;
  const greenAreaTop = Math.min(minLineY!, maxLineY!);
  const greenAreaBottom = Math.max(minLineY!, maxLineY!);
  const greenAreaHeight = greenAreaBottom - greenAreaTop;

  // Si solo hay límite máximo, el área verde es desde 0 hasta el máximo
  const showGreenAreaSingleMax = hasValidMax && !hasValidMin && limitMax > 0;
  const singleMaxLineY = showGreenAreaSingleMax ? maxLineY! : null;
  const zeroY = toY(0);

  // Determinar el color de la línea de la curva
  const getCurveColor = () => {
    if (!hasValidRange && !showGreenAreaSingleMax) return color;
    
    const hasOutOfRange = data.some(val => {
      if (hasValidRange) return val < limitMin || val > limitMax;
      if (showGreenAreaSingleMax) return val > limitMax;
      return false;
    });
    return hasOutOfRange ? '#EF4444' : '#10B981';
  };

  const curveColor = getCurveColor();

  // Manejar hover en el gráfico
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
  const rect = e.currentTarget.getBoundingClientRect();

  const localX = e.clientX - rect.left;
  const localY = e.clientY - rect.top;

  const pointWidth =
    data.length > 1
      ? rect.width / (data.length - 1)
      : rect.width;

  const index = Math.round(localX / pointWidth);

  const clampedIndex = Math.max(
    0,
    Math.min(data.length - 1, index)
  );

  setTooltip({
    x: localX,
    y: localY,
    value: data[clampedIndex],
    label: labels[clampedIndex],
    isVisible: true
  });
};
  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, isVisible: false }));
  };

  return (
    <>
      <div 
        ref={svgRef}
        className="relative w-full h-full"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: 'crosshair' }}
      >
        <svg 
          className="w-full h-full p-1" 
          viewBox={`0 0 ${width} ${height}`} 
          preserveAspectRatio="none"
        >
          {/* Línea central de referencia */}
          <line x1="0" y1={height * 0.5} x2={width} y2={height * 0.5} stroke="#F1F5F9" strokeWidth="1" />

          {/* Área verde entre límites (cuando hay min y max) */}
          {showGreenArea && greenAreaHeight > 0 && (
            <rect
              x="0"
              y={greenAreaTop}
              width={width}
              height={greenAreaHeight}
              fill="#D1FAE5"
              fillOpacity="0.4"
              rx="2"
            />
          )}

          {/* Área verde desde 0 hasta límite máximo (cuando solo hay max) */}
          {showGreenAreaSingleMax && singleMaxLineY !== null && zeroY !== null && (
            <rect
              x="0"
              y={Math.min(singleMaxLineY, zeroY)}
              width={width}
              height={Math.abs(singleMaxLineY - zeroY)}
              fill="#D1FAE5"
              fillOpacity="0.4"
              rx="2"
            />
          )}

          {/* Línea de límite MÁXIMO (roja punteada) */}
          {hasValidMax && maxLineY !== null && (
            <line 
              x1="0" 
              y1={maxLineY} 
              x2={width} 
              y2={maxLineY} 
              stroke="#EF4444" 
              strokeWidth="1.5" 
              strokeDasharray="6 4" 
              opacity="0.8" 
            />
          )}
          
          {/* Línea de límite MÍNIMO (naranja punteada) - solo si existe y es > 0 */}
          {hasValidMin && minLineY !== null && limitMin > 0 && (
            <line 
              x1="0" 
              y1={minLineY} 
              x2={width} 
              y2={minLineY} 
              stroke="#F59E0B" 
              strokeWidth="1.5" 
              strokeDasharray="6 4" 
              opacity="0.8" 
            />
          )}
          
          {/* Curva de datos real */}
          <polyline 
            fill="none" 
            stroke={curveColor} 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            points={data.map((val, index) => `${toX(index)},${toY(val)}`).join(' ')} 
          />
        </svg>
      </div>

      {/* Tooltip flotante - ahora usa position absolute relativo al contenedor */}
      {tooltip.isVisible && (
        <div
          className="absolute z-50 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg pointer-events-none transition-opacity duration-150 whitespace-nowrap"
          style={{
            left: tooltip.x - 40,
            top: tooltip.y - 35,
          }}
        >
          <div className="font-bold">{tooltip.value.toFixed(2)} {unit}</div>
          <div className="text-gray-300 text-[10px] mt-0.5">{tooltip.label}</div>
          {/* Triangulito indicador */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-[-6px] w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-gray-900"></div>
        </div>
      )}
    </>
  );
}