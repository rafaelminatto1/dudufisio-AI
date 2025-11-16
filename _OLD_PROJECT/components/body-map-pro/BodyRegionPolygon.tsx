import React from 'react';
import { motion } from 'framer-motion';
import type { BodyRegion } from './body-regions-data';
import { getPainColor } from './body-regions-data';

const BASE_REGION_COLOR = 'rgba(96, 165, 250, 0.35)'; // Azul claro base
const BASE_REGION_COLOR_HOVER = 'rgba(96, 165, 250, 0.55)';
const BASE_STROKE_COLOR = '#2563EB';
const SELECTED_STROKE_COLOR = '#1D4ED8';
const HOVER_STROKE_COLOR = '#1E3A8A';

interface BodyRegionPolygonProps {
  region: BodyRegion;
  painIntensity?: number;  // 0-10, undefined = sem dor registrada
  isSelected?: boolean;
  isHovered?: boolean;
  onClick: (regionId: string) => void;
  onMouseEnter?: (regionId: string) => void;
  onMouseLeave?: () => void;
  showLabel?: boolean;
}

/**
 * Componente de região corporal clicável
 *
 * Features:
 * - Polígono SVG grande e clicável
 * - Animações de hover e click
 * - Cores baseadas em intensidade de dor
 * - Label opcional com nome da região
 */
const BodyRegionPolygon: React.FC<BodyRegionPolygonProps> = ({
  region,
  painIntensity,
  isSelected = false,
  isHovered = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
  showLabel = false
}) => {
  // Cor baseada em intensidade de dor, ou cor base da região
  const hasPain = painIntensity !== undefined && painIntensity > 0;
  const fillColor = hasPain
    ? getPainColor(painIntensity)
    : (isHovered ? BASE_REGION_COLOR_HOVER : BASE_REGION_COLOR);

  // Opacidade baseada no estado
  const getOpacity = () => {
    if (isSelected) return 0.95;
    if (isHovered) return 0.9;
    if (hasPain) return 0.95;
    return 0.8; // Opacidade padrão para regiões sem dor
  };

  // Stroke (borda) baseada no estado
  const getStroke = () => {
    if (isSelected) return SELECTED_STROKE_COLOR;
    if (isHovered) return HOVER_STROKE_COLOR;
    if (hasPain) {
      return '#7F1D1D'; // Vermelho escuro quando há dor
    }
    return BASE_STROKE_COLOR;
  };

  const getStrokeWidth = () => {
    if (isSelected) return '3';
    if (isHovered) return '2.5';
    return '1.8';
  };

  return (
    <g>
      {/* Polígono clicável */}
      <motion.path
        d={region.path}
        fill={fillColor}
        fillOpacity={getOpacity()}
        stroke={getStroke()}
        strokeWidth={getStrokeWidth()}
        strokeLinejoin="round"
        strokeLinecap="round"
        className="cursor-pointer transition-all duration-200"
        onClick={() => onClick(region.id)}
        onMouseEnter={() => onMouseEnter?.(region.id)}
        onMouseLeave={onMouseLeave}
        initial={false}
        animate={{
          scale: isSelected ? 1.05 : isHovered ? 1.02 : 1,
          opacity: getOpacity()
        }}
        transition={{
          duration: 0.2,
          ease: 'easeInOut'
        }}
        whileHover={{
          filter: 'brightness(1.1)'
        }}
        whileTap={{
          scale: 0.98
        }}
      >
        <title>{region.name}{painIntensity !== undefined && painIntensity > 0 ? ` - Dor ${painIntensity}/10` : ''}</title>
      </motion.path>

      {/* Label da região (se hover ou selected) */}
      {(showLabel || isHovered || isSelected) && (
        <motion.g
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.15 }}
        >
          {/* Background do label */}
          <rect
            x={region.x - 30}
            y={region.y - 25}
            width="60"
            height="18"
            rx="4"
            fill="rgba(0, 0, 0, 0.85)"
            stroke="white"
            strokeWidth="1"
          />

          {/* Texto do label */}
          <text
            x={region.x}
            y={region.y - 13}
            textAnchor="middle"
            fontSize="9"
            fontWeight="600"
            fill="white"
            style={{ pointerEvents: 'none' }}
          >
            {region.name.length > 15 ? region.name.substring(0, 15) + '...' : region.name}
          </text>

          {/* Intensidade de dor (se houver) */}
          {painIntensity !== undefined && painIntensity > 0 && (
            <text
              x={region.x}
              y={region.y - 2}
              textAnchor="middle"
              fontSize="10"
              fontWeight="700"
              fill={getPainColor(painIntensity)}
              style={{ pointerEvents: 'none' }}
            >
              {painIntensity}/10
            </text>
          )}
        </motion.g>
      )}

      {/* Indicador de dor (círculo pulsante) */}
      {painIntensity !== undefined && painIntensity >= 7 && (
        <motion.circle
          cx={region.x}
          cy={region.y}
          r="6"
          fill={getPainColor(painIntensity)}
          stroke="white"
          strokeWidth="2"
          initial={{ scale: 1, opacity: 0.8 }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          style={{ pointerEvents: 'none' }}
        />
      )}
    </g>
  );
};

export default BodyRegionPolygon;
