import { Variants } from 'framer-motion';

/**
 * Configurações de animação reutilizáveis com Framer Motion
 */

// Slide In Animations
export const slideInFromLeft: Variants = {
  hidden: { x: -100, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  }
};

export const slideInFromRight: Variants = {
  hidden: { x: 100, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  }
};

export const slideInFromTop: Variants = {
  hidden: { y: -50, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  }
};

export const slideInFromBottom: Variants = {
  hidden: { y: 50, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  }
};

// Fade Animations
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.2 }
  }
};

export const fadeOut: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.2 }
  }
};

// Scale Animations
export const scaleIn: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { duration: 0.2, ease: 'easeOut' }
  }
};

export const scaleOut: Variants = {
  hidden: { scale: 1, opacity: 1 },
  visible: { 
    scale: 0.8, 
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' }
  }
};

// Stagger Animations (para listas)
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const staggerItem: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  }
};

// Modal Animations
export const modalBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.2 }
  }
};

export const modalContent: Variants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { 
      duration: 0.3,
      ease: 'easeOut'
    }
  }
};

// Card Animations
export const cardHover: Variants = {
  rest: { scale: 1, y: 0 },
  hover: { 
    scale: 1.02, 
    y: -4,
    transition: { duration: 0.2 }
  }
};

export const cardTap: Variants = {
  rest: { scale: 1 },
  tap: { 
    scale: 0.98,
    transition: { duration: 0.1 }
  }
};

// Loading Animations
export const pulse: Variants = {
  animate: {
    opacity: [1, 0.5, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

export const spin: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear'
    }
  }
};

// Drag & Drop Animations
export const dragItem: Variants = {
  initial: { scale: 1, opacity: 1 },
  drag: { 
    scale: 1.05, 
    opacity: 0.8,
    transition: { duration: 0.1 }
  }
};

// Page Transitions
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4 }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { duration: 0.3 }
  }
};

// Notification Animations
export const notificationSlideIn: Variants = {
  hidden: { x: 400, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { 
      type: 'spring',
      stiffness: 500,
      damping: 30
    }
  },
  exit: { 
    x: 400, 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

// Tooltip Animations
export const tooltipFade: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.2 }
  }
};

// Accordion Animations
export const accordionContent: Variants = {
  collapsed: { 
    height: 0,
    opacity: 0,
    transition: { duration: 0.3 }
  },
  expanded: { 
    height: 'auto',
    opacity: 1,
    transition: { duration: 0.3 }
  }
};

// Drawer Animations
export const drawerBackdrop: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.2 }
  }
};

export const drawerSlide: Variants = {
  hidden: { x: '-100%' },
  visible: { 
    x: 0,
    transition: { 
      type: 'spring',
      stiffness: 400,
      damping: 40
    }
  },
  exit: { 
    x: '-100%',
    transition: { duration: 0.2 }
  }
};

// Progress Bar Animation
export const progressBar: Variants = {
  initial: { width: 0 },
  animate: (progress: number) => ({
    width: `${progress}%`,
    transition: { duration: 0.5, ease: 'easeOut' }
  })
};

// Bounce Animation
export const bounce: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      repeatDelay: 1
    }
  }
};

// Shake Animation (para erros)
export const shake: Variants = {
  animate: {
    x: [0, -10, 10, -10, 10, 0],
    transition: {
      duration: 0.5
    }
  }
};

// Rotate Animation
export const rotate: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear'
    }
  }
};

// Zoom Animation
export const zoomIn: Variants = {
  hidden: { scale: 0 },
  visible: { 
    scale: 1,
    transition: { 
      type: 'spring',
      stiffness: 300,
      damping: 20
    }
  }
};

// Slide & Fade (combinado)
export const slideFade: Variants = {
  hidden: { x: -20, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { duration: 0.3 }
  }
};

// Height Animation (para expansão)
export const heightExpand: Variants = {
  collapsed: { 
    height: 0,
    transition: { duration: 0.3 }
  },
  expanded: { 
    height: 'auto',
    transition: { duration: 0.3 }
  }
};

// Width Animation
export const widthExpand: Variants = {
  collapsed: { 
    width: 0,
    transition: { duration: 0.3 }
  },
  expanded: { 
    width: 'auto',
    transition: { duration: 0.3 }
  }
};

