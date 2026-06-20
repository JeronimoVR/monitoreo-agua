export function SensorStatus({ isConnected }: { isConnected: boolean }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-bold transition-all shrink-0 ${
      isConnected ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200 animate-pulse'
    }`}>
      <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`} />
      <span>{isConnected ? 'Sensores Conectados' : 'Sensores Desconectados'}</span>
    </div>
  );
}