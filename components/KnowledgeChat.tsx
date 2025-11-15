/**
 * Componente de Chat Inteligente com Base de Conhecimento (RAG)
 * Interface conversacional para consultar a base de conhecimento de fisioterapia
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Book, Sparkles, X, RotateCcw, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { chatWithKnowledge, type ChatMessage } from '@/lib/knowledge-base';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Message extends ChatMessage {
  id: string;
  timestamp: Date;
  sources?: {
    id: string;
    title: string;
    similarity: number;
  }[];
  tokensUsed?: {
    prompt: number;
    completion: number;
    total: number;
  };
}

export function KnowledgeChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Carregar histórico do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('knowledgeChat_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMessages(
          parsed.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          }))
        );
      } catch (error) {
        console.error('Erro ao carregar histórico:', error);
      }
    }
  }, []);

  // Salvar histórico no localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('knowledgeChat_history', JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll automático para última mensagem
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Enviar mensagem
  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Preparar histórico da conversa (últimas 5 mensagens)
      const conversationHistory: ChatMessage[] = messages
        .slice(-5)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      // Chamar API
      const response = await chatWithKnowledge(
        userMessage.content,
        conversationHistory
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
        sources: response.sources,
        tokensUsed: response.tokensUsed,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  // Limpar conversa
  const handleClear = () => {
    if (confirm('Deseja limpar toda a conversa?')) {
      setMessages([]);
      localStorage.removeItem('knowledgeChat_history');
    }
  };

  // Copiar mensagem
  const handleCopy = async (messageId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
    }
  };

  // Ações rápidas
  const quickActions = [
    'Explique o que é síndrome do túnel do carpo',
    'Como tratar tendinite no ombro?',
    'Protocolo para reabilitação de LCA',
    'Exercícios para fortalecimento de core',
  ];

  return (
    <Card className="h-[calc(100vh-200px)] flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Book className="w-5 h-5" />
            <CardTitle>Base de Conhecimento</CardTitle>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              IA
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClear}
                    disabled={messages.length === 0}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Limpar conversa</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Área de mensagens */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <Book className="w-16 h-16 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-medium mb-2">
                  Como posso ajudar?
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Faça perguntas sobre fisioterapia e receba respostas baseadas em nossa base de conhecimento.
                </p>
              </div>

              {/* Ações rápidas */}
              <div className="space-y-2 w-full max-w-md">
                <p className="text-xs text-muted-foreground">Sugestões:</p>
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start text-left"
                    onClick={() => {
                      setInputText(action);
                      inputRef.current?.focus();
                    }}
                  >
                    {action}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {/* Conteúdo da mensagem */}
                    {message.role === 'assistant' ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown
                          components={{
                            code({ inline, className, children, ...props }) {
                              const match = /language-(\w+)/.exec(className || '');
                              return !inline && match ? (
                                <SyntaxHighlighter
                                  style={oneDark}
                                  language={match[1]}
                                  PreTag="div"
                                  {...props}
                                >
                                  {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                              ) : (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              );
                            },
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}

                    {/* Fontes */}
                    {message.sources && message.sources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <p className="text-xs font-medium mb-2">Fontes:</p>
                        <div className="space-y-1">
                          {message.sources.map((source, index) => (
                            <div
                              key={source.id}
                              className="text-xs flex items-center justify-between"
                            >
                              <span>
                                [{index + 1}] {source.title}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {(source.similarity * 100).toFixed(0)}%
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tokens usados */}
                    {message.tokensUsed && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Tokens: {message.tokensUsed.total.toLocaleString()}
                      </div>
                    )}

                    {/* Ações */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">
                        {message.timestamp.toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {message.role === 'assistant' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleCopy(message.id, message.content)}
                        >
                          {copiedMessageId === message.id ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Indicador de digitação */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-4 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Consultando base de conhecimento...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Área de input */}
        <div className="border-t p-4">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Digite sua pergunta sobre fisioterapia..."
                className="w-full min-h-[60px] max-h-[200px] p-3 rounded-lg border resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Pressione Enter para enviar, Shift+Enter para nova linha
              </p>
            </div>
            <Button
              onClick={handleSend}
              disabled={!inputText.trim() || isLoading}
              size="icon"
              className="h-[60px] w-[60px]"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

