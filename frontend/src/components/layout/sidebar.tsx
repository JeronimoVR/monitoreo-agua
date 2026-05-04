'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, User } from 'lucide-react';

export const Sidebar = () => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Inicio', href: '/dashboard', icon: <Home size={24} /> },
    { name: 'Reportes', href: '/reportes', icon: <FileText size={24} /> },
    { name: 'Cuenta', href: '/cuenta', icon: <User size={24} /> },
  ];

  return (
    <div className="flex justify-around items-center h-full px-4">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link 
            key={item.href} 
            href={item.href}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${
              isActive ? 'text-blue-600 scale-110' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-blue-50' : ''}`}>
              {item.icon}
            </div>
            <span className={`text-[0.7rem] font-bold uppercase tracking-wider ${isActive ? 'opacity-100' : 'opacity-70'}`}>
              {item.name}
            </span>
            {isActive && (
              <div className="w-1 h-1 bg-blue-600 rounded-full mt-0.5 animate-pulse" />
            )}
          </Link>
        );
      })}
    </div>
  );
};