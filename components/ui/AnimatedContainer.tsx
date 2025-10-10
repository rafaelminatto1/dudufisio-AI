import React from 'react';
import { motion, Variants } from 'framer-motion';
import { cn } from '../../lib/utils';

interface AnimatedContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  animation?: 'fadeInUp' | 'slideInLeft' | 'slideInRight' | 'scaleIn' | 'stagger';
  delay?: number;
  duration?: number;
  staggerChildren?: number;
  className?: string;
}

const AnimatedContainer: React.FC<AnimatedContainerProps> = ({
  children,
  animation = 'fadeInUp',
  delay = 0,
  duration = 0.6,
  staggerChildren = 0.1,
  className,
  ...props
}) => {
  const variants: Record<string, Variants> = {
    fadeInUp: {
      initial: {
        opacity: 0,
        y: 30,
      },
      animate: {
        opacity: 1,
        y: 0,
        transition: {
          duration,
          delay,
          ease: [0.6, -0.05, 0.01, 0.99],
        },
      },
      exit: {
        opacity: 0,
        y: -30,
        transition: {
          duration: duration * 0.5,
        },
      },
    },
    slideInLeft: {
      initial: {
        opacity: 0,
        x: -30,
      },
      animate: {
        opacity: 1,
        x: 0,
        transition: {
          duration,
          delay,
          ease: [0.6, -0.05, 0.01, 0.99],
        },
      },
      exit: {
        opacity: 0,
        x: -30,
        transition: {
          duration: duration * 0.5,
        },
      },
    },
    slideInRight: {
      initial: {
        opacity: 0,
        x: 30,
      },
      animate: {
        opacity: 1,
        x: 0,
        transition: {
          duration,
          delay,
          ease: [0.6, -0.05, 0.01, 0.99],
        },
      },
      exit: {
        opacity: 0,
        x: 30,
        transition: {
          duration: duration * 0.5,
        },
      },
    },
    scaleIn: {
      initial: {
        opacity: 0,
        scale: 0.95,
      },
      animate: {
        opacity: 1,
        scale: 1,
        transition: {
          duration,
          delay,
          ease: [0.6, -0.05, 0.01, 0.99],
        },
      },
      exit: {
        opacity: 0,
        scale: 0.95,
        transition: {
          duration: duration * 0.5,
        },
      },
    },
    stagger: {
      initial: {
        opacity: 0,
      },
      animate: {
        opacity: 1,
        transition: {
          duration,
          delay,
          staggerChildren,
          ease: [0.6, -0.05, 0.01, 0.99],
        },
      },
      exit: {
        opacity: 0,
        transition: {
          duration: duration * 0.5,
        },
      },
    },
  };

  const staggerChildVariants: Variants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.6, -0.05, 0.01, 0.99],
      },
    },
  };

  const currentVariant = variants[animation];

  if (animation === 'stagger') {
    return (
      <motion.div
        className={cn('w-full', className)}
        variants={currentVariant}
        initial="initial"
        animate="animate"
        exit="exit"
        {...props}
      >
        {React.Children.map(children, (child, index) => (
          <motion.div key={index} variants={staggerChildVariants}>
            {child}
          </motion.div>
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={cn('w-full', className)}
      variants={currentVariant}
      initial="initial"
      animate="animate"
      exit="exit"
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedContainer;
