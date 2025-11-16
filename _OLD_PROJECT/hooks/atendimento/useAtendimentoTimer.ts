// hooks/atendimento/useAtendimentoTimer.ts
import { useState, useEffect, useCallback, useRef } from 'react';

export const useAtendimentoTimer = () => {
  const [duration, setDuration] = useState(0); // em segundos
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const startTimeRef = useRef<number | null>(null);
  const pausedDurationRef = useRef(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && !isPaused) {
      interval = setInterval(() => {
        const now = Date.now();
        const start = startTimeRef.current || now;
        const elapsed = Math.floor((now - start) / 1000);
        setDuration(elapsed + pausedDurationRef.current);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused]);

  const start = useCallback(() => {
    startTimeRef.current = Date.now();
    setIsActive(true);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    setIsPaused(true);
    pausedDurationRef.current = duration;
  }, [duration]);

  const resume = useCallback(() => {
    startTimeRef.current = Date.now();
    setIsPaused(false);
  }, []);

  const stop = useCallback(() => {
    setIsActive(false);
    setIsPaused(false);
    setDuration(0);
    startTimeRef.current = null;
    pausedDurationRef.current = 0;
  }, []);

  const reset = useCallback(() => {
    setDuration(0);
    startTimeRef.current = Date.now();
    pausedDurationRef.current = 0;
  }, []);

  return {
    duration,
    isActive,
    isPaused,
    start,
    pause,
    resume,
    stop,
    reset,
  };
};
