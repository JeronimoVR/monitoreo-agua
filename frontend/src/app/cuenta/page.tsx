'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthContext } from '@context/authContext';
import { useNotificationsContext } from '@context/notificacionContext';
import { useEstacionesContext } from '@context/estacionesContext';
import { ProfileCard } from '@components/account/ProfileCard';
import { SettingToggle } from '@components/account/SettingToggle';
import { Button } from '@components/ui/Button';
import { Lock, LogOut, UserPlus, LogIn, AlertCircle, CheckCircle } from 'lucide-react';
import { apiClient } from '@service/api-client';
import { SensorStatus } from '@components/graficos/SensorStatus';
import { EditNameModal } from '@components/account/EditNameModal';

export default function AccountSettingsPage() {
  const { logout, isAuthenticated, loading, user, updateUser } = useAuthContext();
  const { isSensorConnected } = useNotificationsContext();
  const { estacionSeleccionada } = useEstacionesContext();
  const [riskNotifs, setRiskNotifs] = useState(false);

  // Estados para alertas
  const [alertMessage, setAlertMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  useEffect(() => {
    const estacionId = estacionSeleccionada?.id ?? 1;
    if (loading || !isAuthenticated) return;

    apiClient.usuarios
      .getAlertConfig(estacionId)
      .then((res: { recibeAlerta?: boolean } | undefined) => {
        setRiskNotifs(Boolean(res?.recibeAlerta));
      })
      .catch(() => {
        setRiskNotifs(false);
      });
  }, [estacionSeleccionada?.id, isAuthenticated, loading]);

  // Función para mostrar alerta temporal
  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlertMessage({ type, message });
    setTimeout(() => {
      setAlertMessage(null);
    }, 5000);
  };

  // Función para actualizar el nombre
  const handleUpdateName = async () => {
    if (!newName.trim()) {
      showAlert('error', 'El nombre no puede estar vacío');
      return;
    }

    setIsUpdatingName(true);
    try {
      await updateUser({ nombre: newName.trim() });
      showAlert('success', 'Nombre actualizado correctamente');
      setIsEditingName(false);
      setNewName('');
    } catch (error) {
      console.error('Error al actualizar nombre:', error);
      showAlert('error', 'Error al actualizar el nombre. Inténtalo de nuevo.');
    } finally {
      setIsUpdatingName(false);
    }
  };

  // Función para manejar el toggle de notificaciones
  const handleToggleNotifications = async () => {
    const estacionId = estacionSeleccionada?.id ?? 1;
    const next = !riskNotifs;
    setRiskNotifs(next);
    try {
      await apiClient.usuarios.configAlertas(estacionId, next);
      showAlert('success', `Notificaciones ${next ? 'activadas' : 'desactivadas'} correctamente`);
    } catch (error) {
      setRiskNotifs(!next);
      showAlert('error', 'Error al guardar la configuración. Inténtalo de nuevo.');
    }
  };

  if (loading) return null;

  if (!isAuthenticated) {
    return (
      <main className="flex-1 flex flex-col px-4 sm:px-6 md:px-8 xl:px-12 pt-4 pb-28 md:pb-10 bg-[#FAFAFE] w-full max-w-md sm:max-w-2xl md:max-w-4xl xl:max-w-5xl mx-auto space-y-6">
        <div className="w-full flex justify-end">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${isSensorConnected ? 'bg-[#E6F7ED] text-[#10B981]' : 'bg-amber-50 text-amber-600'
            }`}>
            <span className={`w-2 h-2 rounded-full ${isSensorConnected ? 'bg-[#10B981]' : 'bg-amber-500 animate-pulse'}`} />
            {isSensorConnected ? 'Sensores Conectados' : 'Reconectando...'}
          </div>
        </div>

        <section className="w-full bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
          <h1 className="text-[#111827] font-extrabold text-2xl">Cuenta protegida</h1>
          <p className="mt-2 text-[#6B7280] text-sm md:text-base">
            Para gestionar tu perfil y notificaciones debes iniciar sesión. Si no tienes cuenta, puedes registrarte.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link href="/login" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto bg-[#0056C6] text-white">
                <LogIn size={16} /> Iniciar Sesión
              </Button>
            </Link>
            <Link href="/registro" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto border-[#0056C6] text-[#0056C6] bg-white">
                <UserPlus size={16} /> Registrarse
              </Button>
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col px-4 sm:px-6 md:px-8 xl:px-12 pt-4 pb-28 md:pb-10 bg-[#FAFAFE] w-full max-w-md sm:max-w-2xl md:max-w-4xl xl:max-w-5xl mx-auto space-y-6 md:space-y-8">
      {/* Alerta flotante */}
      {alertMessage && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-top-2 ${alertMessage.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
          {alertMessage.type === 'success' ? (
            <CheckCircle size={18} className="text-green-600" />
          ) : (
            <AlertCircle size={18} className="text-red-600" />
          )}
          <p className={`text-sm font-medium ${alertMessage.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
            {alertMessage.message}
          </p>
        </div>
      )}

      {/* BARRA SUPERIOR */}
      <div className="w-full flex flex-row justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6">
        <div className="flex items-center gap-2">
          <svg width="22" height="28" viewBox="0 0 26 33" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-600">
            <path d="M13.4469 28.05C13.7719 28.0225 14.0495 27.8919 14.2797 27.6581C14.5099 27.4244 14.625 27.1425 14.625 26.8125C14.625 26.4275 14.5031 26.1181 14.2594 25.8844C14.0156 25.6506 13.7042 25.5475 13.325 25.575C12.2146 25.6575 11.0365 25.3481 9.79063 24.6469C8.54479 23.9456 7.75937 22.6737 7.43437 20.8312C7.38021 20.5287 7.23802 20.2812 7.00781 20.0888C6.7776 19.8962 6.51354 19.8 6.21563 19.8C5.83646 19.8 5.525 19.9444 5.28125 20.2331C5.0375 20.5219 4.95625 20.8587 5.0375 21.2437C5.49792 23.7463 6.58125 25.5338 8.2875 26.6062C9.99375 27.6787 11.7135 28.16 13.4469 28.05ZM13 33C9.28958 33 6.19531 31.7075 3.71719 29.1225C1.23906 26.5375 0 23.32 0 19.47C0 16.72 1.07656 13.7294 3.22969 10.4981C5.38281 7.26688 8.63958 3.7675 13 0C17.3604 3.7675 20.6172 7.26688 22.7703 10.4981C24.9234 13.7294 26 16.72 26 19.47C26 23.32 24.7609 26.5375 22.2828 29.1225C19.8047 31.7075 16.7104 33 13 33Z" fill="currentColor" />
          </svg>
          <span className="text-[#0E3B8C] font-extrabold text-lg tracking-tight">AquaLab</span>
        </div>
        <SensorStatus isConnected={isSensorConnected} />
      </div>

      <section className="w-full">
        <ProfileCard
          onEditName={() => {
            setNewName(user?.nombre || '');
            setIsEditingName(true);
          }}
        />
      </section>

      {/* Modal para editar nombre */}
      <EditNameModal
        isOpen={isEditingName}
        value={newName}
        isLoading={isUpdatingName}
        onChange={setNewName}
        onClose={() => setIsEditingName(false)}
        onSave={handleUpdateName}
      />

      <div className="w-full flex flex-col gap-4">
        <SettingToggle
          title="Notificaciones de Riesgo"
          description="Alertas cuando el nivel de riesgo del agua sea alto"
          isEnabled={riskNotifs}
          onToggle={handleToggleNotifications}
        />

        <Link href='/change-password'>
          <Button variant="outline" className="border-[#0056C6] text-[#0056C6] bg-white active:bg-blue-50/20">
            <Lock size={18} className="stroke-[2.5]" />
            Cambiar Contraseña
          </Button>
        </Link>
        

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