import React from 'react';
import { motion } from 'framer-motion';
import {
  PAIN_INTENSITY_LABELS,
  PAIN_INTENSITY_EMOJIS,
  getPainColor
} from './body-regions-data';

interface PainIntensitySliderProps {
  value: number; // 0-10
  onChange: (value: number) => void;
  showEmojis?: boolean;
  showLabels?: boolean;
}

/**
 * Slider de Intensidade de Dor com Emojis
 *
 * Features:
 * - Slider visual 0-10
 * - Emojis representando intensidade (😊 → 😭)
 * - Labels descritivos
 * - Cores gradientes
 * - Animações suaves
 */
const PainIntensitySlider: React.FC<PainIntensitySliderProps> = ({
  value,
  onChange,
  showEmojis = true,
  showLabels = true
}) => {
  const currentColor = getPainColor(value);
  const currentLabel = PAIN_INTENSITY_LABELS[value];
  const currentEmoji = PAIN_INTENSITY_EMOJIS[value];

  return (
    <div className="space-y-4">
      {/* Emoji Atual (Grande) */}
      {showEmojis && (
        <motion.div
          key={value}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="text-center"
        >
          <span className="text-7xl">{currentEmoji}</span>
        </motion.div>
      )}

      {/* Valor e Label */}
      <div className="text-center space-y-1">
        <motion.div
          key={`value-${value}`}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-4xl font-bold"
          style={{ color: currentColor }}
        >
          {value}/10
        </motion.div>
        {showLabels && (
          <motion.div
            key={`label-${value}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm font-medium text-slate-600"
          >
            {currentLabel}
          </motion.div>
        )}
      </div>

      {/* Slider Principal */}
      <div className="relative px-2">
        {/* Track do slider */}
        <div className="relative h-3 bg-gradient-to-r from-green-400 via-yellow-400 via-orange-400 to-red-500 rounded-full shadow-inner">
          {/* Marcadores (0, 5, 10) */}
          {[0, 5, 10].map((mark) => (
            <div
              key={mark}
              className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2"
              style={{ left: `${(mark / 10) * 100}%` }}
            >
              <div className="w-1 h-3 bg-white rounded-full shadow-sm" />
            </div>
          ))}
        </div>

        {/* Input range (invisível mas funcional) */}
        <input
          type="range"
          min="0"
          max="10"
          step="1"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />

        {/* Thumb customizado (bolinha) */}
        <motion.div
          initial={false}
          animate={{
            left: `calc(${(value / 10) * 100}% - 12px)`,
            scale: 1
          }}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="absolute top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full shadow-lg border-4 border-white cursor-pointer pointer-events-none"
          style={{
            backgroundColor: currentColor
          }}
        />
      </div>

      {/* Escala Rápida (Botões) */}
      <div className="flex justify-between gap-1 mt-4">
        {[0, 2, 4, 6, 8, 10].map((quickValue) => (
          <button
            key={quickValue}
            onClick={() => onChange(quickValue)}
            className={`flex-1 py-2 px-1 rounded-lg text-xs font-semibold transition-all ${
              value === quickValue
                ? 'ring-2 ring-offset-2 shadow-md'
                : 'opacity-60 hover:opacity-100'
            }`}
            style={{
              backgroundColor: getPainColor(quickValue),
              color: quickValue <= 3 ? '#1f2937' : 'white'
            }}
          >
            {quickValue}
          </button>
        ))}
      </div>

      {/* Emojis de Referência (Mini) */}
      {showEmojis && (
        <div className="flex justify-between text-xl opacity-50 mt-2">
          <span>😊</span>
          <span>😐</span>
          <span>😣</span>
          <span>😫</span>
          <span>😭</span>
        </div>
      )}
    </div>
  );
};

export default PainIntensitySlider;
