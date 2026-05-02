'use client';
import Link from 'next/link';
import { RiskIndicator } from '@components/ui/RiskIndicator';
import { Button } from '@components/ui/Button';
import { StatusAnalysis } from '@components/common/StatusAnalysis';
import { PromoBox } from '@components/common/PromoBox';

export default function WelcomePage() {
  return (
    <main className="welcome-wrapper">
      {/* Header simple con Logo */}
      <header>
        <span>💧 AquaLab</span>
      </header>

      {/* Contenedor Principal: En Desktop será un Flex/Grid */}
      <div className="layout-container">
        
        {/* Título Principal */}
        <section className="welcome-header">
          <h1>Bienvenido a AquaLab</h1>
          <p>Monitoreo inteligente de calidad de agua.</p>
        </section>

        {/* Sección de Datos (Círculo de Riesgo) */}
        <section className="main-visual">
          <RiskIndicator nivel="BAJO" color="#10b981" />
        </section>

        {/* Sección de Información y Acciones */}
        <section className="actions-content">
          <StatusAnalysis />
          <PromoBox />

          <div className="button-group">
            <Link href="/registro">
              <Button variant="solid">👤 Registrarse</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline">↪️ Iniciar Sesión</Button>
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}