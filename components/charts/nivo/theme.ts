import type { Theme } from '@nivo/core';
import { nivoPalette } from './palette';

const baseFont = 'Inter, system-ui, sans-serif';

export const nivoBaseTheme: Theme = {
  fontFamily: baseFont,
  fontSize: 12,
  textColor: nivoPalette.neutrals.text,
  axis: {
    domain: {
      line: {
        stroke: nivoPalette.neutrals.grid,
        strokeWidth: 1,
      },
    },
    ticks: {
      line: {
        stroke: nivoPalette.neutrals.grid,
        strokeWidth: 1,
      },
      text: {
        fill: nivoPalette.neutrals.subtle,
        fontSize: 12,
        fontWeight: 500,
      },
    },
    legend: {
      text: {
        fill: nivoPalette.neutrals.text,
        fontSize: 12,
      },
    },
  },
  grid: {
    line: {
      stroke: '#e2e8f0',
      strokeWidth: 1,
      strokeDasharray: '3 3',
    },
  },
  legends: {
    text: {
      fill: nivoPalette.neutrals.text,
      fontSize: 12,
    },
  },
  tooltip: {
    container: {
      background: '#ffffff',
      borderRadius: 8,
      border: '1px solid #e2e8f0',
      padding: '0.75rem',
      boxShadow: '0 20px 45px -24px rgba(15, 23, 42, 0.45)',
    },
  },
};

export const mergeThemes = (theme?: Theme): Theme =>
  theme ? { ...nivoBaseTheme, ...theme } : nivoBaseTheme;

