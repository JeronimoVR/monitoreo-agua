export const IrcaGauge = ({ value, label }: { value: number, label: string }) => {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  
  // 1. Lógica de color dinámico (Interpolación HSL)
  // 0% IRCA = 120 (Verde) | 100% IRCA = 0 (Rojo)
  const hue = Math.max(0, 120 - (value * 1.2)); 
  const dynamicColor = `hsl(${hue}, 80%, 45%)`;
  const lightBgColor = `hsl(${hue}, 80%, 95%)`; // Para el fondo del badge

  // 2. Cálculo del arco
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg className="w-48 h-48 transform -rotate-90">
        {/* Círculo de fondo (Gris) */}
        <circle
          cx="96" cy="96" r={radius}
          stroke="currentColor" strokeWidth="12"
          fill="transparent" className="text-slate-100"
        />
        
        {/* Círculo de progreso dinámico */}
        <circle
          cx="96" cy="96" r={radius}
          stroke={dynamicColor} // 🎨 Color dinámico aplicado aquí
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={circumference}
          style={{ 
            strokeDashoffset, 
            transition: 'stroke-dashoffset 0.8s ease, stroke 0.8s ease' 
          }}
          strokeLinecap="round"
        />
      </svg>

      {/* Contenido Central */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">
          Nivel de Riesgo
        </span>
        
        <div 
          className="px-4 py-2 rounded-2xl text-[14px] font-black uppercase shadow-sm transition-colors duration-500"
          style={{ 
            backgroundColor: lightBgColor, 
            color: dynamicColor,
            border: `1px solid ${dynamicColor}20` 
          }}
        >
          {label}
        </div>

      </div>
    </div>
  );
};