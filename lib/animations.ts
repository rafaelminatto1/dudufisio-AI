/**
 * Animation Variants Library
 * 
 * Reusable Framer Motion animation configurations for consistent
 * animations throughout the application.
 */

import { Variants } from 'framer-motion';

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
    transition: { duration: 0.2, ease: 'easeOut' }
  }
};

export const fadeOut: Variants = {
  visible: { opacity: 1 },
  hidden: { 
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' }
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
  visible: { scale: 1, opacity: 1 },
  hidden: { 
    scale: 0.8, 
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' }
  }
};

// Stagger Animations
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
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
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { 
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1] // Custom easing for smooth animation
    }
  }
};

// Card Animations
export const cardHover: Variants = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.02,
    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
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

// Pulse Animation
export const pulse: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.9, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Spin Animation
export const spin: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

// Drag Animations
export const dragItem: Variants = {
  dragging: {
    opacity: 0.8,
    rotate: 2,
    scale: 1.05,
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
    zIndex: 1000,
    transition: { duration: 0.2 }
  }
};

// Page Transition
export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { duration: 0.2 }
  }
};

// Notification Slide In
export const notificationSlideIn: Variants = {
  hidden: { x: 400, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { 
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  },
  exit: { 
    x: 400, 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

// Tooltip Fade
export const tooltipFade: Variants = {
  hidden: { opacity: 0, y: 5 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.15 }
  }
};

// Accordion Content
export const accordionContent: Variants = {
  hidden: { 
    height: 0,
    opacity: 0,
    transition: { duration: 0.2 }
  },
  visible: { 
    height: "auto",
    opacity: 1,
    transition: { 
      duration: 0.3,
      ease: "easeInOut"
    }
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
  hidden: { x: "-100%" },
  visible: { 
    x: 0,
    transition: { 
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  },
  exit: { 
    x: "-100%",
    transition: { duration: 0.2 }
  }
};

// Progress Bar
export const progressBar: Variants = {
  hidden: { width: 0 },
  visible: { 
    width: "100%",
    transition: { 
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

// Bounce Animation
export const bounce: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 0.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Shake Animation
export const shake: Variants = {
  animate: {
    x: [0, -10, 10, -10, 10, 0],
    transition: {
      duration: 0.5,
      ease: "easeInOut"
    }
  }
};

// Rotate Animation
export const rotate: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

// Zoom In Animation
export const zoomIn: Variants = {
  hidden: { scale: 0 },
  visible: { 
    scale: 1,
    transition: { 
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

// Slide Fade Animation
export const slideFade: Variants = {
  hidden: { x: -20, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { duration: 0.3 }
  }
};

// Height Expand Animation
export const heightExpand: Variants = {
  hidden: { height: 0, opacity: 0 },
  visible: { 
    height: "auto",
    opacity: 1,
    transition: { 
      duration: 0.3,
      ease: "easeInOut"
    }
  }
};

// Width Expand Animation
export const widthExpand: Variants = {
  hidden: { width: 0, opacity: 0 },
  visible: { 
    width: "auto",
    opacity: 1,
    transition: { 
      duration: 0.3,
      ease: "easeInOut"
    }
  }
};

// Combined Card Animation (for AppointmentCard)
export const appointmentCardVariants: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.2 }
  },
  hover: {
    scale: 1.02,
    y: -2,
    boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
    transition: { duration: 0.2 }
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 }
  }
};

// Drag Overlay Animation
export const dragOverlayVariants: Variants = {
  initial: { scale: 1 },
  animate: {
    scale: 1.05,
    rotate: 3,
    boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
    transition: { duration: 0.2 }
  }
};

// Time Slot Grid Animation
export const timeSlotVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.02,
      delayChildren: 0.1
    }
  }
};

// Time Slot Item Animation
export const timeSlotItem: Variants = {
  hidden: { opacity: 0, y: 5 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.2 }
  }
};

// Conflict Warning Animation
export const conflictWarning: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};
