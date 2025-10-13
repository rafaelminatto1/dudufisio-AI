import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatisticCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down';
  icon: LucideIcon;
  color?: string;
  gradient?: string;
}

export const StatisticCard: React.FC<StatisticCardProps> = ({
  title,
  value,
  change,
  trend = 'up',
  icon: Icon,
  color = 'blue',
  gradient = 'from-blue-500 to-cyan-500'
}) => {
  const trendColor = trend === 'up' ? 'text-green-600' : 'text-red-600';
  const trendBg = trend === 'up' ? 'bg-green-100' : 'bg-red-100';

  return (
    <motion.div
      className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-md transition-all duration-300 hover:shadow-xl"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Background gradient on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-5`}></div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
            <motion.p
              className="text-3xl font-bold text-slate-900"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {value}
            </motion.p>
          </div>

          {/* Icon */}
          <motion.div
            className={`rounded-lg bg-gradient-to-br ${gradient} p-3 text-white shadow-md`}
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <Icon className="w-6 h-6" />
          </motion.div>
        </div>

        {/* Change indicator */}
        {change && (
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center rounded-full ${trendBg} px-2.5 py-1 text-xs font-semibold ${trendColor}`}>
              {trend === 'up' ? (
                <TrendingUp className="w-3 h-3 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-1" />
              )}
              {change}
            </span>
            <span className="text-sm text-slate-600">vs. mês anterior</span>
          </div>
        )}
      </div>

      {/* Decorative dot pattern */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 opacity-5">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <pattern id={`pattern-${title}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="2" fill="currentColor" />
          </pattern>
          <rect width="100%" height="100%" fill={`url(#pattern-${title})`} />
        </svg>
      </div>
    </motion.div>
  );
};

export default StatisticCard;
