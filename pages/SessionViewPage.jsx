import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, FileText } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { getSoapNoteById } from '../services/soapNoteService';
import { getPatientById } from '../services/patientService';
import Layout from '../components/Layout';
import MarkdownRenderer from '../components/ui/MarkdownRenderer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
const SessionViewPage = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [session, setSession] = useState(null);
    const [patient, setPatient] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    // 🚀 Função de carregamento memoizada
    const loadSessionData = useCallback(async () => {
        console.log('SessionViewPage: Carregando dados da sessão, sessionId:', sessionId);
        if (!sessionId) {
            console.log('SessionViewPage: ID da sessão não fornecido, redirecionando para agenda');
            showToast('ID da sessão não fornecido', 'error');
            navigate('/agenda');
            return;
        }
        try {
            setIsLoading(true);
            console.log('SessionViewPage: Buscando sessão com ID:', sessionId);
            // Carregar dados da sessão
            // Converter sessionId numérico para formato esperado (note1, note2, etc.)
            const formattedSessionId = sessionId.startsWith('note') ? sessionId : `note${sessionId}`;
            console.log('SessionViewPage: ID formatado:', formattedSessionId);
            const sessionData = await getSoapNoteById(formattedSessionId);
            console.log('SessionViewPage: Dados da sessão encontrados:', sessionData);
            if (!sessionData) {
                console.log('SessionViewPage: Sessão não encontrada, redirecionando para agenda');
                showToast('Sessão não encontrada', 'error');
                navigate('/agenda');
                return;
            }
            setSession(sessionData);
            // Carregar dados do paciente
            console.log('SessionViewPage: Buscando dados do paciente:', sessionData.patientId);
            const patientData = await getPatientById(sessionData.patientId);
            console.log('SessionViewPage: Dados do paciente encontrados:', patientData);
            setPatient(patientData || null);
        }
        catch (error) {
            console.error('SessionViewPage: Erro ao carregar dados da sessão:', error);
            showToast('Erro ao carregar dados da sessão', 'error');
            navigate('/agenda');
        }
        finally {
            setIsLoading(false);
        }
    }, [sessionId, navigate, showToast]);
    useEffect(() => {
        loadSessionData();
    }, [loadSessionData]);
    // 🚀 Helper function memoizada
    const formatDate = useCallback((dateString) => {
        try {
            return new Date(dateString).toLocaleDateString('pt-BR');
        }
        catch {
            return dateString;
        }
    });
    if (isLoading) {
        return (<Layout>
        <div className="flex justify-center items-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Carregando sessão...</p>
          </div>
        </div>
      </Layout>);
    }
    if (error || !session) {
        return (<Layout>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-red-600">Erro</h1>
          <p className="text-red-500">{error || 'Sessão não encontrada'}</p>
          <Button onClick={() => navigate('/agenda')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2"/> Voltar para Agenda
          </Button>
        </div>
      </Layout>);
    }
    return (<Layout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button onClick={() => navigate('/agenda')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2"/> Voltar
          </Button>
          <h1 className="text-3xl font-bold text-slate-800">Detalhes da Sessão #{session.sessionNumber || 'N/A'}</h1>
        </div>

        <Card className="mb-6 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <FileText className="w-5 h-5 mr-2 text-blue-600"/>
              Informações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-700">
            <p className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-slate-500"/> 
              Data: {formatDate(session.date)}
            </p>
            <p className="flex items-center">
              <User className="w-4 h-4 mr-2 text-slate-500"/> 
              Paciente: {patient?.name || 'N/A'}
            </p>
            <p className="flex items-center">
              <FileText className="w-4 h-4 mr-2 text-slate-500"/> 
              Terapeuta: {session.therapist || 'N/A'}
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-blue-600">S (Subjetivo)</CardTitle>
            </CardHeader>
            <CardContent>
              <MarkdownRenderer content={session.subjective}/>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-green-600">O (Objetivo)</CardTitle>
            </CardHeader>
            <CardContent>
              <MarkdownRenderer content={session.objective}/>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-orange-600">A (Avaliação)</CardTitle>
            </CardHeader>
            <CardContent>
              <MarkdownRenderer content={session.assessment}/>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg text-purple-600">P (Plano)</CardTitle>
            </CardHeader>
            <CardContent>
              <MarkdownRenderer content={session.plan}/>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center">
          <Button onClick={() => navigate('/agenda')} className="px-6 py-2">
            Voltar para Agenda
          </Button>
        </div>
      </div>
    </Layout>);
};
export default SessionViewPage;
