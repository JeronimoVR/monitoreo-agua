import React from 'react';
import { Calendar, X, Download } from 'lucide-react';

interface FilterSectionProps {
  fechaInicio: string;
  setFechaInicio: (val: string) => void;
  fechaFin: string;
  setFechaFin: (val: string) => void;
  isFiltered: boolean;
  hasResults: boolean;
  isExporting: boolean;
  descargarCSV: () => void;
}

export function FilterSection({
  fechaInicio, setFechaInicio, fechaFin, setFechaFin,
  isFiltered, hasResults, isExporting, descargarCSV
}: FilterSectionProps) {
  return (
    <section className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5 grid grid-cols-1 lg:grid-cols-[1fr_1fr_auto] gap-4 items-end">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Calendar size={14} /> ANALIZAR DESDE
        </label>
        <input
          type="date"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600/20"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Calendar size={14} /> HASTA
        </label>
        <input
          type="date"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-600/20"
        />
      </div>
      <div className="flex gap-2">
        {isFiltered && (
          <button
            onClick={() => { setFechaInicio(''); setFechaFin(''); }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200"
          >
            <X size={16} /> Limpiar
          </button>
        )}
        <button
          onClick={descargarCSV}
          disabled={isExporting || !hasResults}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-40"
        >
          <Download size={16} /> Exportar CSV
        </button>
      </div>
    </section>
  );
}