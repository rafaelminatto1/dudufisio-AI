/**
 * Componente de Indicador de Presença Online
 * Mostra quem está online usando Supabase Presence
 */
import React, { useState, useEffect } from 'react';
import { usePresence } from '../../hooks/useRealtimeSubscription';
import { Circle } from 'lucide-react';
/**
 * Indicador de usuários online em uma sala
 *
 * @example
 * ```tsx
 * <OnlineIndicator
 *   roomName="therapists-room"
 *   userId={currentUser.id}
 *   userName={currentUser.name}
 * />
 * ```
 */
export const OnlineIndicator = ({ roomName, userId, userName, className = '', }) => {
    const [onlineUsers, setOnlineUsers] = useState([]);
    const { channel, getOnlineUsers } = usePresence(roomName, userId, {
        name: userName,
        avatar: `https://i.pravatar.cc/150?u=${userId}`,
    });
    // Atualizar lista de usuários online
    useEffect(() => {
        if (!channel)
            return;
        const interval = setInterval(() => {
            const users = getOnlineUsers();
            setOnlineUsers(users);
        }, 1000);
        return () => clearInterval(interval);
    }, [channel, getOnlineUsers]);
    return (<div className={`flex items-center gap-2 ${className}`}>
      <Circle className="w-3 h-3 fill-green-500 text-green-500"/>
      <span className="text-sm text-gray-600">
        {onlineUsers.length} online
      </span>
      
      {/* Avatares dos usuários online */}
      {onlineUsers.length > 0 && (<div className="flex -space-x-2">
          {onlineUsers.slice(0, 5).map((user, index) => (<img key={index} src={user.avatar || `https://i.pravatar.cc/150?u=${user.user_id}`} alt={user.name || 'User'} title={user.name || 'User'} className="w-8 h-8 rounded-full border-2 border-white"/>))}
          {onlineUsers.length > 5 && (<div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-semibold">
              +{onlineUsers.length - 5}
            </div>)}
        </div>)}
    </div>);
};
/**
 * Componente simples de status online/offline
 */
export const OnlineStatus = ({ isOnline }) => {
    return (<div className="flex items-center gap-2">
      <Circle className={`w-2 h-2 ${isOnline ? 'fill-green-500 text-green-500' : 'fill-gray-400 text-gray-400'}`}/>
      <span className="text-sm text-gray-600">
        {isOnline ? 'Online' : 'Offline'}
      </span>
    </div>);
};
