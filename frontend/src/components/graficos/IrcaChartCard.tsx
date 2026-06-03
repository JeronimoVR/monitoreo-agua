'use client';

import React, { useMemo, useState, useRef } from 'react';
import { Activity } from 'lucide-react';

interface ChartData {
  valor: number;
  hora: string; // Recibe el formato ISO completo de fechaMuestreo
}

interface TooltipInfo {
  x: number;
  y: number;
  value: number;
  label: string;
  isVisible: boolean;
}

export function IrcaChartCard({ data }: { data: ChartData[] }) {
  const chartData = useMemo(() => data, [data]);

  const itemInicio = chartData[0];
  const itemFin = chartData[chartData.length - 1];
  const itemMitad = chartData.length > 2 ? chartData[Math.floor(chartData.length / 2)] : null;

  // Lógica de formateo adaptativo sincronizado con la zona horaria local
  const etiquetasAdaptativas = useMemo(() => {
    if (!itemInicio || !itemFin) {
      return { principal: { inicio: '---', mitad: '', fin: '---' }, secundaria: { inicio: '', mitad: '', fin: '' } };
    }

    const fInicio = new Date(itemInicio.hora);
    const fFin = new Date(itemFin.hora);

    if (isNaN(fInicio.getTime()) || isNaN(fFin.getTime())) {
      return { 
        principal: { inicio: itemInicio.hora, mitad: itemMitad?.hora || '', fin: itemFin.hora }, 
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

    const formatearPunto = (strFecha: string | undefined) => {
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

    const ptInicio = formatearPunto(itemInicio?.hora);
    const ptMitad = formatearPunto(itemMitad?.hora);
    const ptFin = formatearPunto(itemFin?.hora);

    return {
      principal: { inicio: ptInicio.linea1, mitad: ptMitad.linea1, fin: ptFin.linea1 },
      secundaria: { inicio: ptInicio.linea2, mitad: ptMitad.linea2, fin: ptFin.linea2 }
    };
  }, [itemInicio, itemMitad, itemFin]);

  return (
    <section className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-slate-900 font-extrabold text-lg">Historial de Calidad del Agua (Gráfico IRCA)</h3>
          <Activity size={20} className="text-[#0056C6]" />
        </div>
        <p className="text-slate-500 text-xs font-medium leading-relaxed max-w-2xl">
          El Índice de Riesgo de la Calidad del Agua (IRCA) clasifica el nivel de riesgo sanitario. Este gráfico mapea los umbrales críticos desde agua sin riesgo hasta inviable.
        </p>
      </div>

      <div className="mt-6 flex gap-3">
        <div className="flex flex-col justify-between text-[10px] font-bold text-slate-400 pb-12 pt-1 text-right w-8 select-none">
          <span>100%</span>
          <span>80%</span>
          <span>35%</span>
          <span>15%</span>
          <span>0%</span>
        </div>

        <div className="flex-1 flex flex-col relative">
          {/* Contenedor interactivo del Sparkline */}
          <SimpleSparkline rawData={chartData} />
          
          {/* Eje X adaptativo de doble altura */}
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
    </section>
  );
}

function SimpleSparkline({ rawData }: { rawData: ChartData[] }) {
  const [tooltip, setTooltip] = useState<TooltipInfo>({ x: 0, y: 0, value: 0, label: '', isVisible: false });
  const containerRef = useRef<HTMLDivElement>(null);

  const valores = useMemo(() => rawData.map(d => d.valor), [rawData]);

  const width = 600;
  const height = 140;
  const paddingY = 12;

  const toY = (val: number) => height - ((val - 0) / 100) * (height - paddingY * 2) - paddingY;
  const toX = (index: number) => (valores.length > 1 ? (index / (valores.length - 1)) * width : width / 2);

  const svgPoints = useMemo(() => {
    if (!valores || valores.length === 0) return null;
    return valores.map((val, index) => `${toX(index)},${toY(val)}`).join(' ');
  }, [valores]);

  if (!valores || valores.length === 0) {
    return <div className="m-auto text-xs text-slate-300 font-bold">Estabilizando señal de la estación...</div>;
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    const localX = e.clientX - rect.left;
    const pointWidth = valores.length > 1 ? rect.width / (valores.length - 1) : rect.width;
    const index = Math.round(localX / pointWidth);
    const clampedIndex = Math.max(0, Math.min(valores.length - 1, index));

    const sample = rawData[clampedIndex];
    let labelFormateado = sample.hora;
    const fechaTooltip = new Date(sample.hora);

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

    // Calcular posición Y en pixeles adaptada al DOM escalado
    const yPorcentaje = toY(valores[clampedIndex]) / height;
    const pixelY = yPorcentaje * rect.height;

    setTooltip({
      x: (clampedIndex / (valores.length - 1)) * rect.width,
      y: pixelY,
      value: valores[clampedIndex],
      label: labelFormateado,
      isVisible: true
    });
  };

  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, isVisible: false }));
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-36" 
      onMouseMove={handleMouseMove} 
      onMouseLeave={handleMouseLeave}
      style={{ cursor: 'crosshair' }}
    >
      {/* Contenedor recortado de capas estéticas */}
      <div className="w-full h-full bg-slate-50/50 rounded-xl overflow-hidden flex items-end relative border border-slate-100">
        <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
          {/* ZONAS DE RIESGO IRCA */}
          <rect x="0" y={toY(100)} width={width} height={toY(35) - toY(100)} fill="#FEE2E2" fillOpacity="0.4" />
          <rect x="0" y={toY(35)} width={width} height={toY(15) - toY(35)} fill="#FEF3C7" fillOpacity="0.5" />
          <rect x="0" y={toY(15)} width={width} height={toY(0) - toY(15)} fill="#D1FAE5" fillOpacity="0.4" />

          {/* LÍNEAS DE REFERENCIA */}
          <line x1="0" y1={toY(80)} x2={width} y2={toY(80)} stroke="#1f1f1fff" strokeDasharray="4,4" strokeWidth="1" opacity="0.6" />
          <line x1="0" y1={toY(35)} x2={width} y2={toY(35)} stroke="#1f1f1fff" strokeDasharray="4,4" strokeWidth="1" opacity="0.6" />
          <line x1="0" y1={toY(15)} x2={width} y2={toY(15)} stroke="#1f1f1fff" strokeDasharray="4,4" strokeWidth="1" opacity="0.6" />
          <line x1="0" y1={toY(0)} x2={width} y2={toY(0)} stroke="#1f1f1fff" strokeWidth="1" />
          
          {/* CURVA */}
          <polyline 
            fill="none" 
            stroke="#0056C6" 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            points={svgPoints || ''} 
          />
        </svg>
      </div>

      {/* TOOLTIP DINÁMICO EXTENSIONADO: Renderizado fuera de la caja overflow-hidden */}
      {tooltip.isVisible && (
        <div
          className="absolute z-[100] bg-gray-900 text-white text-[11px] rounded-lg px-2.5 py-1.5 shadow-xl pointer-events-none transition-all duration-75 whitespace-nowrap -translate-x-1/2 -translate-y-[calc(100%+10px)] will-change-transform"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
          }}
        >
          <div className="font-bold text-center">{tooltip.value.toFixed(2)}%</div>
          <div className="text-gray-300 text-[9px] mt-0.5 text-center font-medium capitalize">{tooltip.label}</div>
          {/* Triángulo indicador inferior */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-[-5px] w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
}