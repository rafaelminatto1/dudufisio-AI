import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CollapsibleCardProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  defaultExpanded?: boolean;
  children: React.ReactNode;
  className?: string;
  onToggle?: (expanded: boolean) => void;
}

/**
 * Card colapsável reutilizável para a página de evoluções
 * Salva estado de expansão no localStorage
 */
const CollapsibleCard: React.FC<CollapsibleCardProps> = ({
  id,
  title,
  icon,
  defaultExpanded = false,
  children,
  className = '',
  onToggle,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Carrega estado do localStorage na montagem
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`evolution-card-${id}`);
      if (stored !== null) {
        setIsExpanded(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Erro ao carregar estado do card:', error);
    }
  }, [id]);

  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    
    // Salva no localStorage
    try {
      localStorage.setItem(`evolution-card-${id}`, JSON.stringify(newState));
    } catch (error) {
      console.error('Erro ao salvar estado do card:', error);
    }

    // Callback opcional
    onToggle?.(newState);
  };

  return (
    <div
      className={`bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden transition-all ${className}`}
      data-card-id={id}
    >
      {/* Header - sempre visível */}
      <button
        onClick={handleToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
        aria-expanded={isExpanded}
        aria-controls={`card-content-${id}`}
      >
        <div className="flex items-center gap-3">
          <div className="text-blue-600 flex-shrink-0">{icon}</div>
          <h3 className="font-semibold text-slate-900 text-left">{title}</h3>
        </div>
        <div className="text-slate-400 flex-shrink-0">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </div>
      </button>

      {/* Content - colapsável */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            id={`card-content-${id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3 border-t border-slate-200">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CollapsibleCard;

