import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface GradientCardProps {
  title: string;
  children: ReactNode;
  icon?: LucideIcon;
  gradient?: string;
  className?: string;
}

export const GradientCard: React.FC<GradientCardProps> = ({
  title,
  children,
  icon: Icon,
  gradient = 'from-blue-500 to-cyan-500',
  className = ''
}) => {
  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl bg-white shadow-lg ${className}`}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      {/* Gradient Header */}
      <div className={`bg-gradient-to-r ${gradient} p-6 text-white`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          {Icon && (
            <div className="rounded-full bg-white/20 backdrop-blur-sm p-2">
              <Icon className="w-5 h-5" />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {children}
      </div>

      {/* Decorative gradient accent */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`}></div>
    </motion.div>
  );
};

export default GradientCard;
