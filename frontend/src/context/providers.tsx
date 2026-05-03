'use client';
import React from 'react';
import { AuthProvider } from '@context/authContext';
import { EstacionesProvider } from '@context/estacionesContext';
import { NotificationProvider } from '@context/notificacionContext';
import { MuestreoProvider } from '@context/muestreoContext';
import { RouteGuard } from '@components/auth/RouteGuard';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <RouteGuard>
        <EstacionesProvider>
          <NotificationProvider>
            <MuestreoProvider>
              {children}
            </MuestreoProvider>
          </NotificationProvider>
        </EstacionesProvider>
      </RouteGuard>
    </AuthProvider>
  );
};