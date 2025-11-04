import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface GridProps {
  children: React.ReactNode;
  columns?: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number };
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  rowGap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  columnGap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  alignItems?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  className?: string;
  style?: React.CSSProperties;
}

export const Grid: React.FC<GridProps> = ({
  children,
  columns = 12,
  gap = 'md',
  rowGap,
  columnGap,
  alignItems = 'stretch',
  justifyContent = 'start',
  className = '',
  style,
}) => {
  const { themeConfig } = useTheme();

  const getGridColumns = () => {
    if (typeof columns === 'number') {
      return `grid-cols-${columns}`;
    }
    
    const responsiveClasses = [];
    if (columns.xs) responsiveClasses.push(`grid-cols-${columns.xs}`);
    if (columns.sm) responsiveClasses.push(`sm:grid-cols-${columns.sm}`);
    if (columns.md) responsiveClasses.push(`md:grid-cols-${columns.md}`);
    if (columns.lg) responsiveClasses.push(`lg:grid-cols-${columns.lg}`);
    if (columns.xl) responsiveClasses.push(`xl:grid-cols-${columns.xl}`);
    
    return responsiveClasses.join(' ');
  };

  const getGapStyles = () => {
    const gapMap = {
      none: 'gap-0',
      xs: 'gap-2',
      sm: 'gap-4',
      md: 'gap-6',
      lg: 'gap-8',
      xl: 'gap-12',
    };

    const rowGapMap = {
      none: 'gap-y-0',
      xs: 'gap-y-2',
      sm: 'gap-y-4',
      md: 'gap-y-6',
      lg: 'gap-y-8',
      xl: 'gap-y-12',
    };

    const columnGapMap = {
      none: 'gap-x-0',
      xs: 'gap-x-2',
      sm: 'gap-x-4',
      md: 'gap-x-6',
      lg: 'gap-x-8',
      xl: 'gap-x-12',
    };

    let gapStyles = gapMap[gap];
    
    if (rowGap) {
      gapStyles = gapStyles.replace(/gap-y-\d+/, '') + ' ' + rowGapMap[rowGap];
    }
    
    if (columnGap) {
      gapStyles = gapStyles.replace(/gap-x-\d+/, '') + ' ' + columnGapMap[columnGap];
    }

    return gapStyles;
  };

  const getAlignmentStyles = () => {
    const alignItemsMap = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline',
    };

    const justifyContentMap = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    };

    return `${alignItemsMap[alignItems]} ${justifyContentMap[justifyContent]}`;
  };

  return (
    <div
      className={`
        grid
        ${getGridColumns()}
        ${getGapStyles()}
        ${getAlignmentStyles()}
        ${className}
      `}
      style={{
        fontFamily: themeConfig.typography.fontFamily.secondary,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Componente de item de grid
interface GridItemProps {
  children: React.ReactNode;
  colSpan?: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number };
  rowSpan?: number;
  alignSelf?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justifySelf?: 'start' | 'center' | 'end' | 'stretch';
  className?: string;
  style?: React.CSSProperties;
}

export const GridItem: React.FC<GridItemProps> = ({
  children,
  colSpan = 1,
  rowSpan,
  alignSelf,
  justifySelf,
  className = '',
  style,
}) => {
  const getColSpanStyles = () => {
    if (typeof colSpan === 'number') {
      return `col-span-${colSpan}`;
    }
    
    const responsiveClasses = [];
    if (colSpan.xs) responsiveClasses.push(`col-span-${colSpan.xs}`);
    if (colSpan.sm) responsiveClasses.push(`sm:col-span-${colSpan.sm}`);
    if (colSpan.md) responsiveClasses.push(`md:col-span-${colSpan.md}`);
    if (colSpan.lg) responsiveClasses.push(`lg:col-span-${colSpan.lg}`);
    if (colSpan.xl) responsiveClasses.push(`xl:col-span-${colSpan.xl}`);
    
    return responsiveClasses.join(' ');
  };

  const getRowSpanStyles = () => {
    return rowSpan ? `row-span-${rowSpan}` : '';
  };

  const getSelfAlignmentStyles = () => {
    const alignSelfMap = {
      start: 'self-start',
      center: 'self-center',
      end: 'self-end',
      stretch: 'self-stretch',
      baseline: 'self-baseline',
    };

    const justifySelfMap = {
      start: 'justify-self-start',
      center: 'justify-self-center',
      end: 'justify-self-end',
      stretch: 'justify-self-stretch',
    };

    return [
      alignSelf ? alignSelfMap[alignSelf] : '',
      justifySelf ? justifySelfMap[justifySelf] : '',
    ].join(' ');
  };

  return (
    <div
      className={`
        ${getColSpanStyles()}
        ${getRowSpanStyles()}
        ${getSelfAlignmentStyles()}
        ${className}
      `}
      style={style}
    >
      {children}
    </div>
  );
};

// Componente de container responsivo
interface ContainerProps {
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  center?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  size = 'lg',
  center = true,
  className = '',
  style,
}) => {
  const { themeConfig } = useTheme();

  const getSizeStyles = () => {
    const sizeMap = {
      xs: 'max-w-xs',
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      full: 'max-w-none',
    };

    return sizeMap[size];
  };

  const getCenterStyles = () => {
    return center ? 'mx-auto' : '';
  };

  return (
    <div
      className={`
        w-full
        ${getSizeStyles()}
        ${getCenterStyles()}
        px-4 sm:px-6 lg:px-8
        ${className}
      `}
      style={{
        fontFamily: themeConfig.typography.fontFamily.secondary,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Componente de stack flexível
interface StackProps {
  children: React.ReactNode;
  direction?: 'row' | 'column';
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const Stack: React.FC<StackProps> = ({
  children,
  direction = 'column',
  spacing = 'md',
  align = 'stretch',
  justify = 'start',
  wrap = false,
  className = '',
  style,
}) => {
  const { themeConfig } = useTheme();

  const getSpacingStyles = () => {
    const spacingMap = {
      none: 'gap-0',
      xs: 'gap-2',
      sm: 'gap-4',
      md: 'gap-6',
      lg: 'gap-8',
      xl: 'gap-12',
    };

    return spacingMap[spacing];
  };

  const getAlignmentStyles = () => {
    const alignMap = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
      baseline: 'items-baseline',
    };

    const justifyMap = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    };

    return `${alignMap[align]} ${justifyMap[justify]}`;
  };

  return (
    <div
      className={`
        flex
        ${direction === 'column' ? 'flex-col' : 'flex-row'}
        ${getSpacingStyles()}
        ${getAlignmentStyles()}
        ${wrap ? 'flex-wrap' : 'flex-nowrap'}
        ${className}
      `}
      style={{
        fontFamily: themeConfig.typography.fontFamily.secondary,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Componente de divisor responsivo
interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  thickness?: 'thin' | 'medium' | 'thick';
  color?: 'light' | 'medium' | 'dark' | 'primary' | 'secondary' | 'accent';
  className?: string;
  style?: React.CSSProperties;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  thickness = 'thin',
  color = 'light',
  className = '',
  style,
}) => {
  const { themeConfig } = useTheme();

  const getThicknessStyles = () => {
    const thicknessMap = {
      thin: 'h-px',
      medium: 'h-0.5',
      thick: 'h-1',
    };

    const verticalThicknessMap = {
      thin: 'w-px',
      medium: 'w-0.5',
      thick: 'w-1',
    };

    return orientation === 'horizontal' 
      ? thicknessMap[thickness] 
      : verticalThicknessMap[thickness];
  };

  const getColorStyles = () => {
    const colorMap = {
      light: 'bg-gray-200 dark:bg-gray-700',
      medium: 'bg-gray-300 dark:bg-gray-600',
      dark: 'bg-gray-400 dark:bg-gray-500',
      primary: `bg-[${themeConfig.colors.primary}]`,
      secondary: `bg-[${themeConfig.colors.secondary}]`,
      accent: `bg-[${themeConfig.colors.accent}]`,
    };

    return colorMap[color];
  };

  const getOrientationStyles = () => {
    return orientation === 'horizontal' 
      ? 'w-full' 
      : 'h-full';
  };

  return (
    <div
      className={`
        ${getThicknessStyles()}
        ${getColorStyles()}
        ${getOrientationStyles()}
        ${className}
      `}
      style={style}
    />
  );
};