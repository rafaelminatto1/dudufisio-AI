import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Eye } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { UserPresence } from '../../hooks/useRealtimePresence';
import { cn } from '../../lib/utils';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../ui/hover-card';

interface OnlineUsersProps {
  users: UserPresence[];
  currentUserId: string;
  className?: string;
  compact?: boolean;
}

const OnlineUsers: React.FC<OnlineUsersProps> = ({
  users,
  currentUserId,
  className,
  compact = false
}) => {
  const otherUsers = users.filter(u => u.userId !== currentUserId);

  if (otherUsers.length === 0) return null;

  if (compact) {
    return (
      <HoverCard>
        <HoverCardTrigger asChild>
          <Badge variant="secondary" className={cn("gap-1.5 cursor-pointer", className)}>
            <Eye className="w-3 h-3" />
            {otherUsers.length} {otherUsers.length === 1 ? 'pessoa' : 'pessoas'}
          </Badge>
        </HoverCardTrigger>
        <HoverCardContent className="w-80" align="end">
          <div className="space-y-2">
            <p className="text-sm font-semibold flex items-center gap-2">
              <Users className="w-4 h-4" />
              Visualizando agora
            </p>
            <div className="space-y-1">
              <AnimatePresence>
                {otherUsers.map((user, index) => (
                  <motion.div
                    key={user.userId}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 20, opacity: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800"
                  >
                    <div className="relative">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                          {user.userName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <motion.div
                        className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-slate-800"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </div>

                    <div className="flex-1">
                      <p className="text-sm font-medium">{user.userName}</p>
                      <p className="text-xs text-muted-foreground">{user.userRole}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    );
  }

  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-blue-600" />
        <h3 className="font-semibold text-sm">Online Agora</h3>
        <Badge variant="secondary">{otherUsers.length}</Badge>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {otherUsers.map((user, index) => (
            <motion.div
              key={user.userId}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-3"
            >
              <div className="relative">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                    {user.userName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <motion.div
                  className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white dark:border-slate-800"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>

              <div className="flex-1">
                <p className="text-sm font-medium">{user.userName}</p>
                <p className="text-xs text-muted-foreground">{user.userRole}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Card>
  );
};

export default OnlineUsers;

