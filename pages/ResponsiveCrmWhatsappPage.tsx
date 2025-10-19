import React, { useState, useMemo } from 'react';
import { 
  MessageSquare, Users, TrendingUp, Zap, Search, Filter,
  Phone, Mail, Calendar, Tag, ChevronRight, Circle,
  Send, Paperclip, Smile, MoreVertical, Star, Clock,
  CheckCheck, Check, AlertCircle, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Tipos
interface Lead {
  id: string;
  name: string;
  phone: string;
  email?: string;
  status: 'new' | 'contacted' | 'qualified' | 'negotiation' | 'converted' | 'lost';
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount?: number;
  avatar?: string;
  tags?: string[];
  score?: number;
}

interface Message {
  id: string;
  content: string;
  timestamp: Date;
  sender: 'user' | 'client';
  status?: 'sent' | 'delivered' | 'read';
  attachments?: string[];
}

// Componente de Tabs Responsivo
interface TabsProps {
  tabs: { id: string; label: string; icon?: React.ElementType; count?: number }[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const ResponsiveTabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="bg-white border-b border-fisio-neutral-200">
      <div className="flex overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center px-4 py-3 whitespace-nowrap border-b-2 transition-all
              ${activeTab === tab.id 
                ? 'border-fisio-primary-DEFAULT text-fisio-primary-700 bg-fisio-primary-50' 
                : 'border-transparent text-fisio-neutral-600 hover:text-fisio-neutral-800 hover:bg-fisio-neutral-50'}
            `}
          >
            {tab.icon && <tab.icon className="w-4 h-4 mr-2" />}
            <span className="text-sm font-medium">{tab.label}</span>
            {tab.count && tab.count > 0 && (
              <span className={`
                ml-2 px-2 py-0.5 text-xs rounded-full
                ${activeTab === tab.id 
                  ? 'bg-fisio-primary-200 text-fisio-primary-800' 
                  : 'bg-fisio-neutral-200 text-fisio-neutral-700'}
              `}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

// Componente de Card de Lead/Conversa
const ConversationCard: React.FC<{ 
  lead: Lead; 
  isActive: boolean;
  onClick: () => void;
}> = ({ lead, isActive, onClick }) => {
  const statusColors = {
    new: 'bg-fisio-primary-500',
    contacted: 'bg-fisio-warning-500',
    qualified: 'bg-fisio-secondary-500',
    negotiation: 'bg-fisio-primary-400',
    converted: 'bg-fisio-secondary-600',
    lost: 'bg-fisio-neutral-400'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={onClick}
      className={`
        p-4 border-b border-fisio-neutral-100 cursor-pointer transition-all
        ${isActive 
          ? 'bg-fisio-primary-50 border-l-4 border-l-fisio-primary-DEFAULT' 
          : 'hover:bg-fisio-neutral-50'}
      `}
    >
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {lead.avatar ? (
            <img 
              src={lead.avatar} 
              alt={lead.name}
              className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-fisio-primary-100 flex items-center justify-center">
              <User className="w-6 h-6 text-fisio-primary-600" />
            </div>
          )}
          <span className={`
            absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white
            ${statusColors[lead.status]}
          `} />
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-fisio-neutral-800 truncate">
                {lead.name}
              </h4>
              <p className="text-xs text-fisio-neutral-500">
                {lead.phone}
              </p>
            </div>
            <div className="text-right ml-2">
              {lead.lastMessageTime && (
                <p className="text-xs text-fisio-neutral-400">
                  {format(lead.lastMessageTime, 'HH:mm')}
                </p>
              )}
              {lead.unreadCount && lead.unreadCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 bg-fisio-error-500 text-white text-xs rounded-full mt-1">
                  {lead.unreadCount}
                </span>
              )}
            </div>
          </div>

          {lead.lastMessage && (
            <p className="text-sm text-fisio-neutral-600 mt-1 line-clamp-1">
              {lead.lastMessage}
            </p>
          )}

          {lead.tags && lead.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {lead.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-fisio-neutral-100 text-fisio-neutral-600"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Componente de Chat
const ChatWindow: React.FC<{ 
  lead: Lead | null;
  messages: Message[];
  onSendMessage: (content: string) => void;
}> = ({ lead, messages, onSendMessage }) => {
  const [inputMessage, setInputMessage] = useState('');

  if (!lead) {
    return (
      <div className="flex-1 flex items-center justify-center bg-fisio-neutral-50">
        <div className="text-center">
          <MessageSquare className="w-12 h-12 text-fisio-neutral-300 mx-auto mb-4" />
          <p className="text-fisio-neutral-500">Selecione uma conversa para começar</p>
        </div>
      </div>
    );
  }

  const handleSend = () => {
    if (inputMessage.trim()) {
      onSendMessage(inputMessage);
      setInputMessage('');
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'sent':
        return <Check className="w-3 h-3 text-fisio-neutral-400" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-fisio-neutral-400" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-fisio-primary-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header do Chat */}
      <div className="bg-white border-b border-fisio-neutral-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {lead.avatar ? (
              <img 
                src={lead.avatar} 
                alt={lead.name}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-fisio-primary-100 flex items-center justify-center">
                <User className="w-5 h-5 text-fisio-primary-600" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-fisio-neutral-800">{lead.name}</h3>
              <p className="text-xs text-fisio-neutral-500">{lead.phone}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-fisio-neutral-100 rounded-lg transition-colors">
              <Phone className="w-5 h-5 text-fisio-neutral-600" />
            </button>
            <button className="p-2 hover:bg-fisio-neutral-100 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5 text-fisio-neutral-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Área de Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-fisio-neutral-50">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`
              max-w-[70%] px-4 py-2 rounded-2xl
              ${message.sender === 'user' 
                ? 'bg-fisio-primary-500 text-white rounded-br-none' 
                : 'bg-white text-fisio-neutral-800 rounded-bl-none shadow-sm'}
            `}>
              <p className="text-sm">{message.content}</p>
              <div className={`
                flex items-center justify-end mt-1 space-x-1
                ${message.sender === 'user' ? 'text-fisio-primary-100' : 'text-fisio-neutral-400'}
              `}>
                <span className="text-xs">
                  {format(message.timestamp, 'HH:mm')}
                </span>
                {message.sender === 'user' && getStatusIcon(message.status)}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input de Mensagem */}
      <div className="bg-white border-t border-fisio-neutral-200 p-4">
        <div className="flex items-end space-x-2">
          <button className="p-2 hover:bg-fisio-neutral-100 rounded-lg transition-colors">
            <Paperclip className="w-5 h-5 text-fisio-neutral-600" />
          </button>
          <div className="flex-1 bg-fisio-neutral-50 rounded-lg px-4 py-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Digite uma mensagem..."
              className="w-full bg-transparent text-sm text-fisio-neutral-700 placeholder-fisio-neutral-400 focus:outline-none"
            />
          </div>
          <button className="p-2 hover:bg-fisio-neutral-100 rounded-lg transition-colors">
            <Smile className="w-5 h-5 text-fisio-neutral-600" />
          </button>
          <button
            onClick={handleSend}
            className="p-2 bg-fisio-primary-DEFAULT hover:bg-fisio-primary-600 rounded-lg transition-colors"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente Principal CRM & WhatsApp Responsivo
export default function ResponsiveCrmWhatsappPage() {
  const [activeTab, setActiveTab] = useState('inbox');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [showChat, setShowChat] = useState(false);

  // Dados mock
  const leads: Lead[] = [
    {
      id: '1',
      name: 'João Silva',
      phone: '(11) 98765-4321',
      email: 'joao.silva@email.com',
      status: 'new',
      lastMessage: 'Olá, gostaria de saber mais sobre os tratamentos',
      lastMessageTime: new Date(),
      unreadCount: 2,
      tags: ['Ortopedia', 'Novo'],
      score: 85
    },
    {
      id: '2',
      name: 'Maria Santos',
      phone: '(11) 97654-3210',
      status: 'contacted',
      lastMessage: 'Obrigada pelas informações!',
      lastMessageTime: new Date(Date.now() - 3600000),
      tags: ['Neurologia'],
      score: 70
    },
    {
      id: '3',
      name: 'Pedro Oliveira',
      phone: '(11) 96543-2109',
      status: 'qualified',
      lastMessage: 'Quando posso agendar uma consulta?',
      lastMessageTime: new Date(Date.now() - 7200000),
      unreadCount: 1,
      tags: ['Desportiva', 'Urgente'],
      score: 95
    }
  ];

  const messages: Message[] = [
    {
      id: '1',
      content: 'Olá, gostaria de saber mais sobre os tratamentos',
      timestamp: new Date(Date.now() - 3600000),
      sender: 'client'
    },
    {
      id: '2',
      content: 'Olá! Claro, oferecemos diversos tratamentos de fisioterapia. Em que área você tem interesse?',
      timestamp: new Date(Date.now() - 3000000),
      sender: 'user',
      status: 'read'
    },
    {
      id: '3',
      content: 'Estou com dores nas costas há algumas semanas',
      timestamp: new Date(Date.now() - 2400000),
      sender: 'client'
    },
    {
      id: '4',
      content: 'Entendo. Podemos agendar uma avaliação para identificar a causa e definir o melhor tratamento. Quando você teria disponibilidade?',
      timestamp: new Date(Date.now() - 1800000),
      sender: 'user',
      status: 'delivered'
    }
  ];

  const tabs = [
    { id: 'inbox', label: 'Inbox', icon: MessageSquare, count: 3 },
    { id: 'pipeline', label: 'Pipeline', icon: Users, count: 12 },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'automations', label: 'Automações', icon: Zap }
  ];

  // Filtrar leads baseado na busca
  const filteredLeads = useMemo(() => {
    if (!searchQuery) return leads;
    
    return leads.filter(lead =>
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery]);

  // Detectar mudança de tamanho da tela
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLeadSelect = (lead: Lead) => {
    setSelectedLead(lead);
    if (isMobileView) {
      setShowChat(true);
    }
  };

  const handleSendMessage = (content: string) => {
    console.log('Enviando mensagem:', content);
    // Implementar lógica de envio
  };

  return (
    <div className="flex flex-col h-full bg-fisio-neutral-50">
      {/* Tabs */}
      <ResponsiveTabs 
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Conteúdo Principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Lista de Conversas - Oculta em mobile quando chat está aberto */}
        <div className={`
          ${isMobileView && showChat ? 'hidden' : 'flex flex-col'}
          ${isMobileView ? 'w-full' : 'w-full md:w-96 border-r border-fisio-neutral-200'}
          bg-white
        `}>
          {/* Barra de Busca */}
          <div className="p-4 border-b border-fisio-neutral-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-fisio-neutral-400" />
              <input
                type="text"
                placeholder="Buscar conversas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 bg-fisio-neutral-50 border border-fisio-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-fisio-primary-500"
              />
              <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Filter className="w-4 h-4 text-fisio-neutral-400" />
              </button>
            </div>
          </div>

          {/* Lista de Leads */}
          <div className="flex-1 overflow-y-auto">
            {filteredLeads.map((lead) => (
              <ConversationCard
                key={lead.id}
                lead={lead}
                isActive={selectedLead?.id === lead.id}
                onClick={() => handleLeadSelect(lead)}
              />
            ))}
            {filteredLeads.length === 0 && (
              <div className="text-center py-8">
                <p className="text-fisio-neutral-500">Nenhuma conversa encontrada</p>
              </div>
            )}
          </div>
        </div>

        {/* Área de Chat - Em mobile, ocupa tela toda quando aberto */}
        {(!isMobileView || showChat) && (
          <div className="flex-1 flex flex-col">
            {isMobileView && (
              <div className="bg-white border-b border-fisio-neutral-200 p-2">
                <button
                  onClick={() => setShowChat(false)}
                  className="flex items-center text-sm text-fisio-primary-600 hover:text-fisio-primary-700"
                >
                  <ChevronRight className="w-4 h-4 mr-1 rotate-180" />
                  Voltar às conversas
                </button>
              </div>
            )}
            <ChatWindow
              lead={selectedLead}
              messages={messages}
              onSendMessage={handleSendMessage}
            />
          </div>
        )}
      </div>
    </div>
  );
}