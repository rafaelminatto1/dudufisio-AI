/**
 * PainScaleSelector.tsx
 * Professional pain scale selector with visual feedback and accessibility
 *
 * @author DuduFisio-AI Engineering Team
 * @version 2.0.0
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

/**
 * Props interface for PainScaleSelector
 */
interface PainScaleSelectorProps {
  /** Current pain level value (0-10) */
  value: number;
  /** Callback when value changes */
  onChange: (value: number) => void;
  /** Whether to show numerical value */
  showValue?: boolean;
  /** Whether the selector is disabled */
  disabled?: boolean;
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Show descriptive labels */
  showLabels?: boolean;
  /** Container class name */
  className?: string;
}

/**
 * Pain level descriptions
 */
const PAIN_DESCRIPTIONS = {
  0: 'Sem dor',
  1: 'Muito leve',
  2: 'Leve',
  3: 'Moderado baixo',
  4: 'Moderado',
  5: 'Moderado alto',
  6: 'Forte',
  7: 'Muito forte',
  8: 'Intenso',
  9: 'Excruciante',
  10: 'Insuportável'
};

/**
 * Get color for pain level
 */
const getPainColor = (level: number): string => {
  if (level === 0) return '#e2e8f0'; // Gray for no pain
  if (level <= 3) return '#22c55e'; // Green
  if (level <= 6) return '#eab308'; // Yellow
  if (level <= 8) return '#f97316'; // Orange
  return '#ef4444'; // Red
};

/**
 * Get size classes based on size prop
 */
const getSizeClasses = (size: 'small' | 'medium' | 'large') => {
  switch (size) {
    case 'small':
      return {
        container: 'gap-1',
        button: 'w-6 h-6 text-xs',
        value: 'text-lg',
        label: 'text-xs'
      };
    case 'large':
      return {
        container: 'gap-3',
        button: 'w-12 h-12 text-lg',
        value: 'text-3xl',
        label: 'text-base'
      };
    default: // medium
      return {
        container: 'gap-2',
        button: 'w-8 h-8 text-sm',
        value: 'text-xl',
        label: 'text-sm'
      };
  }
};

/**
 * Professional pain scale selector component
 */
const PainScaleSelector: React.FC<PainScaleSelectorProps> = ({
  value,
  onChange,
  showValue = true,
  disabled = false,
  size = 'medium',
  showLabels = true,
  className = ''
}) => {
  const sizeClasses = useMemo(() => getSizeClasses(size), [size]);

  /**
   * Handle pain level selection
   */
  const handleSelect = (level: number) => {
    if (!disabled) {
      onChange(level);
    }
  };

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = (event: React.KeyboardEvent, level: number) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        handleSelect(level);
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        event.preventDefault();
        if (value > 0) {
          handleSelect(Math.max(0, value - 1));
        }
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        event.preventDefault();
        if (value < 10) {
          handleSelect(Math.min(10, value + 1));
        }
        break;
      case 'Home':
        event.preventDefault();
        handleSelect(0);
        break;
      case 'End':
        event.preventDefault();
        handleSelect(10);
        break;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Value Display */}
      {showValue && (
        <div className="text-center">
          <motion.div
            key={value}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`font-bold ${sizeClasses.value}`}
            style={{ color: getPainColor(value) }}
          >
            {value}/10
          </motion.div>
          {showLabels && (
            <motion.p
              key={value}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-gray-600 font-medium ${sizeClasses.label} mt-1`}
            >
              {PAIN_DESCRIPTIONS[value as keyof typeof PAIN_DESCRIPTIONS]}
            </motion.p>
          )}
        </div>
      )}

      {/* Scale Buttons */}
      <div className={`flex justify-center ${sizeClasses.container}`}>
        {Array.from({ length: 11 }, (_, index) => {
          const isSelected = value === index;
          const color = getPainColor(index);

          return (
            <motion.button
              key={index}
              type="button"
              onClick={() => handleSelect(index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              disabled={disabled}
              className={`
                ${sizeClasses.button}
                rounded-full font-semibold transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed
                ${isSelected ? 'shadow-lg ring-2 ring-white' : 'hover:scale-110'}
              `}
              style={{
                backgroundColor: color,
                color: index === 0 ? '#64748b' : '#ffffff',
                transform: isSelected ? 'scale(1.2)' : 'scale(1)',
                zIndex: isSelected ? 10 : 1
              }}
              whileHover={!disabled ? { scale: isSelected ? 1.2 : 1.1 } : {}}
              whileTap={!disabled ? { scale: 0.95 } : {}}
              animate={{
                scale: isSelected ? 1.2 : 1,
                backgroundColor: color
              }}
              aria-label={`Nível de dor ${index}: ${PAIN_DESCRIPTIONS[index as keyof typeof PAIN_DESCRIPTIONS]}`}
              aria-pressed={isSelected}
              role="radio"
              tabIndex={isSelected ? 0 : -1}
            >
              {index}
            </motion.button>
          );
        })}
      </div>

      {/* Scale Labels */}
      <div className="flex justify-between px-2">
        <span className={`text-gray-500 ${sizeClasses.label}`}>
          Sem dor
        </span>
        <span className={`text-gray-500 ${sizeClasses.label}`}>
          Dor máxima
        </span>
      </div>

      {/* Accessibility Instructions */}
      <div className="sr-only">
        <p>
          Use as setas do teclado para navegar, Enter ou Espaço para selecionar,
          Home para ir ao início (0), End para ir ao final (10).
        </p>
      </div>
    </div>
  );
};

export default PainScaleSelector;