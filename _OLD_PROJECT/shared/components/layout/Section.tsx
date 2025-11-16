import React from 'react';
import { cn } from '../../lib/utils';

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /** Variante de background */
  variant?: 'white' | 'gray';
  /** Largura máxima do conteúdo */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '7xl' | 'full';
  /** Padding vertical */
  paddingY?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  /** Padding horizontal */
  paddingX?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

/**
 * Section Component - Monday.com Inspired
 *
 * Container para seções da página com backgrounds alternados e conteúdo centralizado
 *
 * @example
 * ```tsx
 * <Section variant="white">
 *   <H2>Título da Seção</H2>
 *   <Body>Conteúdo...</Body>
 * </Section>
 *
 * <Section variant="gray">
 *   <H2>Outra Seção</H2>
 *   <Body>Mais conteúdo...</Body>
 * </Section>
 * ```
 */
const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({
    className,
    variant = 'white',
    maxWidth = '7xl',
    paddingY = '4xl',
    paddingX = 'md',
    children,
    ...props
  }, ref) => {
    const bgVariants = {
      white: 'bg-neutral-bg dark:bg-gray-900',
      gray: 'bg-neutral-bgAlt dark:bg-gray-800',
    };

    const maxWidths = {
      sm: 'max-w-sm',    // 384px
      md: 'max-w-md',    // 448px
      lg: 'max-w-lg',    // 512px
      xl: 'max-w-xl',    // 576px
      '2xl': 'max-w-2xl', // 672px
      '4xl': 'max-w-4xl', // 896px - ideal para texto
      '7xl': 'max-w-7xl', // 1280px - ideal para conteúdo geral
      full: 'max-w-full',
    };

    const paddingsY = {
      none: 'py-0',
      sm: 'py-sm',
      md: 'py-md',
      lg: 'py-lg',
      xl: 'py-xl',
      '2xl': 'py-2xl',
      '3xl': 'py-3xl',
      '4xl': 'py-4xl',
      '5xl': 'py-5xl',
    };

    const paddingsX = {
      none: 'px-0',
      sm: 'px-sm',
      md: 'px-md',
      lg: 'px-lg',
      xl: 'px-xl',
    };

    return (
      <section
        ref={ref}
        className={cn(bgVariants[variant], paddingsY[paddingY], className)}
        {...props}
      >
        <div className={cn(maxWidths[maxWidth], 'mx-auto', paddingsX[paddingX])}>
          {children}
        </div>
      </section>
    );
  }
);

Section.displayName = 'Section';

export default Section;
