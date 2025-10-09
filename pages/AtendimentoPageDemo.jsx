// pages/AtendimentoPageDemo.tsx - Versão demo sem autenticação
'use client';
import React, { useState, useEffect } from 'react';
import { Save, BrainCircuit, Loader, Target, FileText, CheckCircle, ArrowLeft, User, Clock, Calendar, Stethoscope, Activity, Zap, TrendingUp, CheckCircle2, XCircle, Play, Pause, Square, Camera, Users, MessageSquare, BookOpen, ClipboardList, BarChart3, History, Repeat, Eye } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import SurgeryManager from '../components/atendimento/SurgeryManager';
import PatientGoalsManager from '../components/atendimento/PatientGoalsManager';
import BodyMapPain from '../components/atendimento/BodyMapPain';
const AtendimentoPageDemo = () => {
    // Mock data
    const mockAppointment = {
        id: 'demo-123',
        patientId: 'patient-1',
        therapistId: 'Dra. Camila',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 3600000).toISOString(),
        status: 'scheduled',
        type: 'session',
        value: 150,
        notes: 'Consulta de fisioterapia'
    };
    const mockPatient = {
        id: 'patient-1',
        name: 'Bruno Gomes',
        email: 'bruno.gomes@example.com',
        phone: '(21) 99876-5432',
        age: 29,
        address: {
            street: 'Rua das Flores, 123',
            city: 'Rio de Janeiro',
            state: 'RJ',
            zip: '20000-000'
        },
        conditions: ['Dor lombar'],
        status: 'Active'
    };
    // UI/Form states
    const [isFinishing, setIsFinishing] = useState(false);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [isSessionActive, setIsSessionActive] = useState(false);
    const [sessionStartTime, setSessionStartTime] = useState(null);
    const [subjective, setSubjective] = useState('');
    const [objective, setObjective] = useState('');
    const [assessment, setAssessment] = useState('');
    const [plan, setPlanState] = useState('');
    const [painScale, setPainScale] = useState(undefined);
    // Auto-save states
    const [saveStatus, setSaveStatus] = useState('saved');
    // Session tracking
    const [sessionDuration, setSessionDuration] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [isVideoEnabled, setIsVideoEnabled] = useState(false);
    // New data states
    const [surgeries, setSurgeries] = useState([
        {
            id: '1',
            name: 'Artroscopia do joelho direito',
            date: '2023-06-15',
            description: 'Reparo do menisco medial',
            surgeon: 'Dr. João Silva',
            hospital: 'Hospital São Paulo',
            recoveryTime: 90,
            createdAt: '2023-06-15T10:00:00Z',
            updatedAt: '2023-06-15T10:00:00Z'
        },
        {
            id: '2',
            name: 'Cirurgia de hérnia inguinal',
            date: '2022-03-10',
            description: 'Reparo laparoscópico',
            surgeon: 'Dr. Maria Santos',
            hospital: 'Clínica Médica Central',
            recoveryTime: 30,
            createdAt: '2022-03-10T14:30:00Z',
            updatedAt: '2022-03-10T14:30:00Z'
        }
    ]);
    const [goals, setGoals] = useState([
        {
            id: '1',
            patientId: 'patient-1',
            title: 'Correr maratona',
            description: 'Completar uma maratona com pace de 4:30/km',
            targetDate: '2024-12-15',
            targetValue: 'pace 4:30/km',
            currentProgress: 65,
            status: 'active',
            category: 'performance',
            priority: 'high',
            createdAt: '2024-01-15T09:00:00Z',
            updatedAt: '2024-01-15T09:00:00Z'
        },
        {
            id: '2',
            patientId: 'patient-1',
            title: 'Recuperação completa do joelho',
            description: 'Retornar à atividade física sem limitações',
            targetDate: '2024-03-15',
            targetValue: '100% de mobilidade',
            currentProgress: 80,
            status: 'active',
            category: 'recovery',
            priority: 'high',
            createdAt: '2024-01-15T09:00:00Z',
            updatedAt: '2024-01-15T09:00:00Z'
        }
    ]);
    const [painPoints, setPainPoints] = useState([
        {
            id: '1',
            x: 45,
            y: 60,
            intensity: 7,
            type: 'aguda',
            description: 'Dor aguda no joelho direito durante flexão',
            bodyPart: 'front',
            muscle: 'Joelho'
        },
        {
            id: '2',
            x: 50,
            y: 40,
            intensity: 4,
            type: 'latejante',
            description: 'Dor latejante na região lombar',
            bodyPart: 'back',
            muscle: 'Lombar'
        }
    ]);
    // Session duration timer
    useEffect(() => {
        let interval;
        if (isSessionActive && sessionStartTime) {
            interval = setInterval(() => {
                setSessionDuration(Math.floor((Date.now() - sessionStartTime.getTime()) / 1000));
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isSessionActive, sessionStartTime]);
    const handleStartSession = () => {
        setIsSessionActive(true);
        setSessionStartTime(new Date());
        console.log('🎉 Sessão iniciada!');
    };
    const handlePauseSession = () => {
        setIsSessionActive(false);
        console.log('⏸️ Sessão pausada');
    };
    const handleStopSession = () => {
        setIsSessionActive(false);
        setSessionStartTime(null);
        setSessionDuration(0);
        console.log('⏹️ Sessão finalizada');
    };
    const handleResumeSession = () => {
        setIsSessionActive(true);
        setSessionStartTime(new Date(Date.now() - sessionDuration * 1000));
        console.log('▶️ Sessão retomada');
    };
    const formatDuration = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    const handleSaveNote = async () => {
        setSaveStatus('saving');
        setTimeout(() => {
            setSaveStatus('saved');
            console.log('💾 Nota salva!');
        }, 1000);
    };
    const handleAiAssist = async () => {
        setIsAiLoading(true);
        setTimeout(() => {
            setAssessment('Paciente apresenta melhora na amplitude de movimento. Dor reduzida de 8/10 para 5/10 na escala visual.');
            setPlanState('Continuar exercícios de fortalecimento. Próxima sessão em 3 dias. Prescrever gelo local.');
            setIsAiLoading(false);
            console.log('🤖 Assistência IA aplicada!');
        }, 2000);
    };
    const handleFinishSession = async () => {
        setIsFinishing(true);
        setTimeout(() => {
            setIsFinishing(false);
            console.log('✅ Sessão finalizada!');
        }, 1000);
    };
    // Surgery CRUD functions
    const handleAddSurgery = (surgery) => {
        const newSurgery = {
            ...surgery,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        setSurgeries(prev => [...prev, newSurgery]);
        console.log('🏥 Cirurgia adicionada:', newSurgery);
    };
    const handleUpdateSurgery = (id, updates) => {
        setSurgeries(prev => prev.map(surgery => surgery.id === id
            ? { ...surgery, ...updates, updatedAt: new Date().toISOString() }
            : surgery));
        console.log('🏥 Cirurgia atualizada:', id, updates);
    };
    const handleDeleteSurgery = (id) => {
        setSurgeries(prev => prev.filter(surgery => surgery.id !== id));
        console.log('🏥 Cirurgia removida:', id);
    };
    // Goals CRUD functions
    const handleAddGoal = (goal) => {
        const newGoal = {
            ...goal,
            id: Date.now().toString(),
            patientId: 'patient-1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        setGoals(prev => [...prev, newGoal]);
        console.log('🎯 Objetivo adicionado:', newGoal);
    };
    const handleUpdateGoal = (id, updates) => {
        setGoals(prev => prev.map(goal => goal.id === id
            ? { ...goal, ...updates, updatedAt: new Date().toISOString() }
            : goal));
        console.log('🎯 Objetivo atualizado:', id, updates);
    };
    const handleDeleteGoal = (id) => {
        setGoals(prev => prev.filter(goal => goal.id !== id));
        console.log('🎯 Objetivo removido:', id);
    };
    // Pain Points CRUD functions
    const handleAddPainPoint = (point) => {
        const newPoint = {
            ...point,
            id: Date.now().toString()
        };
        setPainPoints(prev => [...prev, newPoint]);
        console.log('🩹 Ponto de dor adicionado:', newPoint);
    };
    const handleUpdatePainPoint = (id, updates) => {
        setPainPoints(prev => prev.map(point => point.id === id ? { ...point, ...updates } : point));
        console.log('🩹 Ponto de dor atualizado:', id, updates);
    };
    const handleDeletePainPoint = (id) => {
        setPainPoints(prev => prev.filter(point => point.id !== id));
        console.log('🩹 Ponto de dor removido:', id);
    };
    return (<div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="flex items-center space-x-2">
                                <ArrowLeft className="h-4 w-4"/>
                                <span>Voltar para Agenda</span>
                            </Button>
                            <Separator orientation="vertical" className="h-6"/>
                            <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-2">
                                    <Stethoscope className="h-5 w-5 text-blue-600"/>
                                    <h1 className="text-xl font-semibold text-slate-900">
                                        Nova Sessão de Atendimento
                                    </h1>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Session Status */}
                            <div className="flex items-center space-x-2">
                                {isSessionActive ? (<Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                                        Sessão Ativa
                                    </Badge>) : (<Badge variant="secondary">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                                        Sessão Pausada
                                    </Badge>)}
                                <span className="text-sm font-mono text-slate-600">
                                    {formatDuration(sessionDuration)}
                                </span>
                            </div>

                            {/* Save Status */}
                            <div className="flex items-center space-x-2">
                                {saveStatus === 'saving' && (<div className="flex items-center space-x-2 text-amber-600">
                                        <Loader className="h-4 w-4 animate-spin"/>
                                        <span className="text-sm">Salvando...</span>
                                    </div>)}
                                {saveStatus === 'saved' && (<div className="flex items-center space-x-2 text-green-600">
                                        <CheckCircle2 className="h-4 w-4"/>
                                        <span className="text-sm">Salvo</span>
                                    </div>)}
                                {saveStatus === 'unsaved' && (<div className="flex items-center space-x-2 text-red-600">
                                        <XCircle className="h-4 w-4"/>
                                        <span className="text-sm">Não salvo</span>
                                    </div>)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Main Content - 3 columns */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Patient Info Header */}
                        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                                <User className="h-6 w-6 text-blue-600"/>
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-semibold text-slate-900">
                                                    {mockPatient.name}
                                                </h2>
                                                <div className="flex items-center space-x-4 text-sm text-slate-600 mt-1">
                                                    <div className="flex items-center space-x-1">
                                                        <Calendar className="h-4 w-4"/>
                                                        <span>{new Date(mockAppointment.startTime).toLocaleDateString('pt-BR')}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <Clock className="h-4 w-4"/>
                                                        <span>{new Date(mockAppointment.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <Stethoscope className="h-4 w-4"/>
                                                        <span>{mockAppointment.therapistId}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Session Controls */}
                                    <div className="flex items-center space-x-2">
                                        {!isSessionActive && !sessionStartTime && (<Button onClick={handleStartSession} className="bg-green-600 hover:bg-green-700">
                                                <Play className="h-4 w-4 mr-2"/>
                                                Iniciar Sessão
                                            </Button>)}
                                        {isSessionActive && (<div className="flex items-center space-x-2">
                                                <Button variant="outline" onClick={handlePauseSession}>
                                                    <Pause className="h-4 w-4 mr-2"/>
                                                    Pausar
                                                </Button>
                                                <Button variant="destructive" onClick={handleStopSession}>
                                                    <Square className="h-4 w-4 mr-2"/>
                                                    Finalizar
                                                </Button>
                                            </div>)}
                                        {!isSessionActive && sessionStartTime && (<Button onClick={handleResumeSession} variant="outline">
                                                <Play className="h-4 w-4 mr-2"/>
                                                Retomar
                                            </Button>)}
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>

                        {/* Session Record */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <FileText className="h-5 w-5 text-blue-600"/>
                                    <span>Registro da Sessão #{mockAppointment.id.slice(-4)}</span>
                                </CardTitle>
                                <CardDescription>
                                    {mockPatient.name} - {new Date().toLocaleDateString('pt-BR')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Pain Scale */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-medium text-slate-700 flex items-center space-x-2">
                                        <Activity className="h-4 w-4"/>
                                        <span>Escala de Dor (0-10)</span>
                                    </h3>
                                    <div className="flex items-center space-x-4">
                                        <div className="flex space-x-2">
                                            {Array.from({ length: 11 }, (_, i) => (<button key={i} onClick={() => setPainScale(i)} className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all ${painScale === i
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-slate-300 hover:border-red-300 hover:bg-red-25'}`}>
                                                    {i}
                                                </button>))}
                                        </div>
                                        <div className="text-sm text-slate-600">
                                            {painScale === 0 && 'Sem dor'}
                                            {painScale === 10 && 'Dor máxima'}
                                            {painScale && painScale > 0 && painScale < 10 && `Dor moderada`}
                                        </div>
                                    </div>
                                </div>

                                {/* Treatment Summary */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                            <Users className="h-4 w-4 text-blue-600"/>
                                            <span className="text-sm font-medium text-blue-800">Sessões Realizadas</span>
                                        </div>
                                        <div className="text-2xl font-bold text-blue-900 mt-1">1</div>
                                    </div>
                                    <div className="bg-green-50 p-4 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                            <Calendar className="h-4 w-4 text-green-600"/>
                                            <span className="text-sm font-medium text-green-800">Dias de Tratamento</span>
                                        </div>
                                        <div className="text-2xl font-bold text-green-900 mt-1">0</div>
                                    </div>
                                    <div className="bg-purple-50 p-4 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                            <History className="h-4 w-4 text-purple-600"/>
                                            <span className="text-sm font-medium text-purple-800">Última Sessão</span>
                                        </div>
                                        <div className="text-sm font-bold text-purple-900 mt-1">07/01/2024</div>
                                    </div>
                                    <div className="bg-orange-50 p-4 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                            <TrendingUp className="h-4 w-4 text-orange-600"/>
                                            <span className="text-sm font-medium text-orange-800">Primeira Sessão</span>
                                        </div>
                                        <div className="text-sm font-bold text-orange-900 mt-1">07/01/2024</div>
                                    </div>
                                </div>

                                {/* Session History */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-medium text-slate-700 flex items-center space-x-2">
                                        <History className="h-4 w-4"/>
                                        <span>Histórico de Sessões (1)</span>
                                    </h3>
                                    <div className="bg-slate-50 p-4 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                                    <span className="text-sm font-bold text-purple-700">3</span>
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-900">Sessão #3 Última</div>
                                                    <div className="text-sm text-slate-600">07/01/2024 - Dr. Roberto</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => {
            console.log('🔄 Repetindo sessão #3...');
            // Here you would duplicate the session
        }}>
                                                    <Repeat className="h-4 w-4 mr-1"/>
                                                    Repetir
                                                </Button>
                                                <Button variant="outline" size="sm" className="text-purple-600 border-purple-200 hover:bg-purple-50" onClick={() => {
            console.log('👁️ Visualizando sessão #3...');
            // Here you would open session details
        }}>
                                                    <Eye className="h-4 w-4 mr-1"/>
                                                    Ver
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Surgery History */}
                        <SurgeryManager surgeries={surgeries} onAddSurgery={handleAddSurgery} onUpdateSurgery={handleUpdateSurgery} onDeleteSurgery={handleDeleteSurgery}/>

                        {/* Patient Goals */}
                        <PatientGoalsManager goals={goals} onAddGoal={handleAddGoal} onUpdateGoal={handleUpdateGoal} onDeleteGoal={handleDeleteGoal}/>

                        {/* Body Map Pain */}
                        <BodyMapPain painPoints={painPoints} onAddPainPoint={handleAddPainPoint} onUpdatePainPoint={handleUpdatePainPoint} onDeletePainPoint={handleDeletePainPoint}/>

                        {/* SOAP Notes */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <ClipboardList className="h-5 w-5 text-blue-600"/>
                                        <span>Registro SOAP</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button variant="outline" size="sm" onClick={handleAiAssist} disabled={isAiLoading}>
                                            {isAiLoading ? (<Loader className="h-4 w-4 mr-2 animate-spin"/>) : (<BrainCircuit className="h-4 w-4 mr-2"/>)}
                                            Assistência IA
                                        </Button>
                                        <Button onClick={handleSaveNote} disabled={saveStatus === 'saving'}>
                                            {saveStatus === 'saving' ? (<Loader className="h-4 w-4 mr-2 animate-spin"/>) : (<Save className="h-4 w-4 mr-2"/>)}
                                            Salvar Nota
                                        </Button>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Subjective */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">
                                        Subjetivo (S)
                                    </label>
                                    <textarea value={subjective} onChange={(e) => setSubjective(e.target.value)} placeholder="Como o paciente se sente? Quais são as queixas principais?" className="w-full p-3 border border-slate-300 rounded-lg min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
                                </div>

                                {/* Objective */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">
                                        Objetivo (O)
                                    </label>
                                    <textarea value={objective} onChange={(e) => setObjective(e.target.value)} placeholder="Achados objetivos, testes realizados, observações clínicas..." className="w-full p-3 border border-slate-300 rounded-lg min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
                                </div>

                                {/* Assessment */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">
                                        Avaliação (A)
                                    </label>
                                    <textarea value={assessment} onChange={(e) => setAssessment(e.target.value)} placeholder="Diagnóstico clínico, análise dos achados..." className="w-full p-3 border border-slate-300 rounded-lg min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
                                </div>

                                {/* Plan */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">
                                        Plano (P)
                                    </label>
                                    <textarea value={plan} onChange={(e) => setPlanState(e.target.value)} placeholder="Plano de tratamento, próximos passos, exercícios prescritos..." className="w-full p-3 border border-slate-300 rounded-lg min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar - 1 column */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Patient Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <User className="h-5 w-5 text-blue-600"/>
                                    <span>Informações Pessoais</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-3 text-sm">
                                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                                        <Users className="h-4 w-4 text-slate-600"/>
                                    </div>
                                    <span className="text-slate-600">Rio de Janeiro, RJ</span>
                                </div>
                                <div className="flex items-center space-x-3 text-sm">
                                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                                        <MessageSquare className="h-4 w-4 text-slate-600"/>
                                    </div>
                                    <span className="text-slate-600">{mockPatient.email}</span>
                                </div>
                                <div className="flex items-center space-x-3 text-sm">
                                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                                        <Activity className="h-4 w-4 text-slate-600"/>
                                    </div>
                                    <span className="text-slate-600">{mockPatient.phone}</span>
                                </div>
                                <div className="flex items-center space-x-3 text-sm">
                                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                                        <Calendar className="h-4 w-4 text-slate-600"/>
                                    </div>
                                    <span className="text-slate-600">{mockPatient.age} anos</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Zap className="h-5 w-5 text-yellow-600"/>
                                    <span>Ações Rápidas</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button variant="outline" className="w-full justify-start" onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
                const file = e.target.files?.[0];
                if (file) {
                    console.log('📸 Foto adicionada:', file.name);
                    // Here you would handle file upload
                }
            };
            input.click();
        }}>
                                    <Camera className="h-4 w-4 mr-2"/>
                                    Adicionar Foto
                                </Button>
                                <Button variant="outline" className="w-full justify-start" onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.pdf,.doc,.docx,.jpg,.png';
            input.onchange = (e) => {
                const file = e.target.files?.[0];
                if (file) {
                    console.log('📄 Documento anexado:', file.name);
                    // Here you would handle file upload
                }
            };
            input.click();
        }}>
                                    <FileText className="h-4 w-4 mr-2"/>
                                    Anexar Documento
                                </Button>
                                <Button variant="outline" className="w-full justify-start" onClick={() => {
            console.log('📊 Abrindo relatórios...');
            // Here you would navigate to reports page
        }}>
                                    <BarChart3 className="h-4 w-4 mr-2"/>
                                    Ver Relatórios
                                </Button>
                                <Button variant="outline" className="w-full justify-start" onClick={() => {
            console.log('📚 Abrindo histórico completo...');
            // Here you would navigate to patient history
        }}>
                                    <BookOpen className="h-4 w-4 mr-2"/>
                                    Histórico Completo
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Session Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center space-x-2">
                                    <Target className="h-5 w-5 text-green-600"/>
                                    <span>Resumo da Sessão</span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Duração</span>
                                        <span className="font-medium">{formatDuration(sessionDuration)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Status</span>
                                        <Badge variant={isSessionActive ? "default" : "secondary"}>
                                            {isSessionActive ? 'Ativa' : 'Pausada'}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-600">Nota Salva</span>
                                        <Badge variant={saveStatus === 'saved' ? "default" : "destructive"}>
                                            {saveStatus === 'saved' ? 'Sim' : 'Não'}
                                        </Badge>
                                    </div>
                                </div>
                                
                                <Separator />
                                
                                <Button onClick={handleFinishSession} disabled={isFinishing} className="w-full bg-green-600 hover:bg-green-700">
                                    {isFinishing ? (<Loader className="h-4 w-4 mr-2 animate-spin"/>) : (<CheckCircle className="h-4 w-4 mr-2"/>)}
                                    Finalizar Sessão
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>);
};
export default AtendimentoPageDemo;
