'use client';

import { useState } from 'react';
import { useAuth } from '@context/authContext';
import { 
  Contact2, 
  BellRing, 
  RefreshCcw, 
  ChevronRight,
  Droplets
} from 'lucide-react';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50 pb-32 font-sans animate-in fade-in duration-500">
      {/* Header */}
      <header className="p-6 flex justify-between items-center bg-white border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Droplets className="text-[#0047AB] w-6 h-6" />
          <span className="text-xl font-black text-slate-800 tracking-tight">AquaLab</span>
        </div>
        <div className="bg-emerald-50 px-3 py-1.5 rounded-full flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-emerald-700 uppercase">Sistema operativo</span>
        </div>
      </header>

      <main className="px-6 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Configuración de Cuenta</h1>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            Administra tu perfil de laboratorio y preferencias de notificación.
          </p>
        </div>

        {/* Sección 1: Información Personal */}
        <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 rounded-xl text-[#0047AB]">
              <Contact2 size={24} />
            </div>
            <h2 className="font-bold text-slate-800 text-lg">Información Personal</h2>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nombre</label>
              <input 
                type="text" 
                defaultValue={user?.nombre || "Jeronimo"}
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Correo Electrónico</label>
              <input 
                type="email" 
                defaultValue={user?.email || "jeronimo@test.com"}
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-slate-700 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </section>

        {/* Sección 2: Notificaciones de Riesgo */}
        <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-50 rounded-xl text-orange-500">
              <BellRing size={24} />
            </div>
            <h2 className="font-bold text-slate-800 text-lg">Notificaciones de Riesgo</h2>
          </div>

          <div className="flex items-center justify-between p-1">
            <div className="space-y-1 pr-4 border-l-2 border-blue-600 pl-4">
              <h4 className="text-sm font-bold text-slate-800">Notificaciones Generales</h4>
              <p className="text-xs text-slate-500">Recibir alertas sobre el estado del agua.</p>
            </div>
            
            {/* Switch Personalizado */}
            <button 
              onClick={() => setNotifications(!notifications)}
              className={`w-14 h-8 rounded-full transition-all relative ${notifications ? 'bg-blue-600' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 bg-white w-6 h-6 rounded-full shadow-sm transition-all ${notifications ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </section>

        {/* Sección 3: Botón Cambiar Contraseña */}
        <button className="w-full bg-slate-100 p-5 rounded-2xl flex items-center justify-between group hover:bg-slate-200 transition-all">
          <div className="flex items-center gap-4">
            <div className="bg-white p-2.5 rounded-xl shadow-sm text-blue-600 group-hover:scale-110 transition-transform">
              <RefreshCcw size={20} />
            </div>
            <span className="font-bold text-blue-700">Cambiar Contraseña</span>
          </div>
          <ChevronRight className="text-slate-400" size={20} />
        </button>

        {/* Acciones Finales */}
        <div className="space-y-6 pt-4 text-center">
          <button className="w-full bg-[#0047AB] text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-800 transition-all">
            Guardar Cambios
          </button>
          
          <button 
            onClick={logout}
            className="text-red-600 font-bold text-sm hover:underline block mx-auto"
          >
            Cerrar Sesión
          </button>
        </div>
      </main>
    </div>
  );
}