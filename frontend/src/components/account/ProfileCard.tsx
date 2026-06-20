'use client';

import { useAuthContext } from '@context/authContext';
import { Pencil } from 'lucide-react';

interface ProfileCardProps {
  onEditName?: () => void;
}

export const ProfileCard = ({ onEditName }: ProfileCardProps) => {
  const { user } = useAuthContext();

  const displayName = user?.nombre || 'Usuario';
  const displayEmail = user?.correo || 'usuario@usuario.com';

  const getFirstLetter = (name: string) => {
    return name ? name.trim().charAt(0).toUpperCase() : 'U';
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.015)] border border-slate-100 flex flex-col items-center">

      <div className="relative mb-3 mt-2">
        <div className="w-24 h-24 bg-[#DCE4FF] rounded-full flex items-center justify-center text-[#0E3B8C] text-3xl font-extrabold">
          {getFirstLetter(displayName)}
        </div>
      </div>

      <div className="flex flex-col items-center text-center">
        <button
          type="button"
          onClick={onEditName}
          className="flex items-center gap-2 group"
        >
          <h3 className="text-[#111827] font-extrabold text-2xl tracking-tight">
            {displayName}
          </h3>

          <Pencil
            size={18}
            className="text-[#0056C6] stroke-[2.5] transition-transform group-hover:scale-110"
          />
        </button>

        <p className="text-[#6B7280] font-medium text-[15px] mt-0.5">
          {displayEmail} 
        </p>
      </div>
    </div>
  );
};