import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import Tooltip from '../ui/tooltip';
import { motion } from 'framer-motion';

interface EditingIndicatorProps {
  userName: string;
  userAvatar?: string;
}

/**
 * Indicador visual de que outro usuário está editando um agendamento
 * Aparece no canto superior direito do card com animação pulsante
 */
export function EditingIndicator({ userName, userAvatar }: EditingIndicatorProps) {
  const initials = userName
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Tooltip
      content={`${userName} está editando`}
      side="top"
      delayDuration={200}
    >
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        className="absolute top-1 right-1 z-20"
      >
        <div className="relative">
          <Avatar className="h-6 w-6 border-2 border-white shadow-md ring-2 ring-blue-400">
            {userAvatar && <AvatarImage src={userAvatar} alt={userName} />}
            <AvatarFallback className="text-xs bg-blue-500 text-white font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          
          {/* Indicador de atividade pulsante */}
          <motion.div
            className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </Tooltip>
  );
}

export default EditingIndicator;

