'use client';

import { Bell } from 'lucide-react';

interface SettingToggleProps {
  title: string;
  description: string;
  isEnabled: boolean;
  onToggle: () => void;
}

export const SettingToggle = ({ title, description, isEnabled, onToggle }: SettingToggleProps) => {
  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.015)] flex items-center justify-between gap-4 w-full">
      
      {/* Contenido Izquierdo: Ícono Dinámico y Textos */}
      <div className="flex items-center gap-4 flex-1">
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#FFF7ED] text-[#F97316] shrink-0">
          <Bell size={22} className="stroke-[2.2]" />
        </div>
        <div className="flex flex-col space-y-0.5 flex-1">
          <h4 className="text-[#111827] font-extrabold text-[17px] leading-tight">
            {title}
          </h4>
          <p className="text-[#6B7280] text-[13.5px] leading-snug font-medium">
            {description}
          </p>
        </div>
      </div>
      
      {/* Interruptor Deslizable Estilizado (Switch Móvil Nativo) */}
      <button 
        onClick={onToggle}
        type="button"
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200 outline-none focus:ring-2 focus:ring-blue-100 ${
          isEnabled ? 'bg-[#0056C6]' : 'bg-[#E5E7EB]'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 shadow-sm ${
            isEnabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>

    </div>
  );
};