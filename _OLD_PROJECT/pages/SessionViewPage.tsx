import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, FileText } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { getSoapNoteById } from '../services/soapNoteService';
import { getPatientById } from '../services/patientService';
import { SoapNote, Patient } from '../types';
import Layout from '../components/Layout';
import MarkdownRenderer from '../components/ui/MarkdownRenderer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';

const SessionViewPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [session, setSession] = useState<SoapNote | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🚀 Função de carregamento memoizada
  const loadSessionData = useCallback(async () => {
    

    if (!sessionId) {
      
      showToast('ID da sessão não fornecido', 'error');
      navigate('/agenda');
      return;
    }

    try {
      setIsLoading(true);
      

          // Carregar dados da sessão
          // Converter sessionId numérico para formato esperado (note1, note2, etc.)
          const formattedSessionId = sessionId.startsWith('note') ? sessionId : `note${sessionId}`;
          

          const sessionData = await getSoapNoteById(formattedSessionId);
          

      if (!sessionData) {
        
        showToast('Sessão não encontrada', 'error');
        navigate('/agenda');
        return;
      }
      setSession(sessionData);

      // Carregar dados do paciente
      
      const patientData = await getPatientById(sessionData.patientId);
      
      setPatient(patientData || null);

    } catch (error) {
      console.error('SessionViewPage: Erro ao carregar dados da sessão:', error);
      showToast('Erro ao carregar dados da sessão', 'error');
      navigate('/agenda');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, navigate, showToast]);

  useEffect(() => {
    loadSessionData();
  }, [loadSessionData]);

  // 🚀 Helper function memoizada
  const formatDate = useCallback((dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-md"></div>
            <p className="text-neutral-textSecondary">Carregando sessão...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !session) {
    return (
      <Layout>
        <div className="p-lg">
          <h1 className="text-2xl font-bold text-error">Erro</h1>
          <p className="text-red-500">{error || 'Sessão não encontrada'}</p>
          <Button onClick={() => navigate('/agenda')} className="mt-md">
            <ArrowLeft className="w-4 h-4 mr-sm" /> Voltar para Agenda
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-lg max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-xl">
          <Button onClick={() => navigate('/agenda')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-sm" /> Voltar
          </Button>
          <h1 className="text-3xl font-bold text-neutral-text">Detalhes da Sessão #{session.sessionNumber || 'N/A'}</h1>
        </div>

        <Card className="mb-xl shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <FileText className="w-5 h-5 mr-sm text-primary" />
              Informações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-md text-neutral-text">
            <p className="flex items-center">
              <Calendar className="w-4 h-4 mr-sm text-neutral-textSecondary" /> 
              Data: {formatDate(session.date)}
            </p>
            <p className="flex items-center">
              <User className="w-4 h-4 mr-sm text-neutral-textSecondary" /> 
              Paciente: {patient?.name || 'N/A'}
            </p>
            <p className="flex items-center">
              <FileText className="w-4 h-4 mr-sm text-neutral-textSecondary" /> 
              Terapeuta: {session.therapist || 'N/A'}
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg mb-xl">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg text-primary">S (Subjetivo)</CardTitle>
            </CardHeader>
            <CardContent>
              <MarkdownRenderer content={session.subjective} />
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg text-success">O (Objetivo)</CardTitle>
            </CardHeader>
            <CardContent>
              <MarkdownRenderer content={session.objective} />
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg text-warning">A (Avaliação)</CardTitle>
            </CardHeader>
            <CardContent>
              <MarkdownRenderer content={session.assessment} />
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-lg text-purple-600">P (Plano)</CardTitle>
            </CardHeader>
            <CardContent>
              <MarkdownRenderer content={session.plan} />
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center">
          <Button onClick={() => navigate('/agenda')} className="px-lg py-sm">
            Voltar para Agenda
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default SessionViewPage;