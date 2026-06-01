'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart2, User } from 'lucide-react';

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Inicio', path: '/inicio', icon: Home },
    { label: 'Reportes', path: '/reportes', icon: BarChart2 },
    { label: 'Cuenta', path: '/cuenta', icon: User }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFE] flex flex-col md:flex-row relative">
      <aside className="hidden md:flex md:w-64 xl:w-72 md:min-h-screen border-r border-slate-100 bg-white/90 backdrop-blur-sm p-4 xl:p-6">
        <nav className="w-full flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-colors ${
                  isActive ? 'bg-[#EDF4FF] text-[#0056C6]' : 'text-[#64748B] hover:bg-slate-50'
                }`}
              >
                <Icon size={20} className={isActive ? 'stroke-[2.5]' : 'stroke-[2]'} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="w-full flex-1">
        {children}
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-100 flex justify-around items-center px-4 z-50 max-w-md mx-auto shadow-[0_-4px_20px_rgba(0,0,0,0.02)] rounded-t-xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.path}
              href={item.path}
              className="flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-150 active:scale-95"
            >
              <div
                className={`px-5 py-1.5 rounded-full flex flex-col items-center ${
                  isActive ? 'bg-[#EDF4FF] text-[#0056C6]' : 'text-[#9CA3AF]'
                }`}
              >
                <Icon size={20} className={isActive ? 'stroke-[2.5]' : 'stroke-[2]'} />
                <span
                  className={`text-[11px] mt-0.5 font-bold tracking-wide ${
                    isActive ? 'text-[#0056C6]' : 'text-[#9CA3AF]'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
