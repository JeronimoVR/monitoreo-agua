// src/context/Providers.tsx
'use client';

import { AuthProvider } from './authContext';
import { EstacionesProvider } from './estacionesContext';
import { NotificationProvider } from './notificationContext';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <EstacionesProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </EstacionesProvider>
    </AuthProvider>
  );
}