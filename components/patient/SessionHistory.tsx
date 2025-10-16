/**
 * components/patient/SessionHistory.tsx
 * 
 * Histórico resumido de sessões do paciente
 */

import React, { useState, useEffect } from 'react';
import { History, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface SessionHistoryProps {
  patientId: string;
}

interface Session {
  id: string;
  number: number;
  date: string;
  type: string;
  summary: string;
  painBefore: number;
  painAfter: number;
  therapist: string;
}

export function SessionHistory({ patientId }: SessionHistoryProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, [patientId]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      // TODO: Buscar sessões reais do banco de dados
      // Por enquanto usando dados mock
      setSessions([
        {
          id: '1',
          number: 5,
          date: '2025-01-15',
          type: 'Fisioterapia',
          summary: 'Exercícios de fortalecimento e alongamento',
          painBefore: 5,
          painAfter: 3,
          therapist: 'Dr. João Silva'
        },
        {
          id: '2',
          number: 4,
          date: '2025-01-13',
          type: 'Fisioterapia',
          summary: 'Avaliação de amplitude e mobilidade',
          painBefore: 6,
          painAfter: 4,
          therapist: 'Dr. João Silva'
        },
        {
          id: '3',
          number: 3,
          date: '2025-01-11',
          type: 'Fisioterapia',
          summary: 'Exercícios funcionais e propriocepção',
          painBefore: 7,
          painAfter: 5,
          therapist: 'Dr. João Silva'
        },
        {
          id: '4',
          number: 2,
          date: '2025-01-08',
          type: 'Fisioterapia',
          summary: 'Alongamento e mobilização articular',
          painBefore: 8,
          painAfter: 6,
          therapist: 'Dr. João Silva'
        },
        {
          id: '5',
          number: 1,
          date: '2025-01-05',
          type: 'Avaliação',
          summary: 'Avaliação inicial e plano de tratamento',
          painBefore: 8,
          painAfter: 8,
          therapist: 'Dr. João Silva'
        }
      ]);
    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Últimas Sessões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-health-primary-600 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Últimas Sessões
        </CardTitle>
        <Button variant="outline" size="sm">
          Ver Todas
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sessions.map((session) => (
            <div 
              key={session.id} 
              className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-health-primary-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-health-primary-700">#{session.number}</span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-sm">{new Date(session.date).toLocaleDateString('pt-BR')}</p>
                  <Badge variant="outline" className="text-xs">{session.type}</Badge>
                </div>
                <p className="text-xs text-slate-600">{session.summary}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge variant={session.painAfter < session.painBefore ? 'default' : 'secondary'}>
                  Dor: {session.painBefore}→{session.painAfter}
                </Badge>
                <span className="text-xs text-slate-500">{session.therapist}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

