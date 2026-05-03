'use client';

interface RiskIndicatorProps {
  nivel: string;
  color?: string;
}

export const RiskIndicator = ({ nivel, color = '#10b981' }: RiskIndicatorProps) => {
  return (
    <div className="flex justify-center items-center py-[4vh]">
      {/* w-[60vw] asegura que el círculo siempre sea proporcional al ancho del celular */}
      <div 
        className="w-[60vw] h-[60vw] max-w-[250px] max-h-[250px] rounded-full border-[2vw] flex flex-col justify-center items-center text-center bg-white shadow-2xl transition-transform hover:scale-105"
        style={{ borderColor: color, boxShadow: `0 2vh 5vh -1.5vh ${color}33` }}
      >
        <span className="text-[2.5vw] sm:text-[12px] font-black text-slate-400 tracking-[0.5vw] mb-[1vh]">
          NIVEL DE RIESGO
        </span>
        <strong 
          className="text-[10vw] sm:text-[40px] font-black tracking-tight"
          style={{ color: color }}
        >
          {nivel}
        </strong>
      </div>
    </div>
  );
};