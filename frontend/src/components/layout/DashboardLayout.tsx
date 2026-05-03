'use client';
import React from 'react';
import { Sidebar } from './Sidebar';

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="app-layout">
      {/* Contenido principal con padding inferior para no ser tapado por la barra */}
      <div className="content-area" style={{ paddingBottom: '80px' }}>
        {children}
      </div>

      {/* Navegación inferior (Sidebar) */}
      <Sidebar />

      <style jsx global>{`
        .app-layout {
          min-height: 100vh;
          background-color: #f8fafc;
        }

        /* Estilos para transformar el Sidebar en Bottom Nav */
        .sidebar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 70px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-around;
          align-items: center;
          padding: 0 10px;
          z-index: 1000;
          box-shadow: 0 -2px 10px rgba(0,0,0,0.05);
        }

        .sidebar-logo, .sidebar-footer {
          display: none; /* Ocultamos logo y logout para simplificar en barra inferior */
        }

        .sidebar-nav {
          width: 100%;
        }

        .sidebar-nav ul {
          display: flex;
          justify-content: space-around;
          list-style: none;
          padding: 0;
          margin: 0;
          width: 100%;
        }

        .sidebar-nav li {
          flex: 1;
        }

        .sidebar-nav a {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-decoration: none;
          color: #64748b;
          font-size: 0.75rem;
          gap: 4px;
          padding: 8px 0;
          transition: all 0.2s;
        }

        .sidebar-nav a span {
          font-size: 1.5rem;
        }

        .sidebar-nav li.active a {
          color: #3b82f6;
          font-weight: 600;
          transform: translateY(-2px);
        }

        .sidebar-nav li.active a span {
          filter: drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3));
        }

        /* Si quieres un botón de logout pequeño flotante o en la barra, podrías añadirlo */
      `}</style>
    </div>
  );
};
