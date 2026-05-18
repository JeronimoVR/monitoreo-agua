'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@context/authContext';
import { ProfileCard } from '@components/account/ProfileCard';
import { SettingToggle } from '@components/account/SettingToggle';
import { Button } from '@components/ui/Button';
import { LogOut, Lock, Bell, Settings, Shield } from 'lucide-react';

export default function AccountSettingsPage() {
  const { logout } = useAuthContext();
  const router = useRouter();
  const [riskNotifs, setRiskNotifs] = useState(true);

  return (
    <div className="p-[5vw] flex flex-col gap-[4vh]">
      {/* Header de la página */}
      <section>
        <h2 className="text-slate-800 font-black text-[1.5rem] tracking-tight uppercase">
          Mi Perfil
        </h2>
        <p className="text-slate-500 font-medium text-[0.9rem] mt-[0.5vh]">
          Gestiona tu información personal y preferencias de seguridad.
        </p>
      </section>

      {/* Encabezado de Perfil */}
      <section>
        <ProfileCard />
      </section>

      <div className="flex flex-col gap-[4vh]">
        {/* Sección de Preferencias */}
        <section className="flex flex-col gap-[2vh]">
          <div className="flex items-center gap-2 ml-[1vw]">
            <Settings size={18} className="text-blue-600" />
            <h3 className="text-slate-400 font-black text-[0.75rem] uppercase tracking-widest">
              Preferencias
            </h3>
          </div>
          <div className="flex flex-col gap-[2vh]">
            <SettingToggle 
              title="Notificaciones de Riesgo"
              description="Alertas inmediatas de calidad de agua"
              icon="🔔"
              isEnabled={riskNotifs}
              onToggle={() => setRiskNotifs(!riskNotifs)}
            />
          </div>
        </section>

        {/* Sección de Seguridad */}
        <section className="flex flex-col gap-[2vh]">
          <div className="flex items-center gap-2 ml-[1vw]">
            <Shield size={18} className="text-blue-600" />
            <h3 className="text-slate-400 font-black text-[0.75rem] uppercase tracking-widest">
              Seguridad y Sesión
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-[2vh]">
            <Button 
              variant="outline" 
              className="!justify-start gap-[4vw] bg-white border-slate-100 shadow-sm hover:border-blue-100"
              onClick={() => router.push('/restablecer-password')}
            >
              <Lock size={20} className="text-blue-600" />
              Cambiar Contraseña
            </Button>
            
            <Button 
              variant="outline" 
              className="!justify-start gap-[4vw] bg-white border-red-50 text-red-500 hover:bg-red-50 hover:border-red-100 shadow-sm"
              onClick={logout}
            >
              <LogOut size={20} />
              Cerrar Sesión
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}