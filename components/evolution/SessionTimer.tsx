/**
 * Componente: SessionTimer
 * Timer automático para rastrear duração da sessão
 */

import React, { useState, useEffect, useRef } from 'react';
import { Clock, CheckCircle, PlayCircle, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface SessionTimerProps {
  onTimeUpdate?: (startTime: Date, endTime: Date | undefined, duration: number) => void;
  autoStart?: boolean;
}

export function SessionTimer({ onTimeUpdate, autoStart = true }: SessionTimerProps) {
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [duration, setDuration] = useState<string>('00:00');
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Iniciar automaticamente ao montar
  useEffect(() => {
    if (autoStart) {
      handleStart();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Atualizar timer a cada segundo
  useEffect(() => {
    if (!isRunning || !startTime || endTime) return;

    intervalRef.current = setInterval(() => {
      const now = new Date();
      const diff = now.getTime() - startTime.getTime();
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setDuration(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      
      // Callback com dados atualizados
      if (onTimeUpdate) {
        onTimeUpdate(startTime, undefined, minutes);
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, startTime, endTime, onTimeUpdate]);

  const handleStart = () => {
    const now = new Date();
    setStartTime(now);
    setIsRunning(true);
    setEndTime(null);
  };

  const handleStop = () => {
    const now = new Date();
    setEndTime(now);
    setIsRunning(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (startTime && onTimeUpdate) {
      const durationMinutes = Math.floor((now.getTime() - startTime.getTime()) / 60000);
      onTimeUpdate(startTime, now, durationMinutes);
    }
  };

  const handleReset = () => {
    setStartTime(null);
    setEndTime(null);
    setDuration('00:00');
    setIsRunning(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Card className="overflow-hidden border-none shadow-lg">
      <CardContent className="p-5 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-white" />
              <p className="text-sm font-medium text-white">Duração da Sessão</p>
            </div>
            
            {/* Status indicator */}
            {isRunning && !endTime && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-xs text-white font-medium">Em andamento</span>
              </div>
            )}
            
            {endTime && (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-xs text-white font-medium">Finalizada</span>
              </div>
            )}
          </div>

          {/* Timer Display */}
          <div className="text-center">
            <div className="text-5xl font-bold text-white tracking-wider mb-2">
              {duration}
            </div>
            {startTime && (
              <p className="text-sm text-blue-100">
                Início: {formatTime(startTime)}
                {endTime && ` • Fim: ${formatTime(endTime)}`}
              </p>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            {!startTime && (
              <Button
                type="button"
                onClick={handleStart}
                className="flex-1 bg-white text-blue-600 hover:bg-blue-50 gap-2"
                size="sm"
              >
                <PlayCircle className="w-4 h-4" />
                Iniciar
              </Button>
            )}

            {startTime && !endTime && (
              <Button
                type="button"
                onClick={handleStop}
                className="flex-1 bg-white text-blue-600 hover:bg-blue-50 gap-2"
                size="sm"
              >
                <Square className="w-4 h-4" />
                Finalizar
              </Button>
            )}

            {endTime && (
              <Button
                type="button"
                onClick={handleReset}
                variant="outline"
                className="flex-1 bg-white/10 text-white border-white/20 hover:bg-white/20 gap-2"
                size="sm"
              >
                Resetar
              </Button>
            )}
          </div>

          {/* Duration in minutes (for reference) */}
          {startTime && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
              <p className="text-xs text-blue-100 mb-1">Duração Total</p>
              <p className="text-2xl font-bold text-white">
                {Math.floor((endTime || new Date()).getTime() - startTime.getTime()) / 60000 | 0} min
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export { useSessionTimer } from './useSessionTimer';

