'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@context/authContext';
import { ProfileCard } from '@components/account/ProfileCard';
import { SettingToggle } from '@components/account/SettingToggle';
import { Button } from '@components/ui/Button';

export default function AccountSettingsPage() {
  const { logout } = useAuthContext();
  const router = useRouter();
  const [riskNotifs, setRiskNotifs] = useState(true);

  return (
    <main className="account-page">
      {/* Encabezado de Perfil */}
      <section className="profile-header">
        <ProfileCard />
      </section>

      <div className="settings-grid">
        {/* Columna/Sección de Preferencias */}
        <section className="settings-section">
          <h3>PREFERENCIAS</h3>
          <SettingToggle 
            title="Notificaciones de Riesgo"
            description="Alertas inmediatas en tu dispositivo"
            icon="🔔"
            isEnabled={riskNotifs}
            onToggle={() => setRiskNotifs(!riskNotifs)}
          />
        </section>

        {/* Columna/Sección de Seguridad */}
        <section className="settings-section">
          <h3>SEGURIDAD</h3>
          <div className="security-actions">
            <Button 
              variant="outline" 
              onClick={() => router.push('/restablecer-password')}
            >
              🔄 Cambiar Contraseña
            </Button>
            
            <Button 
              variant="outline" 
              className="btn-logout"
              onClick={logout}
            >
              🚪 Cerrar Sesión
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}