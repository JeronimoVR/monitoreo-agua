'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNotificationsContext } from '@context/notificacionContext';
import { useMuestreoContext } from '@context/muestreoContext';
import { useEstacionesContext } from '@context/estacionesContext';
import { apiClient } from '@service/api-client';
import { Muestreo } from '@/src/shared/sampling/dto/muestreo.dto';
import { AlertTriangle, Activity, Waves, Zap, Thermometer, Wind, Search, Droplets, Clock, Home, BarChart2, Settings } from 'lucide-react';
import { ParameterCard } from '@components/graficos/ParameterCard';
import { SensorStatus } from '@components/graficos/SensorStatus';
import { FilterSection } from '@components/graficos/FilterSection';
import { IrcaChartCard } from '@components/graficos/IrcaChartCard';

type ParamCardData = {
  valor: number;
  unit: string;
  min: number;
  max: number;
  desc: string;
  history: { valor: number; hora: string }[];
};

export default function ReportsPage() {
  const { isSensorConnected } = useNotificationsContext();
  const { descargarCSV, isExporting } = useMuestreoContext();
  const { estacionSeleccionada } = useEstacionesContext();

  // Función para obtener la fecha actual en formato YYYY-MM-DD
  const getFechaActual = () => {
    const hoy = new Date();
    const año = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  };

  // Estados de Filtros - Inicializar con el día actual
  const [fechaInicio, setFechaInicio] = useState(getFechaActual());
  const [fechaFin, setFechaFin] = useState(getFechaActual());

  // Datos dinámicos del backend y cargando
  const [muestras, setMuestras] = useState<Muestreo[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // --- CONTROL HORARIO CENTRALIZADO (Fuerza la visualización estricta de America/Bogota) ---
  const normalizarHoraLocal = useCallback((isoString: string) => {
    if (!isoString) return { horaStr: '---', fullStr: '---' };

    const fecha = new Date(isoString);

    const horaStr = fecha.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/Bogota',
    });

    const fullStr = fecha.toLocaleString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
      timeZone: 'America/Bogota',
    });

    return { horaStr, fullStr };
  }, []);

  // Petición activa al API get 
  const cargarDatosFiltrados = useCallback(async (showLoading = true) => {
    if (!estacionSeleccionada?.id) return;

    if (showLoading) setIsLoadingData(true);
    try {
      const data = await apiClient.muestreos.getFiltered({
        estacionId: estacionSeleccionada.id,
        fechaInicio: fechaInicio ? `${fechaInicio}T00:00:00-05:00` : undefined,
        fechaFin: fechaFin ? `${fechaFin}T23:59:59-05:00` : undefined,
      });

      setMuestras(data || []);
    } catch (error) {
      console.error("Error al traer muestras filtradas:", error);
      setMuestras([]);
    } finally {
      if (showLoading) setIsLoadingData(false);
    }
  }, [estacionSeleccionada?.id, fechaInicio, fechaFin]);

  useEffect(() => {
    cargarDatosFiltrados(true);
  }, [cargarDatosFiltrados]);

  const { notifications } = useNotificationsContext();
  const latestNotificationId = notifications[0]?.id;

  // Actualizar datos automáticamente en tiempo real cuando llega una nueva muestra
  useEffect(() => {
    if (latestNotificationId) {
      cargarDatosFiltrados(false);
    }
  }, [latestNotificationId, cargarDatosFiltrados]);

  // Garantizar orden descendente (más reciente primero) para las métricas superiores
  const muestrasOrdenadas = useMemo(() => {
    if (!muestras.length) return [];
    return [...muestras].sort((a, b) =>
      new Date(b.fechaMuestreo).getTime() - new Date(a.fechaMuestreo).getTime()
    );
  }, [muestras]);

  const isFiltered = !!(fechaInicio || fechaFin);
  const hasResults = muestrasOrdenadas.length > 0;

  const latestSample = useMemo(() => {
    if (!muestrasOrdenadas.length) return null;
    return muestrasOrdenadas[0];
  }, [muestrasOrdenadas]);

  const ircaActual = Number(latestSample?.irca_calculado ?? 0);

  const timestampFormateado = useMemo(() => {
    if (!latestSample?.fechaMuestreo) return 'Sin muestras recientes';
    return normalizarHoraLocal(latestSample.fechaMuestreo).fullStr;
  }, [latestSample, normalizarHoraLocal]);

  const getParamIcon = (name: string) => {
    const key = name.toUpperCase();
    if (key.includes('PH')) return <Activity size={20} />;
    if (key.includes('TURB')) return <Waves size={20} />;
    if (key.includes('CONDUCT')) return <Zap size={20} />;
    if (key.includes('TEMP')) return <Thermometer size={20} />;
    if (key.includes('OX') || key.includes('DISUEL')) return <Wind size={20} />;
    if (key.includes('CAUDAL')) return <Droplets size={20} />;
    return <Activity size={20} />;
  };

  // Procesar parámetros con historial sincronizado de forma estricta
  const allParams = useMemo(() => {
    if (!muestrasOrdenadas.length) return [];

    const map = new Map<string, ParamCardData>();
    const chronologic = [...muestrasOrdenadas].reverse();

    muestrasOrdenadas.forEach((sample) => {
      sample.medidas?.forEach((medida) => {
        const paramName = (medida.parametro?.nombre || 'Parámetro').trim();
        if (!map.has(paramName)) {
          map.set(paramName, {
            valor: medida.valor,
            unit: (medida.parametro?.unidadMedida || '').trim(),
            min: medida.parametro?.valorMinimo ?? 0,
            max: medida.parametro?.valorMaximo ?? 0,
            desc: medida.parametro?.descripcion || '',
            history: []
          });
        }
      });
    });

    map.forEach((entry, name) => {
      entry.history = chronologic
        .map((sample) => {
          const m = sample.medidas?.find((med) => (med.parametro?.nombre || '').trim() === name);
          if (m && typeof m.valor === 'number') {
            const { horaStr } = normalizarHoraLocal(sample.fechaMuestreo);
            return { valor: m.valor, hora: sample.fechaMuestreo };
          }
          return null;
        })
        .filter((v): v is { valor: number; hora: string } => v !== null);

      const latestMeas = muestrasOrdenadas[0]?.medidas?.find(
        (med) => (med.parametro?.nombre || '').trim() === name
      );
      if (latestMeas) entry.valor = latestMeas.valor;
    });

    return [...map.entries()].map(([name, data]) => ({ name, icon: getParamIcon(name), data }));
  }, [muestrasOrdenadas, normalizarHoraLocal]);

  const alertParams = allParams.filter((p) => {
    const minVal = p.data.min;
    const maxVal = p.data.max;
    if (minVal === 0 && maxVal === 0) return false;
    return p.data.valor < minVal || p.data.valor > maxVal;
  });

  const normalParams = allParams.filter((p) => {
    const minVal = p.data.min;
    const maxVal = p.data.max;
    if (minVal === 0 && maxVal === 0) return false;
    return p.data.valor >= minVal && p.data.valor <= maxVal;
  });

  // Datos limpios y sincronizados para el gráfico de barras/líneas del IRCA
