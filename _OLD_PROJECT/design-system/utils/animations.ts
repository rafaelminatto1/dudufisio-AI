export const animations = {
  // Transition utilities
  transition: {
    fast: 'transition-all duration-150 ease-in-out',
    medium: 'transition-all duration-300 ease-in-out',
    slow: 'transition-all duration-500 ease-in-out',
    bounce: 'transition-all duration-300 ease-bounce',
  },

  // Hover effects
  hover: {
    lift: 'hover:transform hover:scale-105 hover:-translate-y-1',
    glow: 'hover:shadow-lg hover:shadow-primary/20',
    fade: 'hover:opacity-80',
    slide: 'hover:translate-x-1',
  },

  // Focus effects
  focus: {
    ring: 'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
    shadow: 'focus:outline-none focus:shadow-lg focus:shadow-primary/30',
  },

  // Active effects
  active: {
    scale: 'active:scale-95',
    press: 'active:transform active:translate-y-0',
  },

  // Animation keyframes
  keyframes: {
    fadeIn: 'animate-fadeIn',
    slideIn: 'animate-slideIn',
    scaleIn: 'animate-scaleIn',
    bounceIn: 'animate-bounceIn',
    pulse: 'animate-pulse',
    spin: 'animate-spin',
  },

  // Custom animations
  custom: {
    shimmer: 'animate-shimmer',
    glow: 'animate-glow',
    float: 'animate-float',
    wiggle: 'animate-wiggle',
  },
} as const;

// Animation variants for different components
export const animationVariants = {
  button: `${animations.transition.fast} ${animations.hover.lift} ${animations.focus.ring} ${animations.active.scale}`,
  card: `${animations.transition.medium} ${animations.hover.glow}`,
  input: `${animations.transition.fast} ${animations.focus.ring}`,
  link: `${animations.transition.fast} ${animations.hover.fade} ${animations.hover.slide}`,
  icon: `${animations.transition.fast} ${animations.hover.lift}`,
  badge: `${animations.transition.fast} ${animations.hover.fade}`,
} as const;

// Complex animation combinations
export const complexAnimations = {
  elegantHover: `${animations.transition.medium} ${animations.hover.lift} ${animations.hover.glow}`,
  smoothFocus: `${animations.transition.fast} ${animations.focus.ring} ${animations.hover.fade}`,
  interactive: `${animations.transition.fast} ${animations.hover.lift} ${animations.focus.ring} ${animations.active.scale}`,
  premiumCard: `${animations.transition.slow} ${animations.hover.glow} ${animations.hover.lift}`,
  subtlePulse: `${animations.transition.medium} hover:animate-pulse`,
} as const;