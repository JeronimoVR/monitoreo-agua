'use client';
import React from 'react';
import { useAuthContext } from '@context/authContext';
import { User, Edit3 } from 'lucide-react';

export const ProfileCard = () => {
  const { user } = useAuthContext();
  
  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';
  };

  return (
    <div className="bg-white rounded-[8vw] sm:rounded-[2rem] p-[8vw] sm:p-10 shadow-xl shadow-blue-900/5 border border-slate-100 flex flex-col items-center text-center relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[40vw] h-[40vw] bg-blue-50/50 rounded-full -mr-[20vw] -mt-[20vw] z-0"></div>
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="w-[20vw] h-[20vw] max-w-[120px] max-h-[120px] bg-blue-600 rounded-[6vw] sm:rounded-[2rem] flex items-center justify-center text-white text-[8vw] sm:text-[3rem] font-black shadow-lg shadow-blue-200 mb-[3vh]">
          {getInitials(user?.nombre || 'Usuario')}
        </div>
        
        <div className="flex flex-col gap-[0.5vh]">
          <h3 className="text-slate-800 font-black text-[1.4rem] tracking-tight flex items-center justify-center gap-2">
            {user?.nombre || 'Usuario'}
            <button className="p-1.5 bg-slate-50 text-slate-400 rounded-lg hover:text-blue-600 transition-colors">
              <Edit3 size={16} />
            </button>
          </h3>
          <p className="text-slate-500 font-medium text-[0.95rem]">
            {user?.correo || 'usuario@ejemplo.com'}
          </p>
        </div>
        
        <div className="mt-[3vh] px-[4vw] py-[1vh] bg-emerald-50 text-emerald-600 rounded-full text-[0.75rem] font-bold uppercase tracking-wider">
          Cuenta Verificada
        </div>
      </div>
    </div>
  );
};