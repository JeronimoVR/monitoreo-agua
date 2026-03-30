// src/app/dashboard/layout.tsx
'use client';

import { useAuth } from '@context/authContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login'); // Solo redirige si intenta entrar aquí sin sesión
    }
  }, [isAuthenticated, loading, router]);

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  if (!isAuthenticated) return null;

  return (
    <div className="flex">
      {/* Aquí iría tu Sidebar */}
      <main className="flex-1 bg-slate-50 min-h-screen">
        {/* Aquí iría tu Header */}
        {children}
      </main>
    </div>
  );
}