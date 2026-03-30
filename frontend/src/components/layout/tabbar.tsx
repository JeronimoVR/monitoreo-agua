// src/components/layout/Tabbar.tsx
import { Home, BarChart2, Settings } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const Tabbar = () => {
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: Home, label: 'Inicio' },
    { href: '/dashboard/reports', icon: BarChart2, label: 'Reportes' },
    { href: '/settings', icon: Settings, label: 'Ajustes' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 px-6 py-3 flex justify-around items-center z-50">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1">
            <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-400'}`}>
              <item.icon size={24} />
            </div>
            <span className={`text-[10px] font-bold ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};