'use client';
import React from 'react';

export const AuthLayout = ({ children, title }: { children: React.ReactNode, title: string }) => {
  return (
    <section>
      <header>
        <h1>AquaLab - UNIAJC</h1>
        <p>Monitoreo de Calidad de Agua Sede Sur</p>
      </header>
      <hr />
      <div>
        <h2>{title}</h2>
        {children}
      </div>
      <footer>
        <p>Proyecto de Grado - Ingeniería de Sistemas 2026</p>
      </footer>
    </section>
  );
};