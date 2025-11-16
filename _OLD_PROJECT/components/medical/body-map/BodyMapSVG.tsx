/**
 * BodyMapSVG.tsx
 * Professional-grade responsive SVG body map component
 * Implements accessibility standards and performance optimizations
 *
 * @author DuduFisio-AI Engineering Team
 * @version 2.0.0
 */

import React, { useMemo, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { BodyPoint } from '../../../types';

/**
 * Props interface for BodyMapSVG
 */
interface BodyMapSVGProps {
  /** Which side of the body to display */
  side: 'front' | 'back';
  /** Array of body points to render */
  points: BodyPoint[];
  /** Callback when a point is clicked */
  onPointClick: (point: BodyPoint) => void;
  /** Callback when SVG is clicked (for adding new points) */
  onSVGClick: (coordinates: { x: number; y: number }, region: string) => void;
  /** ID of currently selected point */
  selectedPointId?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Read-only mode */
  readOnly?: boolean;
  /** Container class name */
  className?: string;
}

/**
 * Body regions mapping for coordinates
 */
const BODY_REGIONS = {
  front: {
    head: { x: 0.5, y: 0.08, radius: 0.05 },
    neck: { x: 0.5, y: 0.15, radius: 0.03 },
    chest: { x: 0.5, y: 0.25, radius: 0.08 },
    leftShoulder: { x: 0.35, y: 0.2, radius: 0.04 },
    rightShoulder: { x: 0.65, y: 0.2, radius: 0.04 },
    leftArm: { x: 0.25, y: 0.35, radius: 0.03 },
    rightArm: { x: 0.75, y: 0.35, radius: 0.03 },
    leftElbow: { x: 0.2, y: 0.45, radius: 0.025 },
    rightElbow: { x: 0.8, y: 0.45, radius: 0.025 },
    leftWrist: { x: 0.15, y: 0.55, radius: 0.02 },
    rightWrist: { x: 0.85, y: 0.55, radius: 0.02 },
    abdomen: { x: 0.5, y: 0.4, radius: 0.06 },
    pelvis: { x: 0.5, y: 0.55, radius: 0.05 },
    leftHip: { x: 0.42, y: 0.58, radius: 0.03 },
    rightHip: { x: 0.58, y: 0.58, radius: 0.03 },
    leftThigh: { x: 0.42, y: 0.7, radius: 0.04 },
    rightThigh: { x: 0.58, y: 0.7, radius: 0.04 },
    leftKnee: { x: 0.42, y: 0.8, radius: 0.025 },
    rightKnee: { x: 0.58, y: 0.8, radius: 0.025 },
    leftShin: { x: 0.42, y: 0.9, radius: 0.02 },
    rightShin: { x: 0.58, y: 0.9, radius: 0.02 },
    leftAnkle: { x: 0.42, y: 0.95, radius: 0.02 },
    rightAnkle: { x: 0.58, y: 0.95, radius: 0.02 }
  },
  back: {
    head: { x: 0.5, y: 0.08, radius: 0.05 },
    neck: { x: 0.5, y: 0.15, radius: 0.03 },
    upperBack: { x: 0.5, y: 0.25, radius: 0.08 },
    leftShoulder: { x: 0.35, y: 0.2, radius: 0.04 },
    rightShoulder: { x: 0.65, y: 0.2, radius: 0.04 },
    midBack: { x: 0.5, y: 0.4, radius: 0.06 },
    lowerBack: { x: 0.5, y: 0.52, radius: 0.06 },
    leftGlute: { x: 0.42, y: 0.6, radius: 0.04 },
    rightGlute: { x: 0.58, y: 0.6, radius: 0.04 },
    leftHamstring: { x: 0.42, y: 0.72, radius: 0.04 },
    rightHamstring: { x: 0.58, y: 0.72, radius: 0.04 },
    leftCalf: { x: 0.42, y: 0.88, radius: 0.03 },
    rightCalf: { x: 0.58, y: 0.88, radius: 0.03 }
  }
};

/**
 * Get pain level color
 */
const getPainColor = (level: number): string => {
  if (level <= 3) return '#22c55e'; // Green
  if (level <= 6) return '#eab308'; // Yellow
  if (level <= 8) return '#f97316'; // Orange
  return '#ef4444'; // Red
};

/**
 * Get region name from coordinates
 */
const getRegionFromCoordinates = (x: number, y: number, side: 'front' | 'back'): string => {
  const regions = BODY_REGIONS[side];

  for (const [regionName, region] of Object.entries(regions)) {
    const distance = Math.sqrt(
      Math.pow(x - region.x, 2) + Math.pow(y - region.y, 2)
    );

    if (distance <= region.radius) {
      return regionName;
    }
  }

  return 'other';
};

/**
 * Professional SVG body map component
 */
const BodyMapSVG: React.FC<BodyMapSVGProps> = ({
  side,
  points,
  onPointClick,
  onSVGClick,
  selectedPointId,
  isLoading = false,
  readOnly = false,
  className = ''
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);

  /**
   * Filter points for current side
   */
  const currentSidePoints = useMemo(
    () => points.filter(point => point.bodySide === side),
    [points, side]
  );

  /**
   * Handle SVG click with coordinate normalization
   */
  const handleSVGClick = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    if (readOnly || isLoading) return;

    const svg = event.currentTarget;
    const rect = svg.getBoundingClientRect();

    // Normalize coordinates to 0-1 range
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    // Detect region
    const region = getRegionFromCoordinates(x, y, side);

    onSVGClick({ x, y }, region);
  }, [readOnly, isLoading, side, onSVGClick]);

  /**
   * Handle point click
   */
  const handlePointClick = useCallback((event: React.MouseEvent, point: BodyPoint) => {
    event.stopPropagation();
    onPointClick(point);
  }, [onPointClick]);

  /**
   * Body outline path for current side
   */
  const bodyOutlinePath = useMemo(() => {
    if (side === 'front') {
      return `
        M 200 60
        C 190 40, 210 40, 220 60
        L 220 80
        C 240 90, 250 120, 260 150
        L 280 200
        C 285 250, 280 300, 275 350
        L 270 400
        C 268 450, 265 500, 260 550
        L 250 600
        L 240 650
        C 235 700, 240 750, 245 800
        L 250 850
        L 255 900
        L 260 950
        L 250 1000
        L 150 1000
        L 140 950
        L 145 900
        L 150 850
        C 155 800, 160 750, 155 700
        L 150 650
        L 140 600
        L 130 550
        C 125 500, 122 450, 120 400
        L 115 350
        C 110 300, 105 250, 110 200
        L 130 150
        C 140 120, 150 90, 170 80
        L 170 60
        C 180 40, 200 40, 200 60
        Z
      `;
    } else {
      return `
        M 200 60
        C 190 40, 210 40, 220 60
        L 220 80
        C 240 90, 250 120, 260 150
        L 280 200
        C 285 250, 280 300, 275 350
        L 270 400
        C 268 450, 265 500, 260 550
        L 250 600
        L 240 650
        C 235 700, 240 750, 245 800
        L 250 850
        L 255 900
        L 260 950
        L 250 1000
        L 150 1000
        L 140 950
        L 145 900
        L 150 850
        C 155 800, 160 750, 155 700
        L 150 650
        L 140 600
        L 130 550
        C 125 500, 122 450, 120 400
        L 115 350
        C 110 300, 105 250, 110 200
        L 130 150
        C 140 120, 150 90, 170 80
        L 170 60
        C 180 40, 200 40, 200 60
        Z
      `;
    }
  }, [side]);

  return (
    <div className={`relative w-full max-w-md mx-auto ${className}`}>
      <svg
        viewBox="0 0 400 1000"
        className="w-full h-auto cursor-pointer touch-manipulation"
        onClick={handleSVGClick}
        role="img"
        aria-label={`Mapa corporal - vista ${side === 'front' ? 'frontal' : 'das costas'}`}
      >
        {/* Body outline */}
        <motion.path
          d={bodyOutlinePath}
          fill="#f8fafc"
          stroke="#e2e8f0"
          strokeWidth="2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />

        {/* Region guides (invisible but clickable) */}
        {Object.entries(BODY_REGIONS[side]).map(([regionName, region]) => (
          <circle
            key={regionName}
            cx={region.x * 400}
            cy={region.y * 1000}
            r={region.radius * 400}
            fill="transparent"
            className="hover:fill-blue-100 hover:fill-opacity-30 transition-all cursor-pointer"
            data-region={regionName}
          />
        ))}

        {/* Pain points */}
        {currentSidePoints.map((point) => (
          <motion.g
            key={point.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Point shadow */}
            <circle
              cx={point.coordinates.x * 400 + 2}
              cy={point.coordinates.y * 1000 + 2}
              r={selectedPointId === point.id ? 12 : hoveredPoint === point.id ? 10 : 8}
              fill="rgba(0,0,0,0.15)"
            />

            {/* Main point */}
            <motion.circle
              cx={point.coordinates.x * 400}
              cy={point.coordinates.y * 1000}
              r={selectedPointId === point.id ? 12 : hoveredPoint === point.id ? 10 : 8}
              fill={getPainColor(point.painLevel)}
              stroke={selectedPointId === point.id ? '#1d4ed8' : '#ffffff'}
              strokeWidth={selectedPointId === point.id ? 3 : 2}
              className="cursor-pointer"
              onClick={(e) => handlePointClick(e, point)}
              onMouseEnter={() => setHoveredPoint(point.id)}
              onMouseLeave={() => setHoveredPoint(null)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              animate={{
                scale: selectedPointId === point.id ? 1.2 : 1,
                stroke: selectedPointId === point.id ? '#1d4ed8' : '#ffffff'
              }}
            />

            {/* Pain level indicator */}
            <text
              x={point.coordinates.x * 400}
              y={point.coordinates.y * 1000 + 4}
              textAnchor="middle"
              className="text-xs font-bold fill-white pointer-events-none select-none"
              style={{ fontSize: '12px' }}
            >
              {point.painLevel}
            </text>

            {/* Tooltip on hover */}
            {hoveredPoint === point.id && (
              <motion.g
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <rect
                  x={point.coordinates.x * 400 - 60}
                  y={point.coordinates.y * 1000 - 50}
                  width="120"
                  height="35"
                  rx="6"
                  fill="rgba(0,0,0,0.9)"
                  className="pointer-events-none"
                />
                <text
                  x={point.coordinates.x * 400}
                  y={point.coordinates.y * 1000 - 35}
                  textAnchor="middle"
                  className="text-xs fill-white pointer-events-none select-none"
                  style={{ fontSize: '10px' }}
                >
                  {point.painType} - {point.painLevel}/10
                </text>
                <text
                  x={point.coordinates.x * 400}
                  y={point.coordinates.y * 1000 - 22}
                  textAnchor="middle"
                  className="text-xs fill-gray-300 pointer-events-none select-none"
                  style={{ fontSize: '8px' }}
                >
                  {point.bodyRegion}
                </text>
              </motion.g>
            )}
          </motion.g>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <circle
              cx="200"
              cy="500"
              r="20"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="31.416"
              strokeDashoffset="31.416"
            >
              <animate
                attributeName="stroke-dasharray"
                dur="2s"
                values="0 31.416;15.708 15.708;0 31.416"
                repeatCount="indefinite"
              />
            </circle>
          </motion.g>
        )}
      </svg>

      {/* Accessibility improvements */}
      <div className="sr-only">
        <p>Mapa corporal interativo mostrando {currentSidePoints.length} pontos de dor.</p>
        <p>Use as teclas Tab e Enter para navegar pelos pontos.</p>
        {currentSidePoints.map((point) => (
          <button key={point.id} onClick={() => onPointClick(point)}>
            {point.painType} na região {point.bodyRegion}, nível {point.painLevel}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BodyMapSVG;