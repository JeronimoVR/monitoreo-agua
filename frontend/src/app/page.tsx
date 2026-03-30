'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@service/api-client';
import { useEstacionesContext } from '@context/estacionesContext';
import { IrcaGauge } from '@components/ui/ircaGauge';
import { Tabbar } from '@components/layout/tabbar';
import { Thermometer, Droplets, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function PublicHome() {
  const { estacionSeleccionada } = useEstacionesContext();
  const [muestreos, setMuestreos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLatestData = async () => {
    if (!estacionSeleccionada?.id) return;
    
    setLoading(true);
    setError(null);
    try {
      // Pedimos los últimos muestreos de la estación actual
      const data = await apiClient.muestreos.getAll({ 
        estacionId: estacionSeleccionada.id 
      });

      if (!data || data.length === 0) {
        setMuestreos([]);
      } else {
        setMuestreos(data);
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestData();
  }, [estacionSeleccionada?.id]);

  // Helper para buscar el valor más reciente de un parámetro específico
  const getValue = (key: string) => {
    const item = muestreos.find(m => m.parametro === key);
    return item ? item.valor : null;
  };

  // --- ESTADOS DE INTERFAZ ---

  // 1. Estado de Carga
  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
        <RefreshCw className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-500 font-medium">Sincronizando datos...</p>
      </div>
    );
  }

  // 2. Estado de Error o Sin Datos
  if (error || muestreos.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white p-10 text-center">
        <AlertCircle className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-800">
          {error ? '¡Ups! Algo salió mal' : 'Sin datos disponibles'}
        </h2>
        <p className="text-sm text-slate-500 mt-2">
          {error ? 'No pudimos establecer conexión con el backend.' : 'La estación seleccionada aún no ha registrado mediciones.'}
        </p>
        <button 
          onClick={fetchLatestData}
          className="mt-6 bg-slate-100 text-slate-700 px-6 py-2 rounded-xl font-bold hover:bg-slate-200 transition-all"
        >
          Reintentar
        </button>
        <Tabbar />
      </div>
    );
  }

  // 3. Estado con Datos (Éxito)
  const temp = getValue('TEMP');
  const turb = getValue('TURB');
  const ph = getValue('PH');

  return (
    <div className="min-h-screen bg-slate-50 pb-24 animate-in fade-in duration-500">
      <header className="p-6 flex justify-between items-center bg-white border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <Droplets className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-slate-800">AquaLab</h1>
        </div>
        <div className="bg-emerald-50 px-3 py-1.5 rounded-full flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-700">EN LÍNEA</span>
        </div>
      </header>

      <main className="px-6 py-8 space-y-6">
        <section className="flex flex-col items-center">
          {/* Mostramos el pH como valor central en el Gauge si no tienes el IRCA calculado aún */}
          <IrcaGauge value={ph || 0} label={ph && ph < 9 && ph > 6 ? 'Calidad: Óptima' : 'Calidad: Revisar'} />
          <p className="text-[10px] text-slate-400 mt-4 uppercase font-bold tracking-widest">
            Última actualización: {new Date(muestreos[0].fecha).toLocaleTimeString()}
          </p>
        </section>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-2">Análisis Automático</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            Basado en la lectura de <span className="font-bold text-blue-600">{estacionSeleccionada?.nombre}</span>, 
            los parámetros fisicoquímicos indican un estado de {ph && (ph > 9 || ph < 6) ? 'ALERTA' : 'NORMALIDAD'}.
          </p>
        </div>

        <div className="bg-blue-600 p-6 rounded-2xl text-center shadow-lg shadow-blue-200">
          <h4 className="text-white font-bold text-lg mb-2">¿Quieres el reporte completo?</h4>
          <p className="text-blue-100 text-xs mb-4">Accede a gráficas históricas y gestión de alertas críticas.</p>
          <Link href="/login" className="block w-full bg-white text-blue-600 font-bold py-3 rounded-xl hover:bg-blue-50 transition-colors">
            Inicia sesión ahora
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <MetricSmall label="Temperatura" value={temp} unit="°C" icon={<Thermometer size={18} className="text-orange-500" />} />
          <MetricSmall label="Turbidez" value={turb} unit="NTU" icon={<Droplets size={18} className="text-blue-500" />} />
        </div>
      </main>

      <Tabbar />
    </div>
  );
}

// Sub-componente para las métricas pequeñas
function MetricSmall({ label, value, unit, icon }: any) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
      <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
      <div>
        <p className="text-[9px] text-slate-400 font-bold uppercase">{label}</p>
        <p className="text-lg font-bold text-slate-800">{value ?? '--'} <span className="text-xs font-normal text-slate-400">{unit}</span></p>
      </div>
    </div>
  );
}