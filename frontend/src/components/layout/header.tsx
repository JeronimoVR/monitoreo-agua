// src/components/layout/Header.tsx
'use client';
import { useEstacionesContext } from '@context/estacionesContext';
import { useNotificationsContext } from '@context/notificationContext';
import { useAuth } from '@context/authContext';
import { Bell, User, LogOut } from 'lucide-react'; // Usando lucide para iconos

export const Header = () => {
  const { estaciones, estacionSeleccionada, seleccionarEstacion } = useEstacionesContext();
  const { unreadCount } = useNotificationsContext();
  const { logout } = useAuth();

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <h2 className="font-semibold text-gray-700">Estación:</h2>
        <select
          value={estacionSeleccionada?.id || ''}
          onChange={(e) => seleccionarEstacion(e.target.value)}
          className="border rounded-md px-2 py-1 bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500"
        >
          {estaciones.map(est => (
            <option key={est.id} value={est.id}>{est.nombre}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative cursor-pointer">
          <Bell className="text-gray-500 w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </div>

        <button onClick={logout} className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Salir</span>
        </button>
      </div>
    </header>
  );
};