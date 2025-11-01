import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface FloatingActionButtonProps {
  onClick: () => void;
  className?: string;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  className
}) => {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "sm:hidden", // Apenas mobile
        className
      )}
    >
      <Button
        onClick={onClick}
        className="w-14 h-14 rounded-full shadow-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
        size="icon"
      >
        <Plus className="w-6 h-6" />
      </Button>
    </motion.div>
  );
};

export default FloatingActionButton;

