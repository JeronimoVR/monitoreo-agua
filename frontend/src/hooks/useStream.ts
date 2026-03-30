// src/hooks/useRealTime.ts
import { useEffect, useState } from 'react';
import { streamClient, NotificationData } from '@service/stream-client';

export const useRealTime = (isActive: boolean) => {
  const [lastEvent, setLastEvent] = useState<NotificationData | null>(null);
  const [history, setHistory] = useState<NotificationData[]>([]);

  useEffect(() => {
    if (!isActive) return;

    const disconnect = streamClient.connect((data) => {
      setLastEvent(data);
      setHistory((prev) => [data, ...prev].slice(0, 20)); // Guardamos los últimos 20
    });

    return () => disconnect(); // Cleanup al desmontar
  }, [isActive]);

  return { lastEvent, history };
};