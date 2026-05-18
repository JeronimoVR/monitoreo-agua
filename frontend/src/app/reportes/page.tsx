'use client';
import { useState } from 'react';
import { Calendar, Download, BarChart3, Zap, FileSpreadsheet } from 'lucide-react';
import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { useMuestreoContext } from "@context/muestreoContext";

export default function ReportsPage() {
  const { generarReporte, isExporting } = useMuestreoContext();
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  return (
    <div className="p-[5vw] flex flex-col gap-[4vh]">
      {/* Header de la página */}
      <section>
        <h2 className="text-slate-800 font-black text-[1.5rem] tracking-tight uppercase">
          Reportes Históricos
        </h2>
        <p className="text-slate-500 font-medium text-[0.9rem] mt-[0.5vh]">
          Exporta los datos capturados por los sensores en formato CSV para análisis externo.
        </p>
      </section>

      {/* Card de Configuración de Reporte */}
      <div className="bg-white p-[6vw] rounded-[8vw] shadow-xl shadow-blue-900/5 border border-slate-100 flex flex-col gap-[4vh]">
        <div className="flex items-center gap-[3vw]">
          <div className="w-[12vw] h-[12vw] bg-blue-50 rounded-[4vw] flex items-center justify-center text-blue-600">
            <BarChart3 size={28} />
          </div>
          <div>
            <h3 className="text-slate-800 font-bold text-[1.1rem]">Rango de Fecha</h3>
            <p className="text-slate-400 text-[0.8rem]">Selecciona el periodo de tiempo</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-[3vh]">
          <Input 
            label="Desde"
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
            iconLeft={<Calendar size={20} />}
          />
          <Input 
            label="Hasta"
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
            iconLeft={<Calendar size={20} />}
          />
        </div>

        <div className="bg-slate-50 p-[4vw] rounded-[4vw] border border-dashed border-slate-200">
          <p className="text-slate-500 text-[0.8rem] leading-relaxed">
            <span className="font-bold text-blue-600">Nota:</span> El reporte incluirá pH, turbidez, temperatura, conductividad y oxígeno disuelto, junto con el cálculo del IRCA para cada muestra.
          </p>
        </div>

        <Button 
          className="w-full !py-[2.2vh] shadow-blue-600/30"
          onClick={() => generarReporte({ inicio: new Date(dateRange.start), fin: new Date(dateRange.end) })} 
          loading={isExporting}
        >
          <Download size={20} className="mr-2" />
          Generar Reporte CSV
        </Button>
      </div>

      {/* Tips o Información Adicional */}
      <div className="grid grid-cols-2 gap-[4vw]">
        <div className="bg-emerald-50 p-[4vw] rounded-[6vw] border border-emerald-100">
          <FileSpreadsheet className="text-emerald-600 mb-[1vh]" size={24} />
          <h4 className="text-emerald-900 font-bold text-[0.85rem] uppercase">Formato</h4>
          <p className="text-emerald-700/70 text-[0.75rem]">Compatible con Excel y Sheets</p>
        </div>
        <div className="bg-blue-50 p-[4vw] rounded-[6vw] border border-blue-100">
          <Zap className="text-blue-600 mb-[1vh]" size={24} />
          <h4 className="text-blue-900 font-bold text-[0.85rem] uppercase">Velocidad</h4>
          <p className="text-blue-700/70 text-[0.75rem]">Generación en tiempo real</p>
        </div>
      </div>
    </div>
  );
}