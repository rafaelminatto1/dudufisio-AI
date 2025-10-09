import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
const AccessibleTooltip = ({ content, children, position = 'top', delay = 500, disabled = false }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    const triggerRef = useRef(null);
    const tooltipRef = useRef(null);
    const timeoutRef = useRef(undefined);
    const showTooltip = () => {
        if (disabled)
            return;
        timeoutRef.current = setTimeout(() => {
            if (triggerRef.current && tooltipRef.current) {
                const triggerRect = triggerRef.current.getBoundingClientRect();
                const tooltipRect = tooltipRef.current.getBoundingClientRect();
                let top = 0;
                let left = 0;
                switch (position) {
                    case 'top':
                        top = triggerRect.top - tooltipRect.height - 8;
                        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
                        break;
                    case 'bottom':
                        top = triggerRect.bottom + 8;
                        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
                        break;
                    case 'left':
                        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
                        left = triggerRect.left - tooltipRect.width - 8;
                        break;
                    case 'right':
                        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
                        left = triggerRect.right + 8;
                        break;
                }
                // Ajustar posição se sair da tela
                const viewport = {
                    width: window.innerWidth,
                    height: window.innerHeight
                };
                if (left < 8)
                    left = 8;
                if (left + tooltipRect.width > viewport.width - 8) {
                    left = viewport.width - tooltipRect.width - 8;
                }
                if (top < 8)
                    top = 8;
                if (top + tooltipRect.height > viewport.height - 8) {
                    top = viewport.height - tooltipRect.height - 8;
                }
                setTooltipPosition({ top, left });
                setIsVisible(true);
            }
        }, delay);
    };
    const hideTooltip = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsVisible(false);
    };
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);
    const tooltipContent = isVisible && createPortal(<div ref={tooltipRef} className="fixed z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg pointer-events-none max-w-xs" style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
        }} role="tooltip" aria-hidden="true">
      {content}
      <div className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-1' :
            position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1' :
                position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -ml-1' :
                    'right-full top-1/2 -translate-y-1/2 -mr-1'}`}/>
    </div>, document.body);
    return (<>
      <div ref={triggerRef} onMouseEnter={showTooltip} onMouseLeave={hideTooltip} onFocus={showTooltip} onBlur={hideTooltip} aria-describedby={isVisible ? 'tooltip' : undefined}>
        {children}
      </div>
      {tooltipContent}
    </>);
};
export default AccessibleTooltip;
