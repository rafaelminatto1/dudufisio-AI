import { useEffect, useState } from 'react';

interface TimerData {
  startTime: Date | null;
  endTime: Date | null;
  duration: number;
}

interface UseSessionTimerResult {
  timerData: TimerData;
  handleTimeUpdate: (startTime: Date, endTime: Date | undefined, duration: number) => void;
}

export function useSessionTimer(): UseSessionTimerResult {
  const [timerData, setTimerData] = useState<TimerData>({
    startTime: null,
    endTime: null,
    duration: 0,
  });

  const handleTimeUpdate = (startTime: Date, endTime: Date | undefined, duration: number) => {
    setTimerData({
      startTime,
      endTime: endTime || null,
      duration,
    });
  };

  useEffect(() => {
    return () => {
      setTimerData({
        startTime: null,
        endTime: null,
        duration: 0,
      });
    };
  }, []);

  return {
    timerData,
    handleTimeUpdate,
  };
}

