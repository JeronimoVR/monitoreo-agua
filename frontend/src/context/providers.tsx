'use client';
import React from 'react';
import { AuthProvider } from './authContext';
import { MuestreoProvider } from './muestreoContext';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <MuestreoProvider>
        {children}
      </MuestreoProvider>
    </AuthProvider>
  );
};