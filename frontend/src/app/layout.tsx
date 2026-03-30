// src/app/layout.tsx
import { AuthProvider } from '@context/authContext';
import { EstacionesProvider } from '@context/estacionesContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <EstacionesProvider>
            {children}
          </EstacionesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}