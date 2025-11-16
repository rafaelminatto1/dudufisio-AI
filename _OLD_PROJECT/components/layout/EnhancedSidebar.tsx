import React from 'react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { Badge } from '../ui/badge';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '../ui/tooltip';
import { LucideIcon } from 'lucide-react';

interface NavItem {
  path: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  tooltip?: string;
}

interface EnhancedSidebarProps {
  items: NavItem[];
  collapsed?: boolean;
  className?: string;
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
      ease: 'easeOut'
    }
  })
};

export const EnhancedSidebar: React.FC<EnhancedSidebarProps> = ({ 
  items, 
  collapsed = false,
  className = ''
}) => {
  return (
    <TooltipProvider delayDuration={300}>
      <aside 
        className={`bg-gradient-to-b from-slate-900 to-slate-800 text-white h-screen transition-all ${
          collapsed ? 'w-16' : 'w-64'
        } ${className}`}
      >
        <nav className="p-4 space-y-1">
          {items.map((item, idx) => (
            <motion.div
              key={item.path}
              custom={idx}
              initial="hidden"
              animate="visible"
              variants={itemVariants}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                        isActive
                          ? 'bg-primary text-white shadow-lg shadow-primary/20'
                          : 'hover:bg-slate-700/50'
                      }`
                    }
                  >
                    <span className="group-hover:scale-110 transition-transform">
                      {item.icon}
                    </span>
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge && item.badge > 0 && (
                          <Badge 
                            variant="destructive" 
                            className="ml-auto animate-pulse"
                          >
                            {item.badge > 99 ? '99+' : item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                  </NavLink>
                </TooltipTrigger>
                {(collapsed || item.tooltip) && (
                  <TooltipContent side="right" className="font-medium">
                    <p>{item.tooltip || item.label}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </motion.div>
          ))}
        </nav>
      </aside>
    </TooltipProvider>
  );
};

export default EnhancedSidebar;