// Datos limpios y sincronizados para el gráfico de barras/líneas del IRCA
  const ircaChartData = useMemo(() => {
    if (!muestrasOrdenadas.length) return [];
    return [...muestrasOrdenadas]
      .reverse()
      .map((n) => ({
        valor: Number(n.irca_calculado ?? 0),
        hora: n.fechaMuestreo // <--- ¡Pasamos el ISO completo: "2026-06-02T23:07:17.000Z"!
      }));
  }, [muestrasOrdenadas]);
  const clasificacionRiesgo = useMemo(() => {
    if (!hasResults) {
      return { nivel: 'SIN DATOS', color: 'text-slate-400', bg: 'bg-slate-50', border: 'border-slate-200' };
    }

    let nivel = ''; let color = ''; let bg = ''; let border = '';

    if (ircaActual <= 5) {
      nivel = 'SIN RIESGO'; color = 'text-emerald-600'; bg = 'bg-emerald-50/60'; border = 'border-emerald-200';
    } else if (ircaActual <= 14) {
      nivel = 'RIESGO BAJO'; color = 'text-green-600'; bg = 'bg-green-50/60'; border = 'border-green-200';
    } else if (ircaActual <= 35) {
      nivel = 'RIESGO MEDIO'; color = 'text-amber-500'; bg = 'bg-amber-50/60'; border = 'border-amber-200';
    } else if (ircaActual <= 80) {
      nivel = 'RIESGO ALTO'; color = 'text-orange-600'; bg = 'bg-orange-50/60'; border = 'border-orange-200';
    } else {
      nivel = 'INVIABLE SANITARIAMENTE'; color = 'text-red-600'; bg = 'bg-red-50/60'; border = 'border-red-200';
    }

    return { nivel, color, bg, border };
  }, [ircaActual, hasResults]);

  return (
    <main className="min-h-screen bg-[#FAFAFE] pb-24 md:pb-10">
      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 xl:px-10 pt-6 space-y-6">

        {/* BARRA SUPERIOR */}
        <div className="w-full flex flex-row justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2">
            <svg width="22" height="28" viewBox="0 0 26 33" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-600">
              <path d="M13.4469 28.05C13.7719 28.0225 14.0495 27.8919 14.2797 27.6581C14.5099 27.4244 14.625 27.1425 14.625 26.8125C14.625 26.4275 14.5031 26.1181 14.2594 25.8844C14.0156 25.6506 13.7042 25.5475 13.325 25.575C12.2146 25.6575 11.0365 25.3481 9.79063 24.6469C8.54479 23.9456 7.75937 22.6737 7.43437 20.8312C7.38021 20.5287 7.23802 20.2812 7.00781 20.0888C6.7776 19.8962 6.51354 19.8 6.21563 19.8C5.83646 19.8 5.525 19.9444 5.28125 20.2331C5.0375 20.5219 4.95625 20.8587 5.0375 21.2437C5.49792 23.7463 6.58125 25.5338 8.2875 26.6062C9.99375 27.6787 11.7135 28.16 13.4469 28.05ZM13 33C9.28958 33 6.19531 31.7075 3.71719 29.1225C1.23906 26.5375 0 23.32 0 19.47C0 16.72 1.07656 13.7294 3.22969 10.4981C5.38281 7.26688 8.63958 3.7675 13 0C17.3604 3.7675 20.6172 7.26688 22.7703 10.4981C24.9234 13.7294 26 16.72 26 19.47C26 23.32 24.7609 26.5375 22.2828 29.1225C19.8047 31.7075 16.7104 33 13 33Z" fill="currentColor" />
            </svg>
            <span className="text-[#0E3B8C] font-extrabold text-lg tracking-tight">AquaLab</span>
          </div>
          <SensorStatus isConnected={isSensorConnected} />
        </div>

        {/* MÓVIL: ÚLTIMA MUESTRA */}
        {hasResults && (
          <div className="block lg:hidden bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-3">
            <Clock className="text-blue-500 shrink-0" size={24} />
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase block tracking-wider">Última Muestra Recibida</span>
              <span className="text-slate-800 font-semibold text-sm block" suppressHydrationWarning>
                {timestampFormateado}
              </span>
            </div>
          </div>
        )}

        {/* FILTROS */}
        <FilterSection
          fechaInicio={fechaInicio}
          setFechaInicio={setFechaInicio}
          fechaFin={fechaFin}
          setFechaFin={setFechaFin}
          isFiltered={isFiltered}
          hasResults={hasResults}
          isExporting={isExporting}
          descargarCSV={() => descargarCSV(fechaInicio, fechaFin)}
        />

        {/* COMPORTAMIENTO DE CARGA */}
        {isLoadingData ? (
          <section className="bg-white border border-slate-100 rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-3 shadow-sm">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 text-sm font-semibold">Consultando registros en el servidor...</p>
          </section>
        ) : !hasResults ? (
          <section className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100">
              <Search size={28} className="text-amber-500" />
            </div>
            <div>
              <h3 className="text-slate-800 font-extrabold text-xl">No hay registros para mostrar</h3>
              <p className="text-slate-500 text-sm font-medium max-w-sm mx-auto mt-1">
                {isFiltered ? 'No se encontraron muestras en el rango seleccionado para esta estación.' : 'La estación seleccionada no cuenta con registros históricos.'}
              </p>
            </div>
          </section>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">

              {/* COMPONENTE MÓVIL */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
                <div className={`border ${clasificacionRiesgo.border} ${clasificacionRiesgo.bg} rounded-2xl p-5 shadow-sm flex flex-col justify-center`}>
                  <span className="text-xs font-bold text-slate-500 uppercase block mb-1 tracking-wider">Clasificación del Riesgo</span>
                  <span className={`${clasificacionRiesgo.color} font-black text-2xl block`}>
                    {clasificacionRiesgo.nivel}
                  </span>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex flex-col justify-center">
                  <span className="text-xs font-bold text-slate-500 uppercase block mb-1 tracking-wider">Puntaje IRCA Seleccionado</span>
                  <span className="text-slate-900 font-black text-4xl">
                    {`${ircaActual.toFixed(2)}%`}
                  </span>
                </div>
              </div>

              {/* GRÁFICO IRCA */}
              <div className="lg:col-span-2">
                <IrcaChartCard data={ircaChartData} 
                />
              </div>

              {/* COMPONENTE WEB */}
              <div className="hidden lg:flex lg:flex-col lg:justify-between gap-4">
                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-3 flex-1">
                  <Clock className="text-blue-500 shrink-0" size={24} />
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase block tracking-wider">Última Muestra Recibida</span>
                    <span className="text-slate-800 font-semibold text-sm block" suppressHydrationWarning>
                      {timestampFormateado}
                    </span>
                  </div>
                </div>

                <div className={`border ${clasificacionRiesgo.border} ${clasificacionRiesgo.bg} rounded-2xl p-5 shadow-sm flex-1 flex flex-col justify-center`}>
                  <span className="text-xs font-bold text-slate-500 uppercase block mb-1 tracking-wider">Clasificación del Riesgo</span>
                  <span className={`${clasificacionRiesgo.color} font-black text-2xl block`}>
                    {clasificacionRiesgo.nivel}
                  </span>
                </div>

                <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex-1 flex flex-col justify-center">
                  <span className="text-xs font-bold text-slate-500 uppercase block mb-1 tracking-wider">Puntaje IRCA Seleccionado</span>
                  <span className="text-slate-900 font-black text-4xl">
                    {`${ircaActual.toFixed(2)}%`}
                  </span>
                </div>
              </div>

            </div>

            {/* PARÁMETROS CRÍTICOS */}
            {alertParams.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-red-600 font-black text-sm uppercase tracking-wider px-1">
                  <AlertTriangle size={16} className="fill-red-600 text-white animate-pulse" />
                  <h3>Parámetros Críticos Fuera de Rango</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {alertParams.map((p) => (
                    <ParameterCard
                      key={p.name}
                      name={p.name}
                      icon={p.icon}
                      value={p.data.valor}
                      unit={p.data.unit}
                      min={p.data.min}
                      max={p.data.max}
                      description={p.data.desc}
                      isAlert={true}
                      history={p.data.history.map((h) => h.valor)}
                      labels={p.data.history.map((h) => h.hora)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* PARÁMETROS ESTABLES */}
            {normalParams.length > 0 && (
              <section className="space-y-3 pt-2">
                <h3 className="text-slate-800 font-extrabold text-sm uppercase tracking-wider px-1">
                  Lecturas de Parámetros Estables
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {normalParams.map((p) => (
                    <ParameterCard
                      key={p.name}
                      name={p.name}
                      icon={p.icon}
                      value={p.data.valor}
                      unit={p.data.unit}
                      min={p.data.min}
                      max={p.data.max}
                      description={p.data.desc}
                      isAlert={false}
                      history={p.data.history.map((h) => h.valor)}
                      labels={p.data.history.map((h) => h.hora)}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {/* BARRA DE NAVEGACIÓN MÓVIL */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-around items-center z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-blue-600 transition-colors">
          <Home size={20} /><span className="text-[10px] font-bold">Inicio</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-blue-600 transition-colors">
          <BarChart2 size={20} /><span className="text-[10px] font-bold">Reportes</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-blue-600 transition-colors">
          <Settings size={20} /><span className="text-[10px] font-bold">Ajustes</span>
        </button>
      </div>
    </main>
  );
}