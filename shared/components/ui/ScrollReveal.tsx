import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '../../lib/utils';

interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  animation?: 'fadeInUp' | 'slideInLeft' | 'slideInRight' | 'scaleIn' | 'blurIn';
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  animation = 'fadeInUp',
  delay = 0,
  duration = 0.6,
  threshold = 0.1,
  className,
  ...props
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    threshold,
    once: true, // Only animate once
  });

  const variants = {
    fadeInUp: {
      initial: {
        opacity: 0,
        y: 50,
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
    },
    slideInLeft: {
      initial: {
        opacity: 0,
        x: -50,
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
    },
    slideInRight: {
      initial: {
        opacity: 0,
        x: 50,
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
    },
    scaleIn: {
      initial: {
        opacity: 0,
        scale: 0.8,
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
    },
    blurIn: {
      initial: {
        opacity: 0,
        filter: 'blur(10px)',
        y: 20,
      },
      animate: {
        opacity: 1,
        filter: 'blur(0px)',
        y: 0,
        transition: {
          duration,
          delay,
          ease: [0.6, -0.05, 0.01, 0.99],
        },
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      className={cn('w-full', className)}
      variants={variants[animation]}
      initial="initial"
      animate={isInView ? 'animate' : 'initial'}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
