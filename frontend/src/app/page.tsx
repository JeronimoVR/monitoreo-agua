'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@components/common/Button';

export default function HomePage() {
  const router = useRouter();

  return (
    <main>
      <h1>AquaLab - Inicio</h1>
      <Button label="Ir al Login" onClick={() => router.push('/login')} />
      <Button label="Ir al Registro" onClick={() => router.push('/register')} />
    </main>
  );
}