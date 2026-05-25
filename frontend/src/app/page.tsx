'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@components/ui/Button';
import { LogIn, User, UserPlus } from 'lucide-react';

export default function WelcomePage() {
  return (
    <main className="min-h-screen bg-[#F9F9FF] flex flex-col px-6 py-4 font-sans selection:bg-blue-100">
      
      {/* Header con Branding */}
      <header className="py-3 flex items-center gap-2">
        <svg width="24" height="30" viewBox="0 0 26 33" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-600">
          <path d="M13.4469 28.05C13.7719 28.0225 14.0495 27.8919 14.2797 27.6581C14.5099 27.4244 14.625 27.1425 14.625 26.8125C14.625 26.4275 14.5031 26.1181 14.2594 25.8844C14.0156 25.6506 13.7042 25.5475 13.325 25.575C12.2146 25.6575 11.0365 25.3481 9.79063 24.6469C8.54479 23.9456 7.75937 22.6737 7.43437 20.8312C7.38021 20.5287 7.23802 20.2812 7.00781 20.0888C6.7776 19.8962 6.51354 19.8 6.21563 19.8C5.83646 19.8 5.525 19.9444 5.28125 20.2331C5.0375 20.5219 4.95625 20.8587 5.0375 21.2437C5.49792 23.7463 6.58125 25.5338 8.2875 26.6062C9.99375 27.6787 11.7135 28.16 13.4469 28.05ZM13 33C9.28958 33 6.19531 31.7075 3.71719 29.1225C1.23906 26.5375 0 23.32 0 19.47C0 16.72 1.07656 13.7294 3.22969 10.4981C5.38281 7.26688 8.63958 3.7675 13 0C17.3604 3.7675 20.6172 7.26688 22.7703 10.4981C24.9234 13.7294 26 16.72 26 19.47C26 23.32 24.7609 26.5375 22.2828 29.1225C19.8047 31.7075 16.7104 33 13 33Z" fill="currentColor" />
        </svg>
        <span className="text-[#0E3B8C] font-extrabold text-xl tracking-tight">AquaLab</span>
      </header>

      {/* Contenedor de Contenido */}
      <div className="flex-1 flex flex-col justify-between max-w-md mx-auto w-full pt-6 pb-8">
        
        {/* Título Principal */}
        <section className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold text-[#111827] tracking-tight">
            Monitoreo del agua
          </h1>
          <p className="text-[#6B7280] font-medium text-base px-4">
            Calidad del agua monitoreada mediante sensores.
          </p>
        </section>

        {/* Sección de la Foto del Punto de Monitoreo */}
        <section className="my-6 flex flex-col items-center">
          <div className="w-full aspect-[4/3] relative rounded-2xl overflow-hidden shadow-sm border border-slate-100">
            {/* Reemplazar "/arroyo.png" con la ruta real de tu imagen local en /public */}
            <Image 
              src="https://profesoresuniajcedu-my.sharepoint.com/:i:/g/personal/jvelezr_estudiante_uniajc_edu_co/IQC-he4jsQh_Qacv6NBTM4vCAabvRO5X09OicYvSE-impIQ?e=dgIEJq" 
              alt="Punto de Monitoreo Arroyo Sede Sur"
              fill
              priority
              className="object-cover"
            />
          </div>
          <p className="text-[#6B7280] text-sm mt-3 font-medium text-center">
            Punto de Monitoreo: Arroyo Sede Sur UNIAJC.
          </p>
        </section>

        {/* Card Informativa de Invitación */}
        <section className="bg-[#F0F2FA] rounded-2xl p-6 text-center border border-[#E2E6F5] mb-6">
          <h2 className="text-[#374151] font-semibold text-[17px] leading-snug">
            ¿Quieres conocer el estado del agua del arroyo?
          </h2>
          <p className="text-[#4B5563] text-[15px] mt-1.5">
            Regístrate para mantenerte informado.
          </p>
        </section>

        {/* Acciones e Interacciones Móviles */}
        <section className="flex flex-col gap-3.5 w-full">
          <Link href="/dashboard" className="w-full" prefetch>
            <Button variant="solid">
              <User size={20} className="stroke-[2.5]" />
              Entrar como Invitado
            </Button>
          </Link>
          
          <Link href="/login" className="w-full">
            <Button variant="outline">
              <LogIn size={20} className="stroke-[2.5]" />
              Iniciar Sesión
            </Button>
          </Link>

          <Link href="/registro" className="w-full flex justify-center items-center gap-2 text-[#0056C6] font-bold text-[16px] py-2 mt-1 active:scale-95 transition-transform">
            <UserPlus size={20} className="stroke-[2.5]" />
            Registrarse
          </Link>
        </section>

      </div>
    </main>
  );
}