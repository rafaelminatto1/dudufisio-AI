/**
 * SVG SIMPLE BODY MAP
 * Visualização simplificada do corpo humano estilo "boneco"
 * Fácil de usar e performático
 */

import React, { useRef } from 'react';
import type { BodyMapVisualizationProps } from '../../../types';
import { getPainLevelColor } from '../../../services/bodyMapService';

const SVGSimpleBodyMap: React.FC<BodyMapVisualizationProps> = ({
  bodySide,
  painRegions,
  mainComplaint,
  onAddPoint,
  onSelectPoint,
  readOnly = false,
  showLabels = true,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const handleSvgClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (readOnly) return;

    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    onAddPoint(x, y);
  };

  const handlePointClick = (region: any, event: React.MouseEvent) => {
    event.stopPropagation();
    onSelectPoint(region);
  };

  // Filtrar regiões para este lado do corpo
  const filteredRegions = painRegions.filter(r => r.bodySide === bodySide);

  // Path do corpo humano simplificado
  const bodyPath = bodySide === 'front' ? getFrontBodyPath() : getBackBodyPath();

  return (
    <div className="relative w-full h-full">
      <svg
        ref={svgRef}
        viewBox="0 0 200 500"
        className={`w-full h-full ${!readOnly ? 'cursor-crosshair' : ''}`}
        onClick={handleSvgClick}
      >
        {/* Corpo humano */}
        <path
          d={bodyPath}
          fill="#e2e8f0"
          stroke="#64748b"
          strokeWidth="2"
          className="transition-colors hover:fill-slate-300"
        />

        {/* Pontos de dor */}
        {filteredRegions.map(region => {
          const isMain = region.id === mainComplaint?.id;
          const color = getPainLevelColor(region.painLevel);
          
          return (
            <g key={region.id}>
              {/* Círculo do ponto */}
              <circle
                cx={`${region.coordinatesX}%`}
                cy={`${region.coordinatesY}%`}
                r={isMain ? 12 : 8}
                fill={color}
                stroke={isMain ? '#fbbf24' : '#ffffff'}
                strokeWidth={isMain ? 3 : 2}
                className="cursor-pointer transition-all hover:r-10"
                onClick={(e) => handlePointClick(region, e)}
              />
              
              {/* Nível de dor no centro */}
              <text
                x={`${region.coordinatesX}%`}
                y={`${region.coordinatesY}%`}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#ffffff"
                fontSize="10"
                fontWeight="bold"
                className="pointer-events-none"
              >
                {region.painLevel}
              </text>

              {/* Badge "PRINCIPAL" se for queixa principal */}
              {isMain && showLabels && (
                <g>
                  <rect
                    x={`${region.coordinatesX - 15}%`}
                    y={`${region.coordinatesY - 25}%`}
                    width="30"
                    height="12"
                    fill="#fbbf24"
                    rx="2"
                  />
                  <text
                    x={`${region.coordinatesX}%`}
                    y={`${region.coordinatesY - 19}%`}
                    textAnchor="middle"
                    fill="#713f12"
                    fontSize="7"
                    fontWeight="bold"
                    className="pointer-events-none"
                  >
                    PRINCIPAL
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Instruções se não houver pontos */}
        {!readOnly && filteredRegions.length === 0 && (
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="12"
            className="pointer-events-none"
          >
            Clique para adicionar ponto de dor
          </text>
        )}
      </svg>

      {/* Legenda */}
      {showLabels && (
        <div className="absolute bottom-2 left-2 bg-white/90 rounded-lg p-2 text-xs">
          <div className="font-semibold mb-1">Nível de dor:</div>
          <div className="flex gap-1 items-center">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getPainLevelColor(2) }} />
            <span>1-2</span>
          </div>
          <div className="flex gap-1 items-center">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getPainLevelColor(4) }} />
            <span>3-4</span>
          </div>
          <div className="flex gap-1 items-center">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getPainLevelColor(6) }} />
            <span>5-6</span>
          </div>
          <div className="flex gap-1 items-center">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getPainLevelColor(8) }} />
            <span>7-8</span>
          </div>
          <div className="flex gap-1 items-center">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getPainLevelColor(10) }} />
            <span>9-10</span>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Retorna o path SVG do corpo humano - Vista Frontal
 */
function getFrontBodyPath(): string {
  return `
    M 100,30
    Q 95,25 100,20
    Q 105,25 100,30
    
    M 100,30
    L 100,45
    
    M 100,45
    Q 85,50 75,60
    L 70,90
    L 72,95
    
    M 100,45
    Q 115,50 125,60
    L 130,90
    L 128,95
    
    M 100,45
    L 100,150
    Q 95,155 85,160
    L 80,165
    
    M 100,150
    Q 105,155 115,160
    L 120,165
    
    M 85,160
    L 75,250
    L 70,340
    L 68,480
    
    M 115,160
    L 125,250
    L 130,340
    L 132,480
    
    M 72,95
    L 50,120
    L 45,140
    L 42,160
    
    M 128,95
    L 150,120
    L 155,140
    L 158,160
  `;
}

/**
 * Retorna o path SVG do corpo humano - Vista Posterior
 */
function getBackBodyPath(): string {
  return `
    M 100,30
    Q 95,25 100,20
    Q 105,25 100,30
    
    M 100,30
    L 100,45
    
    M 100,45
    Q 85,52 75,65
    L 70,95
    L 72,100
    
    M 100,45
    Q 115,52 125,65
    L 130,95
    L 128,100
    
    M 100,45
    L 100,155
    Q 95,160 85,165
    L 80,170
    
    M 100,155
    Q 105,160 115,165
    L 120,170
    
    M 85,165
    L 78,255
    L 73,345
    L 70,485
    
    M 115,165
    L 122,255
    L 127,345
    L 130,485
    
    M 72,100
    L 52,125
    L 47,145
    L 44,165
    
    M 128,100
    L 148,125
    L 153,145
    L 156,165
  `;
}

export default SVGSimpleBodyMap;

