// src/components/ui/IrcaGauge.tsx
export const IrcaGauge = ({ value, label }: { value: number, label: string }) => {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference; // Asumiendo escala 0-100 para el arco

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg className="w-48 h-48 transform -rotate-90">
        <circle
          cx="96" cy="96" r={radius}
          stroke="currentColor" strokeWidth="12"
          fill="transparent" className="text-gray-100"
        />
        <circle
          cx="96" cy="96" r={radius}
          stroke="currentColor" strokeWidth="12"
          fill="transparent"
          strokeDasharray={circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s ease' }}
          strokeLinecap="round"
          className="text-emerald-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Índice IRCA</span>
        <span className="text-5xl font-black text-slate-800">{value}</span>
        <div className="mt-2 bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-bold uppercase">
          {label}
        </div>
      </div>
    </div>
  );
};