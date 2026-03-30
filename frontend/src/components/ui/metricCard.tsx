// src/components/ui/MetricCard.tsx
interface MetricCardProps {
  label: string;
  value: number | string;
  unit: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  status?: 'normal' | 'alert';
}

export const MetricCard = ({ label, value, unit, icon, status = 'normal' }: MetricCardProps) => {
  return (
    <div className={`p-6 rounded-xl border-2 transition-all shadow-sm bg-white 
      ${status === 'alert' ? 'border-red-400 animate-pulse' : 'border-gray-100'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
          {icon}
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-full 
          ${status === 'alert' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
          {status === 'alert' ? 'CRÍTICO' : 'ESTABLE'}
        </span>
      </div>
      
      <h3 className="text-gray-500 text-sm font-medium">{label}</h3>
      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-3xl font-bold text-gray-800">{value}</span>
        <span className="text-gray-400 font-medium">{unit}</span>
      </div>
    </div>
  );
};