import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import xaiService from '@/services/xaiService';

export const XAIChat: React.FC = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    setLoading(true);
    try {
      const result = await xaiService.generateText(
        input,
        'Você é um assistente de fisioterapia especializado. Responda de forma clara, profissional e em português brasileiro.'
      );
      setResponse(result);
    } catch (error) {
      console.error('Erro ao usar XAI:', error);
      setResponse('Erro ao processar sua solicitação. Verifique se a API do XAI está configurada corretamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!xaiService.isAvailable()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Assistente AI (XAI/Grok)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            Serviço XAI não está disponível. Configure a chave da API no arquivo .env.local
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assistente AI (XAI/Grok)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua pergunta sobre fisioterapia..."
            rows={3}
          />
          <Button type="submit" disabled={loading || !input.trim()}>
            {loading ? 'Processando...' : 'Enviar'}
          </Button>
        </form>
        
        {response && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Resposta:</h4>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="whitespace-pre-wrap">{response}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
