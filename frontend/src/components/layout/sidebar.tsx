'use client';
import { LayoutDashboard, BarChart3, Bell, MapPin, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: BarChart3, label: 'Estadísticas', href: '/dashboard/graphics' },
  { icon: Bell, label: 'Alertas', href: '/dashboard/alerts' },
  { icon: MapPin, label: 'Estaciones', href: '/dashboard/stations' },
  { icon: Settings, label: 'Configuración', href: '/dashboard/settings' },
];

export const Sidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 h-screen text-white flex flex-col fixed left-0 top-0">
      <div className="p-6 text-2xl font-bold border-b border-slate-800">
        Hydro<span className="text-blue-400">Scan</span>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-red-400 transition-colors">
          <LogOut size={20} />
          <span className="font-medium">Salir</span>
        </button>
      </div>
    </aside>
  );
};