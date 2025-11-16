/**
 * CANVAS INTERACTIVE MAP
 * Mapa corporal interativo usando Canvas para desenho livre
 * Baseado em BodyMapPain.tsx mas otimizado
 */

import React, { useRef, useEffect, useState } from 'react';
import type { BodyMapVisualizationProps } from '../../../types';
import { getPainLevelColor } from '../../../services/bodyMapService';

const CanvasInteractiveMap: React.FC<BodyMapVisualizationProps> = ({
  bodySide,
  painRegions,
  mainComplaint,
  onAddPoint,
  onSelectPoint,
  readOnly = false,
  showLabels = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 600 });

  // Redimensionar canvas quando container mudar
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCanvasSize({
          width: Math.min(rect.width, 400),
          height: Math.min(rect.height, 600),
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Desenhar corpo e pontos
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenhar corpo humano
    drawBodyOutline(ctx, bodySide, canvas.width, canvas.height);

    // Desenhar pontos de dor
    const filteredRegions = painRegions.filter(r => r.bodySide === bodySide);
    
    filteredRegions.forEach(region => {
      const x = (region.coordinatesX / 100) * canvas.width;
      const y = (region.coordinatesY / 100) * canvas.height;
      const isMain = region.id === mainComplaint?.id;
      
      drawPainPoint(ctx, x, y, region.painLevel, isMain, !region.isActive);
    });
  }, [bodySide, painRegions, mainComplaint, canvasSize]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (readOnly) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    onAddPoint(x, y);
  };

  const handlePointClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Verificar se clicou em algum ponto
    const filteredRegions = painRegions.filter(r => r.bodySide === bodySide);
    
    for (const region of filteredRegions) {
      const x = (region.coordinatesX / 100) * canvas.width;
      const y = (region.coordinatesY / 100) * canvas.height;
      const radius = region.id === mainComplaint?.id ? 12 : 8;

      const distance = Math.sqrt(Math.pow(clickX - x, 2) + Math.pow(clickY - y, 2));
      
      if (distance <= radius) {
        event.stopPropagation();
        onSelectPoint(region);
        return;
      }
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center bg-slate-50 rounded-lg">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className={`border-2 border-slate-200 rounded-lg shadow-sm ${!readOnly ? 'cursor-crosshair' : ''}`}
        onClick={handleCanvasClick}
        onDoubleClick={handlePointClick}
      />

      {/* Instruções */}
      {!readOnly && painRegions.filter(r => r.bodySide === bodySide).length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white/90 rounded-lg p-4 text-center text-sm text-slate-600">
            <div className="font-semibold mb-1">Clique para adicionar ponto de dor</div>
            <div className="text-xs">Duplo clique no ponto para editar</div>
          </div>
        </div>
      )}

      {/* Legenda */}
      {showLabels && (
        <div className="absolute bottom-4 left-4 bg-white/95 rounded-lg shadow-lg p-3 text-xs">
          <div className="font-bold mb-2">Legenda de Dor:</div>
          <div className="space-y-1">
            {[
              { level: 2, label: '1-2: Leve' },
              { level: 4, label: '3-4: Moderada' },
              { level: 6, label: '5-6: Forte' },
              { level: 8, label: '7-8: Muito Forte' },
              { level: 10, label: '9-10: Intensa' },
            ].map(({ level, label }) => (
              <div key={level} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full border border-white"
                  style={{ backgroundColor: getPainLevelColor(level) }}
                />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contador */}
      {painRegions.filter(r => r.bodySide === bodySide).length > 0 && (
        <div className="absolute top-4 right-4 bg-slate-800/90 text-white rounded-lg px-3 py-2 text-sm">
          {painRegions.filter(r => r.bodySide === bodySide).length} pontos
        </div>
      )}
    </div>
  );
};

/**
 * Desenha o contorno do corpo humano no canvas
 */
function drawBodyOutline(
  ctx: CanvasRenderingContext2D,
  bodySide: 'front' | 'back',
  width: number,
  height: number
) {
  const centerX = width / 2;
  const scale = Math.min(width, height) / 500;

  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2 * scale;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();

  if (bodySide === 'front') {
    // Cabeça
    ctx.ellipse(centerX, 40 * scale, 25 * scale, 30 * scale, 0, 0, 2 * Math.PI);
    
    // Pescoço
    ctx.moveTo(centerX, 70 * scale);
    ctx.lineTo(centerX, 90 * scale);
    
    // Ombros e tronco
    ctx.moveTo(centerX, 90 * scale);
    ctx.lineTo(centerX - 60 * scale, 120 * scale); // Ombro esquerdo
    ctx.lineTo(centerX - 70 * scale, 180 * scale); // Braço esquerdo
    ctx.lineTo(centerX - 75 * scale, 240 * scale); // Antebraço esquerdo
    
    ctx.moveTo(centerX, 90 * scale);
    ctx.lineTo(centerX + 60 * scale, 120 * scale); // Ombro direito
    ctx.lineTo(centerX + 70 * scale, 180 * scale); // Braço direito
    ctx.lineTo(centerX + 75 * scale, 240 * scale); // Antebraço direito
    
    // Tronco
    ctx.moveTo(centerX, 90 * scale);
    ctx.lineTo(centerX, 280 * scale);
    
    // Quadris
    ctx.ellipse(centerX, 280 * scale, 40 * scale, 25 * scale, 0, 0, 2 * Math.PI);
    
    // Pernas
    ctx.moveTo(centerX, 305 * scale);
    ctx.lineTo(centerX - 25 * scale, 400 * scale); // Coxa esquerda
    ctx.lineTo(centerX - 30 * scale, 500 * scale); // Panturrilha esquerda
    ctx.lineTo(centerX - 32 * scale, 580 * scale); // Pé esquerdo
    
    ctx.moveTo(centerX, 305 * scale);
    ctx.lineTo(centerX + 25 * scale, 400 * scale); // Coxa direita
    ctx.lineTo(centerX + 30 * scale, 500 * scale); // Panturrilha direita
    ctx.lineTo(centerX + 32 * scale, 580 * scale); // Pé direito
    
  } else {
    // Vista posterior - similar mas com costas
    ctx.ellipse(centerX, 40 * scale, 25 * scale, 30 * scale, 0, 0, 2 * Math.PI);
    
    ctx.moveTo(centerX, 70 * scale);
    ctx.lineTo(centerX, 90 * scale);
    
    // Costas e ombros
    ctx.moveTo(centerX, 90 * scale);
    ctx.lineTo(centerX - 60 * scale, 120 * scale);
    ctx.lineTo(centerX - 70 * scale, 180 * scale);
    ctx.lineTo(centerX - 75 * scale, 240 * scale);
    
    ctx.moveTo(centerX, 90 * scale);
    ctx.lineTo(centerX + 60 * scale, 120 * scale);
    ctx.lineTo(centerX + 70 * scale, 180 * scale);
    ctx.lineTo(centerX + 75 * scale, 240 * scale);
    
    ctx.moveTo(centerX, 90 * scale);
    ctx.lineTo(centerX, 280 * scale);
    
    ctx.ellipse(centerX, 280 * scale, 40 * scale, 25 * scale, 0, 0, 2 * Math.PI);
    
    // Pernas posteriores
    ctx.moveTo(centerX, 305 * scale);
    ctx.lineTo(centerX - 22 * scale, 400 * scale);
    ctx.lineTo(centerX - 27 * scale, 500 * scale);
    ctx.lineTo(centerX - 29 * scale, 580 * scale);
    
    ctx.moveTo(centerX, 305 * scale);
    ctx.lineTo(centerX + 22 * scale, 400 * scale);
    ctx.lineTo(centerX + 27 * scale, 500 * scale);
    ctx.lineTo(centerX + 29 * scale, 580 * scale);
  }

  ctx.stroke();
}

/**
 * Desenha um ponto de dor no canvas
 */
function drawPainPoint(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  painLevel: number,
  isMainComplaint: boolean,
  isResolved: boolean
) {
  const radius = isMainComplaint ? 12 : 8;
  const color = getPainLevelColor(painLevel);

  // Sombra
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 2;

  // Círculo do ponto
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.fill();

  // Remover sombra para próximos desenhos
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Borda
  ctx.strokeStyle = isMainComplaint ? '#fbbf24' : '#ffffff';
  ctx.lineWidth = isMainComplaint ? 3 : 2;
  ctx.stroke();

  // Número da dor
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${radius === 12 ? '11px' : '10px'} Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(painLevel.toString(), x, y);

  // Indicador de resolvida
  if (isResolved) {
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.arc(x, y, radius + 3, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Badge "PRINCIPAL"
  if (isMainComplaint) {
    const badgeWidth = 50;
    const badgeHeight = 14;
    const badgeX = x - badgeWidth / 2;
    const badgeY = y - radius - 20;

    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 3);
    ctx.fill();

    ctx.fillStyle = '#713f12';
    ctx.font = 'bold 8px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PRINCIPAL', x, badgeY + badgeHeight / 2 + 1);
  }
}

export default CanvasInteractiveMap;

