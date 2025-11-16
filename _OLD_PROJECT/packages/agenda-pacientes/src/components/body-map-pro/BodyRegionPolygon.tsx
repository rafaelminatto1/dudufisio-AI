import React from 'react';
import { motion } from 'framer-motion';
import type { BodyRegion } from './body-regions-data';
import { getPainColor } from './body-regions-data';

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
  const fillColor = painIntensity !== undefined && painIntensity > 0
    ? getPainColor(painIntensity)
    : region.color;

  // Opacidade baseada no estado
  const getOpacity = () => {
    if (isSelected) return 0.9;
    if (isHovered) return 0.8;
    if (painIntensity !== undefined && painIntensity > 0) return 0.85;
    return 0.5; // Opacidade padrão para regiões sem dor
  };

  // Stroke (borda) baseada no estado
  const getStroke = () => {
    if (isSelected) return '#1e40af'; // Azul escuro
    if (isHovered) return '#3b82f6'; // Azul
    if (painIntensity !== undefined && painIntensity > 0) {
      return '#991b1b'; // Vermelho escuro se tem dor
    }
    return '#64748b'; // Cinza padrão
  };

  const getStrokeWidth = () => {
    if (isSelected) return '3';
    if (isHovered) return '2.5';
    return '1.5';
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
