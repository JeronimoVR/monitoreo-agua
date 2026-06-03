'use client';

import React, { useState, useRef, useMemo } from 'react';

interface ParameterCardProps {
  name: string;
  icon: React.ReactNode;
  value: number | string;
  unit: string;
  min: number;
  max: number;
  description: string;
  history: number[];
  labels: string[]; // Recibe los strings ISO completos
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

  const getRangeText = () => {
    if (min === 0 && max === 0) return '---';
    return `Rango Normal: ${min} - ${max} ${unit}`;
  };

  const normalizedMin = min === 0 && max > 0 ? 0 : min;
  const normalizedMax = max;

  const allValues = [...history];
  if (normalizedMin !== undefined && normalizedMin > 0) allValues.push(normalizedMin);
  if (normalizedMax !== undefined && normalizedMax > 0) allValues.push(normalizedMax);

  const axisMax = allValues.length > 0 ? Math.max(...allValues, 1) : normalizedMax || 100;
  const axisMin = allValues.length > 0 ? Math.min(...allValues, 0) : normalizedMin || 0;
  const axisMid = (axisMax + axisMin) / 2;

  // --- EJE X ADAPTATIVO INTELIGENTE (IGUAL A IRCA CHART) ---
  const itemInicio = labels[0];
  const itemFin = labels[labels.length - 1];
  const itemMitad = labels.length > 2 ? labels[Math.floor(labels.length / 2)] : null;

  const etiquetasAdaptativas = useMemo(() => {
    if (!itemInicio || !itemFin) {
      return { principal: { inicio: '---', mitad: '', fin: '---' }, secundaria: { inicio: '', mitad: '', fin: '' } };
    }

    const fInicio = new Date(itemInicio);
    const fFin = new Date(itemFin);

    if (isNaN(fInicio.getTime()) || isNaN(fFin.getTime())) {
      return { 
        principal: { inicio: itemInicio, mitad: itemMitad || '', fin: itemFin }, 
        secundaria: { inicio: '', mitad: '', fin: '' } 
      };
    }

    const opcionesZona = { timeZone: 'America/Bogota' };
    const getPartes = (d: Date) => {
      const deAño = d.toLocaleDateString('es-CO', { year: 'numeric', ...opcionesZona });
      const deMes = d.toLocaleDateString('es-CO', { month: 'numeric', ...opcionesZona });
      const deDia = d.toLocaleDateString('es-CO', { day: 'numeric', ...opcionesZona });
      return { año: deAño, mes: deMes, dia: deDia };
    };

    const pInicio = getPartes(fInicio);
    const pFin = getPartes(fFin);

    const mismoAño = pInicio.año === pFin.año;
    const mismoMes = mismoAño && pInicio.mes === pFin.mes;
    const mismoDia = mismoMes && pInicio.dia === pFin.dia;

    const fHora = { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'America/Bogota' } as const;
    const fDiaMes = { day: '2-digit', month: 'short', timeZone: 'America/Bogota' } as const;
    const fAño = { year: 'numeric', timeZone: 'America/Bogota' } as const;

    const formatearPunto = (strFecha: string | null) => {
      if (!strFecha) return { linea1: '', linea2: '' };
      const f = new Date(strFecha);

      if (mismoDia) {
        return {
          linea1: f.toLocaleTimeString('es-CO', fHora),
          linea2: f.toLocaleDateString('es-CO', fDiaMes)
        };
      } else if (mismoMes) {
        return {
          linea1: `Día ${f.toLocaleDateString('es-CO', { day: 'numeric', timeZone: 'America/Bogota' })}`,
          linea2: f.toLocaleDateString('es-CO', { month: 'long', timeZone: 'America/Bogota' })
        };
      } else if (mismoAño) {
        return {
          linea1: f.toLocaleDateString('es-CO', { month: 'long', timeZone: 'America/Bogota' }),
          linea2: f.toLocaleDateString('es-CO', fAño)
        };
      } else {
        return {
          linea1: f.toLocaleDateString('es-CO', fAño),
          linea2: f.toLocaleDateString('es-CO', fDiaMes)
        };
      }
    };

    const ptInicio = formatearPunto(itemInicio);
    const ptMitad = formatearPunto(itemMitad);
    const ptFin = formatearPunto(itemFin);

    return {
      principal: { inicio: ptInicio.linea1, mitad: ptMitad.linea1, fin: ptFin.linea1 },
      secundaria: { inicio: ptInicio.linea2, mitad: ptMitad.linea2, fin: ptFin.linea2 }
    };
  }, [itemInicio, itemMitad, itemFin]);

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-[0_10px_25px_rgba(0,0,0,0.015)] flex flex-col justify-between relative">
      
