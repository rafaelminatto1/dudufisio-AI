import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Copy, 
  Check,
  Brain,
  Zap,
  Clock,
  Settings,
  Mic,
  MicOff,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useToast } from '../../../contexts/ToastContext';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  type?: 'text' | 'voice';
}

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIChatModal: React.FC<AIChatModalProps> = ({
  isOpen,
  onClose
}) => {
  const { showToast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Olá! Sou seu assistente virtual para consultas clínicas. Como posso ajudá-lo hoje?',
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const [metrics, setMetrics] = useState({
    availability: 'Online',
    avgResponse: 1.2,
    conversationsToday: 45
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Simular delay de resposta da IA
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Mock de resposta da IA baseada na pergunta
      const aiResponse = generateAIResponse(userMessage.content);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Simular atualização de métricas
      setMetrics(prev => ({
        ...prev,
        conversationsToday: prev.conversationsToday + 1
      }));

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      showToast('Erro ao enviar mensagem. Tente novamente.', 'error');
    } finally {
      setIsTyping(false);
    }
  };

  const generateAIResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('dor') || message.includes('dolor')) {
      return `Entendo que você está relatando dor. Para uma avaliação adequada, seria importante saber:

1. **Localização**: Onde exatamente você sente a dor?
2. **Intensidade**: Em uma escala de 0-10, qual seria o nível da dor?
3. **Características**: É uma dor constante ou intermitente? Que tipo de dor (pontada, queimação, latejamento)?
4. **Fatores que pioram/melhoram**: O que agrava ou alivia a dor?
5. **Duração**: Há quanto tempo você sente essa dor?

Com essas informações, posso sugerir técnicas específicas de fisioterapia e orientações adequadas.`;
    }
    
    if (message.includes('exercício') || message.includes('exercicio')) {
      return `Excelente pergunta sobre exercícios! Para prescrever exercícios adequados, preciso considerar:

**Fatores importantes:**
- Diagnóstico e condição atual
- Limitações e contraindicações
- Objetivos do tratamento
- Nível de condicionamento físico
- Equipamentos disponíveis

**Tipos de exercícios que posso orientar:**
- Exercícios de alongamento
- Fortalecimento muscular
- Exercícios de mobilidade articular
- Treinamento funcional
- Exercícios respiratórios

Você gostaria de focar em algum tipo específico de exercício ou condição?`;
    }
    
    if (message.includes('postura') || message.includes('ergonomia')) {
      return `A postura é fundamental para a saúde musculoesquelética! Aqui estão algumas orientações gerais:

**Postura no Trabalho:**
- Monitores na altura dos olhos
- Apoio adequado para os pés
- Cadeira com suporte lombar
- Pausas regulares para alongamento

**Postura ao Dormir:**
- Travesseiro adequado para o pescoço
- Colchão de firmeza média
- Posições que aliviam pressão na coluna

**Exercícios Posturais:**
- Alongamentos para peitoral e pescoço
- Fortalecimento da musculatura estabilizadora
- Mobilização da coluna vertebral

Você tem algum problema específico relacionado à postura que gostaria de abordar?`;
    }
    
    if (message.includes('recuperação') || message.includes('recuperacao')) {
      return `A recuperação é um processo fundamental na fisioterapia! Alguns pontos importantes:

**Fatores que influenciam a recuperação:**
- Aderência ao tratamento
- Frequência das sessões
- Exercícios domiciliares (HEP)
- Alimentação e hidratação
- Descanso adequado
- Fatores psicológicos

**Estratégias para otimizar a recuperação:**
- Seguir rigorosamente o plano de tratamento
- Manter comunicação com o fisioterapeuta
- Registrar progressos e dificuldades
- Manter expectativas realistas
- Cuidar da saúde geral

Como está sendo sua recuperação atual? Há algo específico que você gostaria de melhorar?`;
    }
    
    if (message.includes('prevenção') || message.includes('prevencao')) {
      return `A prevenção é sempre melhor que o tratamento! Aqui estão algumas dicas importantes:

**Prevenção de Lesões:**
- Aquecimento antes de atividades físicas
- Progressão gradual de intensidade
- Uso de equipamentos adequados
- Técnica correta nos movimentos
- Fortalecimento da musculatura estabilizadora

**Prevenção de Recidivas:**
- Manutenção de exercícios regulares
- Cuidados posturais
- Evitar sobrecargas
- Alongamentos diários
- Atividades de baixo impacto

**Check-ups Regulares:**
- Avaliações periódicas
- Manutenção da condição física
- Ajustes no programa de exercícios

Você tem algum histórico de lesões ou áreas de preocupação específicas?`;
    }
    
    // Resposta padrão para outras perguntas
    return `Obrigado pela sua pergunta! Como assistente virtual especializado em fisioterapia, posso ajudá-lo com:

**Áreas de especialização:**
- Orientações sobre exercícios terapêuticos
- Técnicas de alívio de dor
- Melhora da postura e ergonomia
- Prevenção de lesões
- Recuperação e reabilitação
- Exercícios domiciliares (HEP)

**Como posso ajudar melhor:**
- Seja específico sobre sua condição ou dúvida
- Mencione sintomas ou limitações
- Informe sobre atividades ou objetivos

Pode reformular sua pergunta de forma mais específica? Assim posso oferecer orientações mais direcionadas e úteis.`;
  };

  const copyMessage = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      showToast('Mensagem copiada!', 'success');
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      showToast('Erro ao copiar mensagem.', 'error');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        content: 'Olá! Sou seu assistente virtual para consultas clínicas. Como posso ajudá-lo hoje?',
        role: 'assistant',
        timestamp: new Date()
      }
    ]);
    showToast('Chat limpo com sucesso!', 'success');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-500" />
            Chat IA - Assistente Virtual
          </DialogTitle>
          <DialogDescription>
            Converse com nosso assistente virtual especializado em fisioterapia
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4">
          {/* Status e Métricas */}
          <Card className="bg-gradient-to-r from-indigo-50 to-blue-50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">{metrics.availability}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    IA Ativa
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{metrics.avgResponse}s</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>{metrics.conversationsToday} conversas hoje</span>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Área de Mensagens */}
          <Card className="flex-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  Conversa
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearChat}
                  className="text-xs"
                >
                  Limpar Chat
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-96 p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-shrink-0">
                            {message.role === 'user' ? (
                              <User className="w-4 h-4 mt-0.5" />
                            ) : (
                              <Bot className="w-4 h-4 mt-0.5" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm whitespace-pre-wrap">
                              {message.content}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs opacity-70">
                                {message.timestamp.toLocaleTimeString('pt-BR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyMessage(message.id, message.content)}
                                className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                              >
                                {copiedMessageId === message.id ? (
                                  <Check className="w-3 h-3" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-lg p-3 flex items-center gap-2">
                        <Bot className="w-4 h-4" />
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Área de Input */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Digite sua pergunta sobre fisioterapia..."
                    rows={2}
                    className="resize-none"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    className="px-3"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsMuted(!isMuted)}
                    className="px-3"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                <span>Pressione Enter para enviar, Shift+Enter para nova linha</span>
                <div className="flex items-center gap-4">
                  <span>Powered by DuduFisio AI</span>
                  <Badge variant="outline" className="text-xs">
                    <Brain className="w-3 h-3 mr-1" />
                    IA Especializada
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AIChatModal;
