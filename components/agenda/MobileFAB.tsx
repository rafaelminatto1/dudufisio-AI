import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, Users, CheckCircle, Filter } from 'lucide-react';
import { Button } from '../ui/button';

interface MobileFABProps {
  onNewAppointment: () => void;
  onWaitlist: () => void;
  onCheckIn: () => void;
  onFilters: () => void;
}

const MobileFAB: React.FC<MobileFABProps> = ({
  onNewAppointment,
  onWaitlist,
  onCheckIn,
  onFilters
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const menuItems = [
    { icon: Calendar, label: 'Novo Agendamento', action: onNewAppointment },
    { icon: Users, label: 'Lista de Espera', action: onWaitlist },
    { icon: CheckCircle, label: 'Check-in', action: onCheckIn },
    { icon: Filter, label: 'Filtros', action: onFilters }
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-16 right-0 mb-2 space-y-2"
          >
            {menuItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Button
                  onClick={() => {
                    item.action();
                    setIsOpen(false);
                  }}
                  className="h-12 w-12 rounded-full shadow-lg bg-white hover:bg-slate-50 text-slate-900 border border-slate-200"
                  aria-label={item.label}
                >
                  <item.icon className="w-5 h-5" />
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.05 }}
      >
        <Button
          onClick={toggleMenu}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 text-white"
          aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Plus className="w-6 h-6" />
          </motion.div>
        </Button>
      </motion.div>
    </div>
  );
};

export default MobileFAB;

