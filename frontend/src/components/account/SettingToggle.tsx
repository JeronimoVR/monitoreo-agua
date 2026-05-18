'use client';
import React from 'react';

interface SettingToggleProps {
  title: string;
  description: string;
  icon: string;
  isEnabled: boolean;
  onToggle: () => void;
}

export const SettingToggle = ({ title, description, icon, isEnabled, onToggle }: SettingToggleProps) => {
  return (
    <div className="bg-white p-[5vw] sm:p-6 rounded-[5vw] sm:rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-[4vw] hover:border-blue-100 transition-all group">
      <div className="flex items-center gap-[4vw] sm:gap-4 flex-1">
        <div className={`w-[12vw] h-[12vw] max-w-[48px] max-h-[48px] rounded-[3.5vw] sm:rounded-xl flex items-center justify-center text-[1.5rem] transition-colors ${isEnabled ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
          {icon}
        </div>
        <div className="flex flex-col gap-[0.2vh] flex-1">
          <h4 className="text-slate-800 font-bold text-[1rem] leading-tight group-hover:text-blue-600 transition-colors">
            {title}
          </h4>
          <p className="text-slate-400 text-[0.8rem] leading-tight font-medium">
            {description}
          </p>
        </div>
      </div>
      
      {/* Custom Styled Toggle */}
      <button 
        onClick={onToggle}
        className={`relative inline-flex h-[3.5vh] w-[12vw] max-w-[50px] items-center rounded-full transition-colors duration-200 outline-none focus:ring-2 focus:ring-blue-100 ${isEnabled ? 'bg-blue-600' : 'bg-slate-200'}`}
      >
        <span
          className={`inline-block h-[2.5vh] w-[2.5vh] transform rounded-full bg-white transition-transform duration-200 ${isEnabled ? 'translate-x-[6vw] sm:translate-x-6' : 'translate-x-[1vw] sm:translate-x-1'}`}
        />
      </button>
    </div>
  );
};