/**
 * Componente de Chat Real-time
 * Usa Supabase Broadcast para mensagens instantâneas
 */
import React, { useState, useEffect, useRef } from 'react';
import { useBroadcast } from '../../hooks/useRealtimeSubscription';
import { Send } from 'lucide-react';
/**
 * Componente de Chat em Tempo Real
 *
 * @example
 * ```tsx
 * <RealtimeChat
 *   roomId="patient-123"
 *   userId={currentUser.id}
 *   userName={currentUser.name}
 * />
 * ```
 */
export const RealtimeChat = ({ roomId, userId, userName, className = '', }) => {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef(null);
    const { sendMessage } = useBroadcast(`chat-${roomId}`, (payload) => {
        // Adicionar mensagem recebida à lista
        setMessages((prev) => [...prev, payload]);
    });
    // Auto-scroll para última mensagem
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    const handleSend = async () => {
        if (!inputValue.trim())
            return;
        const newMessage = {
            id: `${userId}-${Date.now()}`,
            user_id: userId,
            user_name: userName,
            content: inputValue,
            created_at: new Date().toISOString(),
        };
        // Adicionar mensagem localmente imediatamente
        setMessages((prev) => [...prev, newMessage]);
        // Broadcast para outros usuários
        await sendMessage(newMessage);
        // Limpar input
        setInputValue('');
    };
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };
    return (<div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <h3 className="font-semibold text-lg">Chat em Tempo Real</h3>
        <p className="text-sm text-gray-500">
          {messages.length} mensagem{messages.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.length === 0 ? (<div className="flex items-center justify-center h-full text-gray-400">
            <p>Nenhuma mensagem ainda. Comece a conversa!</p>
          </div>) : (messages.map((msg) => (<div key={msg.id} className={`flex ${msg.user_id === userId ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-lg p-3 ${msg.user_id === userId
                ? 'bg-blue-500 text-white'
                : 'bg-white border border-gray-200'}`}>
                {msg.user_id !== userId && (<p className="text-xs font-semibold mb-1 text-gray-600">
                    {msg.user_name}
                  </p>)}
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-xs mt-1 ${msg.user_id === userId ? 'text-blue-100' : 'text-gray-400'}`}>
                  {new Date(msg.created_at).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
            })}
                </p>
              </div>
            </div>)))}
        <div ref={messagesEndRef}/>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <textarea value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={handleKeyPress} placeholder="Digite sua mensagem... (Enter para enviar)" className="flex-1 border rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2}/>
          <button onClick={handleSend} disabled={!inputValue.trim()} className="px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
            <Send size={18}/>
            Enviar
          </button>
        </div>
      </div>
    </div>);
};