      {/* Top Info Header */}
      <div className="flex justify-between items-start mb-1.5">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${isAlert ? 'text-[#EF4444]' : 'text-[#6B7280]'}`}>
            {icon}
          </div>
          <h4 className="text-[#111827] font-extrabold text-[17px]">{name}</h4>
        </div>
        
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

      {/* --- CONTENEDOR DEL GRÁFICO CON EJES --- */}
      <div className="flex gap-2 w-full my-1">
        
        {/* Eje Y */}
        <div className="flex flex-col justify-between text-[9px] font-bold text-slate-400 h-16 text-right w-8 select-none pb-1">
          <span>{axisMax.toFixed(1)}</span>
          <span>{axisMid.toFixed(1)}</span>
          <span>{axisMin.toFixed(1)}</span>
        </div>

        {/* Bloque Gráfico + Eje X Dinámico */}
        <div className="flex-1 flex flex-col relative">
          <ParameterSparkline 
            data={history} 
            labels={labels}
            color={isAlert ? '#EF4444' : '#0056C6'} 
            limitMin={normalizedMin} 
            limitMax={normalizedMax}
            computedMin={axisMin}
            computedMax={axisMax}
            unit={unit}
            isAlert={isAlert}
          />
          
          {/* Eje X Adaptativo en 2 filas con estilos idénticos al IRCA Chart */}
          <div className="flex justify-between mt-2 px-1 text-center select-none" suppressHydrationWarning>
            {/* INICIO */}
            <div className="flex flex-col items-start w-1/3">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{etiquetasAdaptativas.principal.inicio}</span>
              <span className="text-[9px] font-medium text-slate-400 mt-0.5 capitalize">{etiquetasAdaptativas.secundaria.inicio}</span>
            </div>

            {/* MITAD */}
            <div className="flex flex-col items-center w-1/3">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{etiquetasAdaptativas.principal.mitad}</span>
              <span className="text-[9px] font-medium text-slate-400 mt-0.5 capitalize">{etiquetasAdaptativas.secundaria.mitad}</span>
            </div>

            {/* FIN */}
            <div className="flex flex-col items-end w-1/3">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{etiquetasAdaptativas.principal.fin}</span>
              <span className="text-[9px] font-medium text-slate-400 mt-0.5 capitalize">{etiquetasAdaptativas.secundaria.fin}</span>
            </div>
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
  isAlert: boolean;
}

interface TooltipInfo {
  x: number;
  y: number;
  value: number;
  label: string;
  isVisible: boolean;
}

function ParameterSparkline({ data, labels, color, limitMin, limitMax, computedMin, computedMax, unit, isAlert }: SparklineProps) {
  const [tooltip, setTooltip] = useState<TooltipInfo>({ x: 0, y: 0, value: 0, label: '', isVisible: false });
  const containerRef = useRef<HTMLDivElement>(null);

  if (!data || data.length === 0) return <div className="m-auto text-[11px] text-slate-300 font-medium">Estabilizando señal...</div>;
  
  const range = computedMax - computedMin || 1;
  const width = 350;
  const height = 64; 
  const padding = 6;
  
  const toY = (val: number) => height - ((val - computedMin) / range) * (height - padding * 2) - padding;
  const toX = (index: number) => (data.length > 1 ? (index / (data.length - 1)) * width : width / 2);

  const hasValidMin = limitMin !== undefined && limitMin >= 0;
  const hasValidMax = limitMax !== undefined && limitMax > 0;
  const hasValidRange = hasValidMin && hasValidMax && limitMax > limitMin;

  const maxLineY = hasValidMax ? toY(limitMax) : null;
  const minLineY = hasValidMin ? toY(limitMin) : null;

  const showGreenArea = hasValidRange && minLineY !== null && maxLineY !== null;
  const greenAreaTop = Math.min(minLineY!, maxLineY!);
  const greenAreaBottom = Math.max(minLineY!, maxLineY!);
  const greenAreaHeight = greenAreaBottom - greenAreaTop;

  const showGreenAreaSingleMax = hasValidMax && !hasValidMin && limitMax > 0;
  const singleMaxLineY = showGreenAreaSingleMax ? maxLineY! : null;
  const zeroY = toY(0);

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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    const localX = e.clientX - rect.left;
    
    const pointWidth = data.length > 1 ? rect.width / (data.length - 1) : rect.width;
    const index = Math.round(localX / pointWidth);
    const clampedIndex = Math.max(0, Math.min(data.length - 1, index));

    // Formatear la fecha del tooltip igual a la que se use en la interacción de la app
    let labelFormateado = labels[clampedIndex];
    const fechaTooltip = new Date(labels[clampedIndex]);
    if (!isNaN(fechaTooltip.getTime())) {
      labelFormateado = fechaTooltip.toLocaleString('es-CO', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: 'America/Bogota'
      });
    }

    // Calculamos la posición Y real escalada a pixeles del contenedor
    const yPorcentaje = (toY(data[clampedIndex]) / height);
    const pixelY = yPorcentaje * rect.height;

    setTooltip({
      x: (clampedIndex / (data.length - 1)) * rect.width,
      y: pixelY,
      value: data[clampedIndex],
      label: labelFormateado,
      isVisible: true
    });
  };

  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, isVisible: false }));
  };

  return (
    <div ref={containerRef} className="relative w-full h-16" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      
      {/* Caja interna recortada con overflow-hidden para las franjas y gráficos */}
      <div className={`w-full h-full rounded-xl overflow-hidden flex items-end relative border border-slate-100/50 ${
        isAlert ? 'bg-red-50/20' : 'bg-slate-50/40'
      }`}>
        <svg className="w-full h-full p-1" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          <line x1="0" y1={height * 0.5} x2={width} y2={height * 0.5} stroke="#F1F5F9" strokeWidth="1" />

          {showGreenArea && greenAreaHeight > 0 && (
            <rect x="0" y={greenAreaTop} width={width} height={greenAreaHeight} fill="#D1FAE5" fillOpacity="0.4" rx="2" />
          )}

          {showGreenAreaSingleMax && singleMaxLineY !== null && zeroY !== null && (
            <rect x="0" y={Math.min(singleMaxLineY, zeroY)} width={width} height={Math.abs(singleMaxLineY - zeroY)} fill="#D1FAE5" fillOpacity="0.4" rx="2" />
          )}

          {hasValidMax && maxLineY !== null && (
            <line x1="0" y1={maxLineY} x2={width} y2={maxLineY} stroke="#EF4444" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.8" />
          )}
          
          {hasValidMin && minLineY !== null && limitMin > 0 && (
            <line x1="0" y1={minLineY} x2={width} y2={minLineY} stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.8" />
          )}
          
          <polyline fill="none" stroke={curveColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={data.map((val, index) => `${toX(index)},${toY(val)}`).join(' ')} />
        </svg>
      </div>

      {/* TOOLTIP FLOTANTE EXTRAÍDO: z-[100] por encima del contenedor recortado */}
      {tooltip.isVisible && (
        <div
          className="absolute z-[100] bg-gray-900 text-white text-[11px] rounded-lg px-2.5 py-1.5 shadow-xl pointer-events-none transition-all duration-75 whitespace-nowrap -translate-x-1/2 -translate-y-[calc(100%+10px)] will-change-transform"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
          }}
        >
          <div className="font-bold text-center">{tooltip.value.toFixed(2)} {unit}</div>
          <div className="text-gray-300 text-[9px] mt-0.5 text-center">{tooltip.label}</div>
          {/* Pequeña flecha apuntadora hacia abajo */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-[-5px] w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
}