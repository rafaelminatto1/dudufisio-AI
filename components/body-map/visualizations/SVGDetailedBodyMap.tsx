/**
 * SVG DETAILED BODY MAP
 * Visualização anatômica detalhada do corpo humano
 * Com regiões clicáveis e anatomicamente precisas
 */

import React, { useRef, useState } from 'react';
import type { BodyMapVisualizationProps } from '../../../types';
import { getPainLevelColor } from '../../../services/bodyMapService';

interface BodyRegion {
  id: string;
  name: string;
  path: string;
  color: string;
}

const SVGDetailedBodyMap: React.FC<BodyMapVisualizationProps> = ({
  bodySide,
  painRegions,
  mainComplaint,
  onAddPoint,
  onSelectPoint,
  readOnly = false,
  showLabels = true,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

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

  // Regiões anatômicas
  const anatomicalRegions: BodyRegion[] = bodySide === 'front' 
    ? getFrontAnatomicalRegions()
    : getBackAnatomicalRegions();

  return (
    <div className="relative w-full h-full">
      <svg
        ref={svgRef}
        viewBox="0 0 300 700"
        className={`w-full h-full ${!readOnly ? 'cursor-crosshair' : ''}`}
        onClick={handleSvgClick}
      >
        <defs>
          {/* Gradientes para dar profundidade */}
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          
          {/* Sombra para pontos de dor */}
          <filter id="painPointShadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
          </filter>
        </defs>

        {/* Fundo das regiões anatômicas */}
        <g className="anatomical-regions">
          {anatomicalRegions.map(region => (
            <path
              key={region.id}
              d={region.path}
              fill={hoveredRegion === region.id ? '#cbd5e1' : '#e2e8f0'}
              stroke="#94a3b8"
              strokeWidth="1.5"
              className="transition-all cursor-pointer hover:fill-slate-300"
              onMouseEnter={() => setHoveredRegion(region.id)}
              onMouseLeave={() => setHoveredRegion(null)}
            />
          ))}
        </g>

        {/* Labels das regiões (apenas se hover) */}
        {hoveredRegion && showLabels && (
          <g className="region-label">
            {(() => {
              const region = anatomicalRegions.find(r => r.id === hoveredRegion);
              if (!region) return null;
              
              return (
                <text
                  x="150"
                  y="20"
                  textAnchor="middle"
                  fill="#1e293b"
                  fontSize="14"
                  fontWeight="bold"
                  className="pointer-events-none"
                >
                  {region.name}
                </text>
              );
            })()}
          </g>
        )}

        {/* Pontos de dor */}
        <g className="pain-points">
          {filteredRegions.map(region => {
            const isMain = region.id === mainComplaint?.id;
            const color = getPainLevelColor(region.painLevel);
            const size = isMain ? 14 : 10;
            
            return (
              <g key={region.id} filter="url(#painPointShadow)">
                {/* Pulso animado para queixa principal */}
                {isMain && (
                  <circle
                    cx={`${region.coordinatesX}%`}
                    cy={`${region.coordinatesY}%`}
                    r={size + 4}
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="2"
                    opacity="0.6"
                  >
                    <animate
                      attributeName="r"
                      from={size}
                      to={size + 8}
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      from="0.8"
                      to="0"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Círculo do ponto */}
                <circle
                  cx={`${region.coordinatesX}%`}
                  cy={`${region.coordinatesY}%`}
                  r={size}
                  fill={color}
                  stroke={isMain ? '#fbbf24' : '#ffffff'}
                  strokeWidth={isMain ? 3 : 2}
                  className="cursor-pointer transition-all hover:r-12"
                  onClick={(e) => handlePointClick(region, e)}
                />
                
                {/* Nível de dor */}
                <text
                  x={`${region.coordinatesX}%`}
                  y={`${region.coordinatesY}%`}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#ffffff"
                  fontSize="11"
                  fontWeight="bold"
                  className="pointer-events-none select-none"
                >
                  {region.painLevel}
                </text>

                {/* Badge "PRINCIPAL" */}
                {isMain && showLabels && (
                  <g>
                    <rect
                      x={`${region.coordinatesX - 18}%`}
                      y={`${region.coordinatesY - 30}%`}
                      width="36"
                      height="14"
                      fill="#fbbf24"
                      rx="3"
                    />
                    <text
                      x={`${region.coordinatesX}%`}
                      y={`${region.coordinatesY - 23}%`}
                      textAnchor="middle"
                      fill="#713f12"
                      fontSize="8"
                      fontWeight="bold"
                      className="pointer-events-none"
                    >
                      PRINCIPAL
                    </text>
                  </g>
                )}

                {/* Indicador se região está resolvida */}
                {!region.isActive && (
                  <g>
                    <circle
                      cx={`${region.coordinatesX}%`}
                      cy={`${region.coordinatesY}%`}
                      r={size}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3"
                      strokeDasharray="2,2"
                    />
                    <text
                      x={`${region.coordinatesX}%`}
                      y={`${region.coordinatesY + 20}%`}
                      textAnchor="middle"
                      fill="#10b981"
                      fontSize="8"
                      fontWeight="bold"
                    >
                      ✓ Resolvida
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </g>

        {/* Instruções se não houver pontos */}
        {!readOnly && filteredRegions.length === 0 && (
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="14"
            className="pointer-events-none"
          >
            Clique em uma região para adicionar ponto de dor
          </text>
        )}
      </svg>

      {/* Legenda lateral */}
      {showLabels && (
        <div className="absolute top-2 right-2 bg-white/95 rounded-lg shadow-lg p-3 text-xs max-w-xs">
          <div className="font-bold mb-2 text-slate-700">Legenda</div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-amber-500" style={{ backgroundColor: getPainLevelColor(5) }} />
              <span>Queixa Principal</span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-white" style={{ backgroundColor: getPainLevelColor(3) }} />
              <span>Dor Secundária</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-green-500 border-dashed bg-white" />
              <span>Resolvida</span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-200">
            <div className="font-semibold mb-1 text-slate-600">Intensidade:</div>
            <div className="flex items-center gap-1">
              {[2, 4, 6, 8, 10].map(level => (
                <div
                  key={level}
                  className="flex-1 h-5 rounded flex items-center justify-center text-white text-[10px] font-bold"
                  style={{ backgroundColor: getPainLevelColor(level) }}
                >
                  {level}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[9px] text-slate-500 mt-1">
              <span>Leve</span>
              <span>Intensa</span>
            </div>
          </div>
        </div>
      )}

      {/* Contador de pontos */}
      {filteredRegions.length > 0 && (
        <div className="absolute bottom-2 left-2 bg-slate-800/90 text-white rounded-lg px-3 py-2 text-sm">
          <div className="font-semibold">{filteredRegions.length}</div>
          <div className="text-xs text-slate-300">
            {filteredRegions.length === 1 ? 'ponto' : 'pontos'} de dor
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Regiões anatômicas - Vista Frontal
 */
function getFrontAnatomicalRegions(): BodyRegion[] {
  return [
    {
      id: 'head',
      name: 'Cabeça',
      path: 'M 150,40 Q 140,30 150,25 Q 160,30 150,40 Z',
      color: '#e2e8f0',
    },
    {
      id: 'neck',
      name: 'Pescoço',
      path: 'M 140,45 L 140,60 L 160,60 L 160,45 Z',
      color: '#e2e8f0',
    },
    {
      id: 'chest',
      name: 'Peito / Tórax',
      path: 'M 120,70 Q 115,90 120,120 L 180,120 Q 185,90 180,70 Z',
      color: '#e2e8f0',
    },
    {
      id: 'abdomen',
      name: 'Abdômen',
      path: 'M 125,125 L 125,180 Q 130,185 150,185 Q 170,185 175,180 L 175,125 Z',
      color: '#e2e8f0',
    },
    {
      id: 'shoulder_right',
      name: 'Ombro Direito',
      path: 'M 110,70 L 90,85 L 95,105 L 120,95 Z',
      color: '#e2e8f0',
    },
    {
      id: 'shoulder_left',
      name: 'Ombro Esquerdo',
      path: 'M 190,70 L 210,85 L 205,105 L 180,95 Z',
      color: '#e2e8f0',
    },
    // Adicionar mais regiões conforme necessário
  ];
}

/**
 * Regiões anatômicas - Vista Posterior
 */
function getBackAnatomicalRegions(): BodyRegion[] {
  return [
    {
      id: 'head',
      name: 'Cabeça',
      path: 'M 150,40 Q 140,30 150,25 Q 160,30 150,40 Z',
      color: '#e2e8f0',
    },
    {
      id: 'neck',
      name: 'Pescoço',
      path: 'M 140,45 L 140,60 L 160,60 L 160,45 Z',
      color: '#e2e8f0',
    },
    {
      id: 'upper_back',
      name: 'Parte Superior das Costas',
      path: 'M 120,70 Q 115,90 120,120 L 180,120 Q 185,90 180,70 Z',
      color: '#e2e8f0',
    },
    {
      id: 'lumbar',
      name: 'Lombar',
      path: 'M 125,125 L 125,180 L 175,180 L 175,125 Z',
      color: '#e2e8f0',
    },
    {
      id: 'sacral',
      name: 'Sacral / Glúteos',
      path: 'M 130,185 Q 135,210 145,220 L 155,220 Q 165,210 170,185 Z',
      color: '#e2e8f0',
    },
    // Adicionar mais regiões conforme necessário
  ];
}

export default SVGDetailedBodyMap;

