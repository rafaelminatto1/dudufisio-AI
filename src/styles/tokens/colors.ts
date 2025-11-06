/**
 * SISTEMA DE CORES - MONDAY.COM INSPIRED
 * ======================================
 *
 * Design System baseado nas melhores práticas do Monday.com
 * Paleta vibrante, moderna e harmoniosa
 *
 * @see https://style.monday.com/ (inspiração)
 */

export const mondayColors = {
  // ============================================
  // CORES PRINCIPAIS
  // ============================================

  /** Roxo/Azul vibrante - Cor primária do sistema */
  primary: {
    DEFAULT: '#5034FF',
    50: '#F5F3FF',
    100: '#EDE9FE',
    200: '#DDD6FE',
    300: '#C4B5FD',
    400: '#A78BFA',
    500: '#5034FF',
    600: '#4028E0',
    700: '#3620C0',
    800: '#2D1A99',
    900: '#1E1266',
    hover: '#4028E0',
    light: '#E8E4FF',
    foreground: '#FFFFFF',
  },

  /** Verde - Cor secundária, sucesso e ações positivas */
  secondary: {
    DEFAULT: '#00CA72',
    50: '#E6F9F2',
    100: '#CCF3E5',
    200: '#99E7CB',
    300: '#66DBB1',
    400: '#33CF97',
    500: '#00CA72',
    600: '#00B366',
    700: '#009954',
    800: '#007A43',
    900: '#005C32',
    hover: '#00B366',
    light: '#E6F9F2',
    foreground: '#FFFFFF',
  },

  // ============================================
  // CORES DE ACENTO
  // ============================================

  accent: {
    /** Laranja - Destaque, atenção */
    orange: {
      DEFAULT: '#FDAB3D',
      50: '#FFF4E6',
      100: '#FFE9CC',
      200: '#FFD399',
      300: '#FFBD66',
      400: '#FFA733',
      500: '#FDAB3D',
      600: '#E69A36',
      700: '#CC892F',
      800: '#B37828',
      900: '#996721',
      light: '#FFF4E6',
    },

    /** Rosa - Criatividade, destaque secundário */
    pink: {
      DEFAULT: '#FF6AC2',
      50: '#FFE9F5',
      100: '#FFD3EB',
      200: '#FFA7D7',
      300: '#FF7BC3',
      400: '#FF4FAF',
      500: '#FF6AC2',
      600: '#E660AF',
      700: '#CC569C',
      800: '#B34C89',
      900: '#994276',
      light: '#FFE9F5',
    },

    /** Azul claro - Informação, calma */
    blue: {
      DEFAULT: '#579BFC',
      50: '#E8F2FF',
      100: '#D1E5FF',
      200: '#A3CBFF',
      300: '#75B1FF',
      400: '#4797FF',
      500: '#579BFC',
      600: '#4E8CE3',
      700: '#457DCA',
      800: '#3C6EB1',
      900: '#335F98',
      light: '#E8F2FF',
    },

    /** Roxo - Exclusividade, premium */
    purple: {
      DEFAULT: '#A25DDC',
      50: '#F3E8FF',
      100: '#E7D1FF',
      200: '#CFA3FF',
      300: '#B775FF',
      400: '#9F47FF',
      500: '#A25DDC',
      600: '#9254C6',
      700: '#824BB0',
      800: '#72429A',
      900: '#623984',
      light: '#F3E8FF',
    },
  },

  // ============================================
  // CORES NEUTRAS
  // ============================================

  neutral: {
    /** Background principal - Branco puro */
    bg: '#FFFFFF',

    /** Background alternativo - Cinza muito claro */
    bgAlt: '#F6F7FB',

    /** Background escuro - Para hover/estados */
    bgDark: '#F0F1F5',

    /** Texto primário - Preto suave */
    text: '#323338',

    /** Texto secundário - Cinza médio */
    textSecondary: '#676879',

    /** Texto terciário - Cinza claro */
    textTertiary: '#9699A6',

    /** Borda padrão */
    border: '#E6E9EF',

    /** Borda em hover */
    borderHover: '#C5C7D0',
  },

  // ============================================
  // CORES DE STATUS
  // ============================================

  status: {
    /** Sucesso - Verde */
    success: {
      DEFAULT: '#00CA72',
      light: '#E6F9F2',
      dark: '#00B366',
      foreground: '#FFFFFF',
    },

    /** Aviso - Laranja */
    warning: {
      DEFAULT: '#FDAB3D',
      light: '#FFF4E6',
      dark: '#E69A36',
      foreground: '#323338',
    },

    /** Erro - Vermelho */
    error: {
      DEFAULT: '#E44258',
      light: '#FFE9EC',
      dark: '#CC3B4E',
      foreground: '#FFFFFF',
    },

    /** Informação - Azul */
    info: {
      DEFAULT: '#579BFC',
      light: '#E8F2FF',
      dark: '#4E8CE3',
      foreground: '#FFFFFF',
    },
  },

  // ============================================
  // SOMBRAS
  // ============================================

  shadow: {
    /** Sombra leve para cards */
    card: 'rgba(0, 0, 0, 0.08)',

    /** Sombra média para hover */
    cardHover: 'rgba(0, 0, 0, 0.12)',

    /** Sombra forte para active/modal */
    cardActive: 'rgba(0, 0, 0, 0.16)',
  },
} as const;

/**
 * Exportação simplificada para uso no Tailwind Config
 */
export const tailwindColors = {
  primary: mondayColors.primary,
  secondary: mondayColors.secondary,
  accent: mondayColors.accent,
  neutral: mondayColors.neutral,
  success: mondayColors.status.success,
  warning: mondayColors.status.warning,
  error: mondayColors.status.error,
  info: mondayColors.status.info,
};

export default mondayColors;
