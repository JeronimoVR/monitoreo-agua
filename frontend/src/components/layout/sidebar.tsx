'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthContext } from '@context/authContext';

export const Sidebar = () => {
  const pathname = usePathname();
  const { logout } = useAuthContext();

  const navItems = [
    { name: 'Inicio', href: '/dashboard', icon: '📊' },
    { name: 'Reportes', href: '/reportes', icon: '📋' },
    { name: 'Cuenta', href: '/cuenta', icon: '👤' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span style={{ fontSize: '1.5rem' }}>💧</span>
        <h2>AquaLab</h2>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {navItems.map((item) => (
            <li key={item.href} className={pathname === item.href ? 'active' : ''}>
              <Link href={item.href}>
                <span>{item.icon}</span>
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button onClick={logout} className="btn-logout-sidebar">
          🚪 Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};