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
      className={`relative overflow-hidden rounded-lg bg-white shadow-md hover:shadow-lg border border-slate-200 ${className}`}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      {/* Header */}
      <div className="bg-slate-50 p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          {Icon && (
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border-2 border-blue-200">
              <Icon className="w-5 h-5 text-blue-600" />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {children}
      </div>
    </motion.div>
  );
};

export default GradientCard;
