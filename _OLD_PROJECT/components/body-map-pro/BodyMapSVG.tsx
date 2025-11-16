import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BodyRegionPolygon from './BodyRegionPolygon';
import {
  BODY_REGIONS_FRONT,
  BODY_REGIONS_BACK,
  type BodyRegion
} from './body-regions-data';

export interface PainData {
  regionId: string;
  intensity: number; // 0-10
  type?: string;
  notes?: string;
}

interface BodyMapSVGProps {
  view: 'front' | 'back';
  painData?: PainData[];
  onRegionClick: (regionId: string) => void;
  selectedRegionId?: string;
  showLabels?: boolean;
  interactive?: boolean;
}

/**
 * Componente SVG do Mapa Corporal Anatômico
 *
 * Features:
 * - Vista frontal e posterior
 * - Regiões anatômicas clicáveis
 * - Visualização de intensidade de dor
 * - Hover effects e animações
 * - Labels informativos
 */
const BodyMapSVG: React.FC<BodyMapSVGProps> = ({
  view,
  painData = [],
  onRegionClick,
  selectedRegionId,
  showLabels = false,
  interactive = true
}) => {
  const [hoveredRegionId, setHoveredRegionId] = useState<string | null>(null);

  // Selecionar regiões baseado na vista
  const regions = view === 'front' ? BODY_REGIONS_FRONT : BODY_REGIONS_BACK;

  // Criar mapa de intensidade de dor por região
  const painMap = new Map<string, number>();
  painData.forEach(data => {
    painMap.set(data.regionId, data.intensity);
  });

  // Handlers
  const handleRegionClick = (regionId: string) => {
    if (interactive) {
      onRegionClick(regionId);
    }
  };

  const handleMouseEnter = (regionId: string) => {
    if (interactive) {
      setHoveredRegionId(regionId);
    }
  };

  const handleMouseLeave = () => {
    setHoveredRegionId(null);
  };

  // Região atualmente em hover (para mostrar info)
  const hoveredRegion = regions.find(r => r.id === hoveredRegionId);

  return (
    <div className="relative w-full h-full">
      {/* SVG Principal */}
      <svg
        viewBox="0 0 300 600"
        className="w-full h-full"
        style={{ maxWidth: '400px', margin: '0 auto' }}
      >
        {/* Fundo sutil */}
        <rect
          x="0"
          y="0"
          width="300"
          height="600"
          fill="url(#bodyGradient)"
          opacity="0.3"
        />

        {/* Gradiente de fundo */}
        <defs>
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#eff6ff" />
            <stop offset="100%" stopColor="#dbeafe" />
          </linearGradient>

          {/* Filtro de sombra suave */}
          <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
            <feOffset dx="0" dy="2" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Regiões Anatômicas */}
        <g filter="url(#softShadow)">
          {regions.map((region) => (
            <BodyRegionPolygon
              key={region.id}
              region={region}
              painIntensity={painMap.get(region.id)}
              isSelected={selectedRegionId === region.id}
              isHovered={hoveredRegionId === region.id}
              onClick={handleRegionClick}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              showLabel={showLabels}
            />
          ))}
        </g>

        {/* Linha central de referência (sutil) */}
        <line
          x1="150"
          y1="20"
          x2="150"
          y2="580"
          stroke="#cbd5e1"
          strokeWidth="1"
          strokeDasharray="5,5"
          opacity="0.3"
          style={{ pointerEvents: 'none' }}
        />

        {/* Marca de vista */}
        <text
          x="150"
          y="595"
          textAnchor="middle"
          fontSize="10"
          fill="#64748b"
          fontWeight="600"
          style={{ pointerEvents: 'none' }}
        >
          Vista {view === 'front' ? 'Frontal' : 'Posterior'}
        </text>
      </svg>

      {/* Info Card de Região em Hover */}
      <AnimatePresence>
        {hoveredRegion && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white border border-slate-200 rounded-lg shadow-lg px-4 py-2 z-10 pointer-events-none"
            style={{ maxWidth: '90%' }}
          >
            <p className="text-sm font-semibold text-slate-800">
              {hoveredRegion.name}
            </p>
            {painMap.has(hoveredRegion.id) && (
              <p className="text-xs text-red-600 font-medium mt-1">
                Dor: {painMap.get(hoveredRegion.id)}/10
              </p>
            )}
            {!painMap.has(hoveredRegion.id) && (
              <p className="text-xs text-slate-500 mt-1">
                Clique para registrar dor
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contador de Regiões com Dor */}
      {painData.length > 0 && (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
          {painData.length} {painData.length === 1 ? 'região' : 'regiões'} com dor
        </div>
      )}
    </div>
  );
};

export default BodyMapSVG;
