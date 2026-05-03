'use client';
import { useNotificationsContext } from '@context/notificacionContext';
import { ShieldCheck, ShieldAlert, Activity } from 'lucide-react';

export const StatusAnalysis = () => {
  const { notifications, isSensorConnected, loading } = useNotificationsContext();

  const latest = notifications[0];
  const hasData = !!latest;
  const isHealthy = hasData && latest.irca_calculado <= 5;

  if (loading && !hasData) {
    return (
      <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 animate-pulse">
        <div className="h-4 w-32 bg-slate-200 rounded mb-4"></div>
        <div className="h-6 w-full bg-slate-100 rounded"></div>
      </div>
    );
  }

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${isSensorConnected ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
          {isSensorConnected ? <Activity size={20} /> : <ShieldAlert size={20} />}
        </div>
        <h3 className="font-bold text-slate-800 text-lg">Estado del Sistema</h3>
      </div>

      <div className="space-y-3">
        {hasData ? (
          <div className="flex items-start gap-3">
            <div className={`mt-1 ${isHealthy ? 'text-emerald-500' : 'text-amber-500'}`}>
              <ShieldCheck size={18} />
            </div>
            <p className="text-slate-600 leading-relaxed font-medium">
              {isHealthy 
                ? "Calidad del agua óptima. Todos los parámetros se encuentran dentro de los rangos operativos normales."
                : `Se detectaron desviaciones (IRCA: ${latest.irca_calculado.toFixed(1)}). Se recomienda revisar los filtros de la estación.`}
            </p>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <div className="mt-1 text-slate-400">
              <ShieldAlert size={18} />
            </div>
            <p className="text-slate-500 italic">
              {isSensorConnected 
                ? "Esperando datos de la estación..." 
                : "Sistema fuera de línea. No se puede obtener información en este momento."}
            </p>
          </div>
        )}
      </div>
      
      {!isSensorConnected && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full flex items-center gap-1 w-fit">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span>
            RECONECTANDO...
          </span>
        </div>
      )}
    </section>
  );
};