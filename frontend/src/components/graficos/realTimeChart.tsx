'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const RealTimeChart = ({ data }: { data: any[] }) => {
  return (
    <div className="h-[300px] w-full bg-white p-4 rounded-xl border border-gray-100">
      <h3 className="text-gray-700 font-bold mb-4">Comportamiento en tiempo real</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="fecha" 
            tickFormatter={(str) => new Date(str).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            fontSize={12}
          />
          <YAxis fontSize={12} />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="valor" 
            stroke="#3b82f6" 
            strokeWidth={3} 
            dot={false} 
            animationDuration={300}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};