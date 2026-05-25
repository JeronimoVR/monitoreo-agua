'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@context/authContext';
import { useNotificationsContext } from '@context/notificacionContext';
import { ProfileCard } from '@components/account/ProfileCard';
import { SettingToggle } from '@components/account/SettingToggle';
import { Button } from '@components/ui/Button';
import { Lock, LogOut } from 'lucide-react';

export default function AccountSettingsPage() {
  const { logout, isAuthenticated, loading } = useAuthContext();
  const { isSensorConnected } = useNotificationsContext();
  const [riskNotifs, setRiskNotifs] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) return null; // Prevenir un destello (flicker) de contenido antes de redirigir
  if (!isAuthenticated) return null;

  return (
    <main className="flex-1 flex flex-col px-6 md:px-12 lg:px-20 pt-4 pb-24 bg-[#FAFAFE] w-full max-w-md md:max-w-3xl lg:max-w-4xl mx-auto space-y-6 md:space-y-8">
      
      {/* Indicador de Estado Superior Derecho */}
      <div className="w-full flex justify-end">
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
          isSensorConnected ? 'bg-[#E6F7ED] text-[#10B981]' : 'bg-amber-50 text-amber-600'
        }`}>
          <span className={`w-2 h-2 rounded-full ${isSensorConnected ? 'bg-[#10B981]' : 'bg-amber-500 animate-pulse'}`} />
          {isSensorConnected ? 'Sensores Conectados' : 'Reconectando...'}
        </div>
      </div>

      {/* Tarjeta de Perfil de Usuario */}
      <section className="w-full">
        <ProfileCard />
      </section>

      {/* Listado de Opciones y Configuración del Sistema */}
      <div className="w-full flex flex-col gap-4">
        
        {/* Toggle Atómico de Notificaciones */}
        <SettingToggle 
          title="Notificaciones de Riesgo"
          description="Alertas cuando el nivel de riesgo del agua sea alto"
          isEnabled={riskNotifs}
          onToggle={() => setRiskNotifs(!riskNotifs)}
        />

        {/* Botón Cambiar Contraseña */}
        <Button 
          variant="outline"
          className="border-[#0056C6] text-[#0056C6] bg-white active:bg-blue-50/20"
        >
          <Lock size={18} className="stroke-[2.5]" />
          Cambiar Contraseña
        </Button>
        
        {/* Botón Cerrar Sesión con Variación Destructiva de la Guía de Estilos */}
        <button 
          onClick={logout}
          className="w-full py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-200 active:scale-[0.98] text-[16px] tracking-wide border-2 border-[#EF4444] text-[#EF4444] bg-white active:bg-red-50/30"
        >
          <LogOut size={18} className="stroke-[2.5]" />
          Cerrar Sesión
        </button>

      </div>
    </main>
  );
}