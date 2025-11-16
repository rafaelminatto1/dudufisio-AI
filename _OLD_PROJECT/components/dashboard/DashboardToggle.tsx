import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';

interface DashboardToggleProps {
  onChange: (isModern: boolean) => void;
  className?: string;
}

export const DashboardToggle: React.FC<DashboardToggleProps> = ({ 
  onChange, 
  className = '' 
}) => {
  const [isModern, setIsModern] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dashboard-mode') === 'modern';
    }
    return false;
  });

  useEffect(() => {
    onChange(isModern);
  }, [isModern, onChange]);

  const handleToggle = () => {
    const newMode = !isModern;
    setIsModern(newMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dashboard-mode', newMode ? 'modern' : 'classic');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`fixed top-4 right-20 z-50 ${className}`}
    >
      <Button
        onClick={handleToggle}
        variant="outline"
        size="sm"
        className="gap-2 shadow-lg bg-white/90 backdrop-blur-sm hover:bg-white/95 transition-all"
      >
        {isModern ? (
          <>
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Clássico</span>
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 text-purple-500" />
            <span className="hidden sm:inline">Moderno</span>
          </>
        )}
      </Button>
    </motion.div>
  );
};

export default DashboardToggle;

