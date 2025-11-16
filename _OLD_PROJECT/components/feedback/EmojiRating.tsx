import React, { useState } from 'react';
import { EmojiRatingValue } from '../../types';

export interface EmojiRatingProps {
  value?: EmojiRatingValue;
  onChange: (value: EmojiRatingValue) => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  readonly?: boolean;
  showLabel?: boolean;
  className?: string;
}

interface EmojiConfig {
  value: EmojiRatingValue;
  emoji: string;
  label: string;
  color: string;
}

const emojis: EmojiConfig[] = [
  { value: 1, emoji: '😠', label: 'Muito Insatisfeito', color: 'text-red-500' },
  { value: 2, emoji: '😞', label: 'Insatisfeito', color: 'text-orange-500' },
  { value: 3, emoji: '😐', label: 'Neutro', color: 'text-yellow-500' },
  { value: 4, emoji: '🙂', label: 'Satisfeito', color: 'text-lime-500' },
  { value: 5, emoji: '😄', label: 'Muito Satisfeito', color: 'text-green-500' },
];

const sizeClasses = {
  sm: 'text-3xl',
  md: 'text-5xl',
  lg: 'text-7xl',
};

export function EmojiRating({
  value,
  onChange,
  size = 'md',
  disabled = false,
  readonly = false,
  showLabel = true,
  className = '',
}: EmojiRatingProps) {
  const [hoveredValue, setHoveredValue] = useState<EmojiRatingValue | null>(null);

  const currentValue = hoveredValue || value;
  const currentEmoji = emojis.find(e => e.value === currentValue);

  const handleClick = (emojiValue: EmojiRatingValue) => {
    if (!disabled && !readonly) {
      onChange(emojiValue);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent, emojiValue: EmojiRatingValue) => {
    if (!disabled && !readonly) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onChange(emojiValue);
      }
    }
  };

  const handleMouseEnter = (emojiValue: EmojiRatingValue) => {
    if (!disabled && !readonly) {
      setHoveredValue(emojiValue);
    }
  };

  const handleMouseLeave = () => {
    if (!disabled && !readonly) {
      setHoveredValue(null);
    }
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* Emojis */}
      <div 
        className="flex items-center gap-2"
        role="radiogroup"
        aria-label="Avaliação com emojis"
      >
        {emojis.map((emoji) => {
          const isSelected = value === emoji.value;
          const isHovered = hoveredValue === emoji.value;
          const isInteractive = !disabled && !readonly;

          return (
            <button
              key={emoji.value}
              type="button"
              disabled={disabled}
              onClick={() => handleClick(emoji.value)}
              onKeyDown={(e) => handleKeyDown(e, emoji.value)}
              onMouseEnter={() => handleMouseEnter(emoji.value)}
              onMouseLeave={handleMouseLeave}
              className={`
                ${sizeClasses[size]}
                transition-all duration-200
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${readonly ? 'cursor-default' : ''}
                ${isInteractive && !isSelected ? 'cursor-pointer hover:scale-125' : ''}
                ${isSelected ? 'scale-110' : isHovered ? 'scale-125' : 'opacity-40'}
                ${isInteractive && !isSelected ? 'hover:opacity-100' : ''}
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg
              `}
              title={emoji.label}
              aria-label={emoji.label}
              aria-checked={isSelected}
              role="radio"
              tabIndex={disabled || readonly ? -1 : 0}
            >
              {emoji.emoji}
            </button>
          );
        })}
      </div>

      {/* Label */}
      {showLabel && currentEmoji && (
        <p 
          className={`text-sm font-medium ${currentEmoji.color} transition-colors duration-200`}
          aria-live="polite"
        >
          {currentEmoji.label}
        </p>
      )}
    </div>
  );
}

// Helper function para obter emoji baseado no valor
export function getEmojiForValue(value: EmojiRatingValue): string {
  const emoji = emojis.find(e => e.value === value);
  return emoji?.emoji || '😐';
}

// Helper function para obter emoji baseado em média
export function getEmojiForAverage(avg: number): string {
  if (avg >= 4.5) return '😄';
  if (avg >= 3.5) return '🙂';
  if (avg >= 2.5) return '😐';
  if (avg >= 1.5) return '😞';
  return '😠';
}

// Helper function para obter label baseado no valor
export function getLabelForValue(value: EmojiRatingValue): string {
  const emoji = emojis.find(e => e.value === value);
  return emoji?.label || 'Não avaliado';
}

// Helper function para obter cor baseado no valor
export function getColorForValue(value: EmojiRatingValue): string {
  const emoji = emojis.find(e => e.value === value);
  return emoji?.color || 'text-gray-500';
}

