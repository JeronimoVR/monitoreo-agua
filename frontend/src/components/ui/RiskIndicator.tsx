'use client';

interface RiskIndicatorProps {
  nivel: string;
  color?: string;
}

export const RiskIndicator = ({ nivel, color = '#10b981' }: RiskIndicatorProps) => {
  return (
    <div className="flex justify-center items-center py-4 w-full">
      <div 
        className="w-56 h-56 md:w-64 md:h-64 rounded-full border-[14px] md:border-[16px] flex flex-col justify-center items-center text-center bg-white transition-transform duration-300 hover:scale-[1.02]"
        style={{ 
          borderColor: color, 
          boxShadow: `0 20px 40px -10px ${color}20` 
        }}
      >
        <span className="text-[11px] md:text-sm font-bold text-[#1F1f1f] tracking-widest mb-1 uppercase">
          Nivel de Riesgo
        </span>
        <strong 
          className="text-4xl md:text-5xl font-bold tracking-tight transition-colors duration-300"
          style={{ color: color }}
        >
          {nivel}
        </strong>
      </div>
    </div>
  );
};