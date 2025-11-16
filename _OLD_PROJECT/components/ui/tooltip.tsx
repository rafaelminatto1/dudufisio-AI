import * as React from "react"
import { cn } from "../../lib/utils"

interface TooltipProps {
  content: string | React.ReactNode;
  children: React.ReactNode;
  className?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  delayDuration?: number;
}

const Tooltip: React.FC<TooltipProps> = ({ 
  content, 
  children, 
  className,
  side = 'top',
  delayDuration = 300
}) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const showTooltip = React.useCallback((e: React.MouseEvent) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        
        let x = rect.left + scrollX + rect.width / 2;
        let y = rect.top + scrollY;
        
        switch (side) {
          case 'top':
            y = rect.top + scrollY - 8;
            break;
          case 'bottom':
            y = rect.bottom + scrollY + 8;
            break;
          case 'left':
            x = rect.left + scrollX - 8;
            y = rect.top + scrollY + rect.height / 2;
            break;
          case 'right':
            x = rect.right + scrollX + 8;
            y = rect.top + scrollY + rect.height / 2;
            break;
        }
        
        setPosition({ x, y });
        setIsVisible(true);
      }
    }, delayDuration);
  }, [side, delayDuration]);

  const hideTooltip = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  }, []);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getTooltipPosition = () => {
    const baseClasses = "absolute z-50 px-2 py-1 text-xs font-medium text-white bg-slate-900 rounded shadow-lg pointer-events-none whitespace-nowrap";
    
    switch (side) {
      case 'top':
        return `${baseClasses} -translate-x-1/2 -translate-y-full`;
      case 'bottom':
        return `${baseClasses} -translate-x-1/2 translate-y-0`;
      case 'left':
        return `${baseClasses} -translate-x-full -translate-y-1/2`;
      case 'right':
        return `${baseClasses} translate-x-0 -translate-y-1/2`;
      default:
        return baseClasses;
    }
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-block"
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          className={cn(getTooltipPosition(), className)}
          style={{
            left: side === 'left' || side === 'right' ? position.x : position.x,
            top: side === 'top' || side === 'bottom' ? position.y : position.y,
          }}
        >
          {content}
          {/* Arrow */}
          <div
            className={cn(
              "absolute w-2 h-2 bg-slate-900 transform rotate-45",
              side === 'top' && "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2",
              side === 'bottom' && "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2",
              side === 'left' && "right-0 top-1/2 -translate-y-1/2 translate-x-1/2",
              side === 'right' && "left-0 top-1/2 -translate-y-1/2 -translate-x-1/2"
            )}
          />
        </div>
      )}
    </>
  );
};

// Adicionar componentes compatíveis com shadcn/ui
export const TooltipProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export const TooltipTrigger = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={className}>{children}</div>
);

export const TooltipContent = ({ children, side = 'top', className }: { 
  children: React.ReactNode; 
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}) => (
  <div className={className}>{children}</div>
);

export default Tooltip;
export { Tooltip };