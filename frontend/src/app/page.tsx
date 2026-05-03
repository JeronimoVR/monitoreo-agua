'use client';
import { useNotificationsContext } from '@context/notificacionContext';
import Link from 'next/link';
import { RiskIndicator } from '@components/ui/RiskIndicator';
import { Button } from '@components/ui/Button';
import { StatusAnalysis } from '@components/common/StatusAnalysis';
import { PromoBox } from '@components/common/PromoBox';

export default function WelcomePage() {
  const { notifications, isSensorConnected } = useNotificationsContext();
  
  const latest = notifications[0];
  const irca = latest?.irca_calculado ?? 0;
  
  let nivel = "SIN DATOS";
  let color = "#94a3b8";

  if (isSensorConnected || notifications.length > 0) {
    if (irca === 0 && notifications.length === 0) {
      nivel = "ESPERANDO";
      color = "#3b82f6";
    } else if (irca <= 5) {
      nivel = "BAJO";
      color = "#10b981";
    } else if (irca <= 14) {
      nivel = "MEDIO";
      color = "#f59e0b";
    } else {
      nivel = "ALTO";
      color = "#ef4444";
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col p-[5vw]">
      {/* Header con padding basado en Viewport Height */}
      <header className="py-[2vh]">
        <span className="text-blue-600 font-black text-[1.5rem] flex items-center gap-[2vw]">
          <svg width="26" height="33" viewBox="0 0 26 33" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.4469 28.05C13.7719 28.0225 14.0495 27.8919 14.2797 27.6581C14.5099 27.4244 14.625 27.1425 14.625 26.8125C14.625 26.4275 14.5031 26.1181 14.2594 25.8844C14.0156 25.6506 13.7042 25.5475 13.325 25.575C12.2146 25.6575 11.0365 25.3481 9.79063 24.6469C8.54479 23.9456 7.75937 22.6737 7.43437 20.8312C7.38021 20.5287 7.23802 20.2812 7.00781 20.0888C6.7776 19.8962 6.51354 19.8 6.21563 19.8C5.83646 19.8 5.525 19.9444 5.28125 20.2331C5.0375 20.5219 4.95625 20.8587 5.0375 21.2437C5.49792 23.7463 6.58125 25.5338 8.2875 26.6062C9.99375 27.6787 11.7135 28.16 13.4469 28.05ZM13 33C9.28958 33 6.19531 31.7075 3.71719 29.1225C1.23906 26.5375 0 23.32 0 19.47C0 16.72 1.07656 13.7294 3.22969 10.4981C5.38281 7.26688 8.63958 3.7675 13 0C17.3604 3.7675 20.6172 7.26688 22.7703 10.4981C24.9234 13.7294 26 16.72 26 19.47C26 23.32 24.7609 26.5375 22.2828 29.1225C19.8047 31.7075 16.7104 33 13 33Z" fill="#1D4ED8" />
          </svg>
          AquaLab
        </span>
      </header>

      {/* Contenedor Principal con ancho responsivo */}
      <div className="flex-1 flex flex-col max-w-[90vw] mx-auto w-full">

        {/* Título Principal */}
        <section className="text-center mt-[2vh] mb-[1vh]">
          <h1 className="text-[1.8rem] sm:text-[2.5rem] font-black text-slate-900 leading-tight">
            Bienvenido a AquaLab
          </h1>
          <p className="text-slate-500 font-medium text-[1rem]">
            Monitoreo inteligente de calidad de agua.
          </p>
        </section>

        {/* Sección central: El indicador de riesgo ahora es DINÁMICO */}
        <section className="flex-1 flex items-center justify-center">
          <RiskIndicator nivel={nivel} color={color} />
        </section>

        {/* Sección de Información y Acciones con gaps en vh */}
        <section className="space-y-[3vh] pb-[4vh]">
          <div className="space-y-[2vh]">
            <StatusAnalysis />
            <PromoBox />
          </div>

          <div className="flex flex-col gap-[1.5vh]">
            <Link href="/registro" className="w-full">
              <Button variant="solid">👤 Registrarse</Button>
            </Link>
            <Link href="/login" className="w-full">
              <Button variant="outline">↪️ Iniciar Sesión</Button>
            </Link>
          </div>
        </section>

      </div>
    </main>
  );
}