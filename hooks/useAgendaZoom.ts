import { useState, useEffect, useCallback } from 'react';
import { ZoomLevel, ZOOM_CONFIG } from '../components/agenda/ZoomControls';

const STORAGE_KEY = 'agenda-zoom-level';

export const useAgendaZoom = () => {
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>(() => {
    // Tentar carregar do localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && (stored === 'compact' || stored === 'normal' || stored === 'spacious')) {
      return stored as ZoomLevel;
    }
    return 'normal';
  });

  // Persistir no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, zoomLevel);
  }, [zoomLevel]);

  // Calcular fator de zoom
  const zoomFactor = ZOOM_CONFIG[zoomLevel].factor;

  // Handler para atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + + (zoom in)
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
        e.preventDefault();
        setZoomLevel(current => {
          if (current === 'compact') return 'normal';
          if (current === 'normal') return 'spacious';
          return current;
        });
      }
      
      // Ctrl/Cmd + - (zoom out)
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        setZoomLevel(current => {
          if (current === 'spacious') return 'normal';
          if (current === 'normal') return 'compact';
          return current;
        });
      }

      // Ctrl/Cmd + 0 (reset)
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        e.preventDefault();
        setZoomLevel('normal');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const setZoom = useCallback((level: ZoomLevel) => {
    setZoomLevel(level);
  }, []);

  return {
    zoomLevel,
    zoomFactor,
    setZoom,
  };
};


