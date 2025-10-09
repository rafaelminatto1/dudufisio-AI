// pages/EnhancedProtocolsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, Search, Eye, Edit, TrendingUp, Users, Clock, Award, BarChart3, FileText, X, CheckCircle, AlertCircle, Activity, Zap, Stethoscope, Heart, Brain, Baby, Dumbbell, Link, Sparkles } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { ProtocolCategory, EvidenceLevel } from '../types';
import * as protocolsService from '../services/protocolsService';
import { integratedProtocolsService } from '../services/integratedProtocolsService';
import { useToast } from '../contexts/ToastContext';
import { Skeleton } from '../components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
const EnhancedProtocolsPage = () => {
    // State management
    const [activeTab, setActiveTab] = useState('library');
    const [protocols, setProtocols] = useState([]);
    const [analytics, setAnalytics] = useState([]);
    const [libraryStats, setLibraryStats] = useState(null);
    const [prescriptions, setPrescriptions] = useState([]);
    const [assessmentTools, setAssessmentTools] = useState([]);
    const [outcomeMetrics, setOutcomeMetrics] = useState([]);
    const [integratedStats, setIntegratedStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();
    // Filter states
    const [protocolFilters, setProtocolFilters] = useState({
        includeClinical: true,
        includeSystem: true
    });
    const [selectedProtocol, setSelectedProtocol] = useState(null);
    // Data fetching
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [protocolsData, analyticsData, statsData, prescriptionsData, toolsData, metricsData, integratedStatsData] = await Promise.all([
                integratedProtocolsService.getAllProtocols(protocolFilters),
                protocolsService.getProtocolAnalytics(),
                protocolsService.getProtocolLibraryStats(),
                protocolsService.getProtocolPrescriptions(),
                protocolsService.getAssessmentTools(),
                protocolsService.getOutcomeMetrics(),
                integratedProtocolsService.getIntegratedStats()
            ]);
            setProtocols(protocolsData);
            setAnalytics(analyticsData);
            setLibraryStats(statsData);
            setPrescriptions(prescriptionsData);
            setAssessmentTools(toolsData);
            setOutcomeMetrics(metricsData);
            setIntegratedStats(integratedStatsData);
        }
        catch (error) {
            showToast('Erro ao carregar dados dos protocolos.', 'error');
        }
        finally {
            setIsLoading(false);
        }
    }, [protocolFilters, showToast]);
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    // Event handlers
    const handleProtocolClick = (protocol) => {
        setSelectedProtocol(protocol);
    };
    const handlePrescribeProtocol = async (protocolId, patientId) => {
        try {
            await protocolsService.prescribeProtocol(protocolId, patientId, 'current-user');
            showToast('Protocolo prescrito com sucesso!', 'success');
            fetchData();
        }
        catch (error) {
            showToast('Erro ao prescrever protocolo.', 'error');
        }
    };
    // Utility functions
    const getCategoryIcon = (category) => {
        switch (category) {
            case ProtocolCategory.Orthopedic:
                return Dumbbell;
            case ProtocolCategory.Neurological:
                return Brain;
            case ProtocolCategory.Cardiorespiratory:
                return Heart;
            case ProtocolCategory.Pediatric:
                return Baby;
            case ProtocolCategory.Sports:
                return Activity;
            default:
                return Stethoscope;
        }
    };
    const getEvidenceLevelColor = (level) => {
        switch (level) {
            case EvidenceLevel.IA:
                return 'bg-green-500';
            case EvidenceLevel.IB:
                return 'bg-green-400';
            case EvidenceLevel.IIA:
                return 'bg-yellow-500';
            case EvidenceLevel.IIB:
                return 'bg-yellow-400';
            default:
                return 'bg-gray-400';
        }
    };
    const getSpecialtyColor = (specialty) => {
        switch (specialty) {
            case 'esportiva':
                return 'bg-blue-100 text-blue-800';
            case 'pos-operatoria':
                return 'bg-green-100 text-green-800';
            case 'geriatrica':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };
    // Render methods
    const renderLibrary = () => (<div className="space-y-6">
            {/* Header with integrated stats */}
            {integratedStats && (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total de Protocolos</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground"/>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{integratedStats.totalProtocols}</div>
                            <p className="text-xs text-muted-foreground">
                                {integratedStats.clinicalProtocols} clínicos + {integratedStats.systemProtocols} sistema
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Com Exercícios</CardTitle>
                            <Link className="h-4 w-4 text-muted-foreground"/>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{integratedStats.protocolsWithExercises}</div>
                            <p className="text-xs text-muted-foreground">
                                protocolos vinculados
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Especialidades</CardTitle>
                            <Sparkles className="h-4 w-4 text-muted-foreground"/>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{Object.keys(integratedStats.specialties).length}</div>
                            <p className="text-xs text-muted-foreground">
                                áreas especializadas
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Nível 1A</CardTitle>
                            <Award className="h-4 w-4 text-muted-foreground"/>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{integratedStats.evidenceLevels['IA'] || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                alta evidência científica
                            </p>
                        </CardContent>
                    </Card>
                </div>)}

            {/* Enhanced Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                        <div>
                            <Label htmlFor="category">Categoria</Label>
                            <select id="category" title="Filtrar por categoria de protocolo" className="w-full mt-1 p-2 border rounded-md" value={protocolFilters.category || ''} onChange={(e) => setProtocolFilters(prev => ({
            ...prev,
            category: e.target.value || undefined
        }))}>
                                <option value="">Todas as categorias</option>
                                {Object.values(ProtocolCategory).map(category => (<option key={category} value={category}>{category}</option>))}
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="specialty">Especialidade</Label>
                            <select id="specialty" title="Filtrar por especialidade" className="w-full mt-1 p-2 border rounded-md" value={protocolFilters.specialty || ''} onChange={(e) => setProtocolFilters(prev => ({
            ...prev,
            specialty: e.target.value || undefined
        }))}>
                                <option value="">Todas as especialidades</option>
                                <option value="esportiva">Fisioterapia Esportiva</option>
                                <option value="pos-operatoria">Fisioterapia Pós-Operatória</option>
                                <option value="geriatrica">Fisioterapia Gerontológica</option>
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="evidence">Nível de Evidência</Label>
                            <select id="evidence" title="Filtrar por nível de evidência" className="w-full mt-1 p-2 border rounded-md" value={protocolFilters.evidenceLevel || ''} onChange={(e) => setProtocolFilters(prev => ({
            ...prev,
            evidenceLevel: e.target.value || undefined
        }))}>
                                <option value="">Todos os níveis</option>
                                {Object.values(EvidenceLevel).map(level => (<option key={level} value={level}>Nível {level}</option>))}
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="status">Status</Label>
                            <select id="status" title="Filtrar por status" className="w-full mt-1 p-2 border rounded-md" value={protocolFilters.isActive?.toString() || ''} onChange={(e) => setProtocolFilters(prev => ({
            ...prev,
            isActive: e.target.value === 'true' ? true : e.target.value === 'false' ? false : undefined
        }))}>
                                <option value="">Todos</option>
                                <option value="true">Ativo</option>
                                <option value="false">Inativo</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <Label htmlFor="search">Buscar</Label>
                            <div className="relative mt-1">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"/>
                                <Input id="search" type="text" placeholder="Buscar protocolos..." className="pl-10" value={protocolFilters.searchTerm || ''} onChange={(e) => setProtocolFilters(prev => ({
            ...prev,
            searchTerm: e.target.value || undefined
        }))}/>
                            </div>
                        </div>
                    </div>

                    {/* Source filters */}
                    <div className="mt-4 flex gap-4">
                        <div className="flex items-center">
                            <input id="include-clinical" type="checkbox" checked={protocolFilters.includeClinical !== false} onChange={(e) => setProtocolFilters(prev => ({
            ...prev,
            includeClinical: e.target.checked
        }))} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
                            <label htmlFor="include-clinical" className="ml-2 text-sm text-gray-700">
                                Incluir Protocolos Clínicos
                            </label>
                        </div>
                        <div className="flex items-center">
                            <input id="include-system" type="checkbox" checked={protocolFilters.includeSystem !== false} onChange={(e) => setProtocolFilters(prev => ({
            ...prev,
            includeSystem: e.target.checked
        }))} className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"/>
                            <label htmlFor="include-system" className="ml-2 text-sm text-gray-700">
                                Incluir Protocolos do Sistema
                            </label>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Enhanced Protocols Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {protocols.map((protocol) => {
            const IconComponent = getCategoryIcon(protocol.category);
            const isClinical = protocol.id.startsWith('clinical-');
            return (<Card key={protocol.id} className="cursor-pointer hover:shadow-md transition-shadow">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <IconComponent className="w-5 h-5 text-blue-600"/>
                                        <Badge variant="outline">{protocol.category}</Badge>
                                        {isClinical && (<Badge className={getSpecialtyColor(protocol.specialty)}>
                                                {protocol.specialty}
                                            </Badge>)}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-3 h-3 rounded-full ${getEvidenceLevelColor(protocol.evidenceLevel)}`}/>
                                        <span className="text-xs font-medium">Nível {protocol.evidenceLevel}</span>
                                    </div>
                                </div>
                                <CardTitle className="text-lg">{protocol.name}</CardTitle>
                                <CardDescription>{protocol.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center">
                                            <Users className="w-4 h-4 mr-1"/>
                                            {protocol.timesUsed} usos
                                        </span>
                                        {protocol.successRate && (<span className="flex items-center text-green-600">
                                                <TrendingUp className="w-4 h-4 mr-1"/>
                                                {protocol.successRate}% sucesso
                                            </span>)}
                                    </div>

                                    <div className="flex items-center text-sm text-muted-foreground">
                                        <Clock className="w-4 h-4 mr-1"/>
                                        {protocol.estimatedDuration.min}-{protocol.estimatedDuration.max} {protocol.estimatedDuration.unit}
                                    </div>

                                    {/* Show linked exercises for clinical protocols */}
                                    {isClinical && protocol.linkedExercises && protocol.linkedExercises.length > 0 && (<div className="flex items-center text-sm text-blue-600">
                                            <Link className="w-4 h-4 mr-1"/>
                                            {protocol.linkedExercises.length} exercícios vinculados
                                        </div>)}

                                    <div className="flex flex-wrap gap-1">
                                        {protocol.tags.slice(0, 3).map((tag) => (<Badge key={tag} variant="secondary" className="text-xs">
                                                {tag}
                                            </Badge>))}
                                    </div>

                                    <div className="flex justify-between items-center pt-2">
                                        <Button variant="outline" size="sm" onClick={() => handleProtocolClick(protocol)}>
                                            <Eye className="w-4 h-4 mr-1"/>
                                            Ver Detalhes
                                        </Button>
                                        <Button size="sm" onClick={() => handlePrescribeProtocol(protocol.id, 'patient-id')}>
                                            <Zap className="w-4 h-4 mr-1"/>
                                            Prescrever
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>);
        })}
            </div>
        </div>);
    // Keep existing render methods for other tabs
    const renderPrescriptions = () => (<div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Prescrições de Protocolos</h2>
                    <p className="text-muted-foreground">Gerencie protocolos prescritos para pacientes</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {prescriptions.map((prescription) => {
            const protocol = protocols.find(p => p.id === prescription.protocolId);
            if (!protocol)
                return null;
            return (<Card key={prescription.id}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <Badge variant={prescription.status === 'active' ? 'default' : 'secondary'}>
                                        {prescription.status}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">
                                        Fase: {prescription.currentPhase}
                                    </span>
                                </div>
                                <CardTitle className="text-lg">{protocol.name}</CardTitle>
                                <CardDescription>
                                    Paciente: {prescription.patientId} | Prescrito em: {new Date(prescription.prescribedAt).toLocaleDateString()}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span>Aderência</span>
                                        <span className="font-medium">{prescription.adherenceRate}%</span>
                                    </div>
                                    <Progress value={prescription.adherenceRate}/>

                                    <div className="text-sm text-muted-foreground">
                                        <strong>Próxima avaliação:</strong> Em 2 semanas
                                    </div>

                                    {prescription.outcomes.length > 0 && (<div className="text-sm">
                                            <strong>Resultados:</strong>
                                            <ul className="mt-1 space-y-1">
                                                {prescription.outcomes.slice(0, 2).map((outcome, index) => (<li key={index} className="flex items-center">
                                                        {outcome.clinicallySignificant ? (<CheckCircle className="w-3 h-3 text-green-500 mr-1"/>) : (<AlertCircle className="w-3 h-3 text-yellow-500 mr-1"/>)}
                                                        <span className="text-xs">
                                                            {outcome.metricName}: {outcome.percentChange.toFixed(1)}%
                                                        </span>
                                                    </li>))}
                                            </ul>
                                        </div>)}

                                    <div className="flex justify-between items-center pt-2">
                                        <Button variant="outline" size="sm">
                                            <FileText className="w-4 h-4 mr-1"/>
                                            Relatório
                                        </Button>
                                        <Button size="sm">
                                            <Edit className="w-4 h-4 mr-1"/>
                                            Modificar
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>);
        })}
            </div>
        </div>);
    const renderAnalytics = () => (<div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Analytics de Protocolos</h2>
                <p className="text-muted-foreground">Métricas de desempenho e eficácia dos protocolos</p>
            </div>

            {analytics.length > 0 && (<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {analytics.map((analytic) => {
                const protocol = protocols.find(p => p.id === analytic.protocolId);
                if (!protocol)
                    return null;
                return (<Card key={analytic.protocolId}>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <BarChart3 className="w-5 h-5 mr-2"/>
                                        {analytic.protocolName}
                                    </CardTitle>
                                    <CardDescription>
                                        Análise de {analytic.totalPrescriptions} prescrições
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-green-600">
                                                    {analytic.successRate.toFixed(1)}%
                                                </div>
                                                <div className="text-xs text-muted-foreground">Taxa de Sucesso</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-blue-600">
                                                    {analytic.adherenceRate.toFixed(1)}%
                                                </div>
                                                <div className="text-xs text-muted-foreground">Aderência Média</div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-sm font-medium mb-2">Resultados por Métrica:</div>
                                            {Object.entries(analytic.outcomeMetrics).map(([metric, data]) => (<div key={metric} className="flex justify-between items-center text-sm mb-1">
                                                    <span>{metric}</span>
                                                    <span className="text-green-600">
                                                        +{data.averageImprovement.toFixed(1)}%
                                                    </span>
                                                </div>))}
                                        </div>

                                        <div>
                                            <div className="text-sm font-medium mb-2">Tendência Mensal:</div>
                                            <div className="space-y-1">
                                                {analytic.monthlyTrends.slice(-3).map((trend) => (<div key={trend.month} className="flex justify-between text-xs">
                                                        <span>{trend.month}</span>
                                                        <span>{trend.prescriptions} prescrições</span>
                                                        <span className="text-green-600">{trend.successRate.toFixed(1)}%</span>
                                                    </div>))}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>);
            })}
                </div>)}
        </div>);
    const renderEvidence = () => (<div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Base de Evidências</h2>
                <p className="text-muted-foreground">Referências científicas e atualizações dos protocolos</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Distribuição por Nível de Evidência</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {integratedStats && (<div className="space-y-3">
                                {Object.entries(integratedStats.evidenceLevels).map(([level, count]) => {
                const percentage = (count / integratedStats.totalProtocols) * 100;
                return (<div key={level} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <div className={`w-3 h-3 rounded-full ${getEvidenceLevelColor(level)}`}/>
                                                <span className="text-sm font-medium">Nível {level}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm text-muted-foreground">{count}</span>
                                                <div className="w-20">
                                                    <Progress value={percentage}/>
                                                </div>
                                                <span className="text-sm text-muted-foreground w-10 text-right">
                                                    {percentage.toFixed(0)}%
                                                </span>
                                            </div>
                                        </div>);
            })}
                            </div>)}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Protocolos por Especialidade</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {integratedStats && (<div className="space-y-3">
                                {Object.entries(integratedStats.specialties).map(([specialty, count]) => (<div key={specialty} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <div className={`w-3 h-3 rounded-full ${getSpecialtyColor(specialty).replace('text-', 'bg-').replace('100', '500')}`}/>
                                            <span className="text-sm font-medium">{specialty}</span>
                                        </div>
                                        <span className="text-sm text-muted-foreground">{count}</span>
                                    </div>))}
                            </div>)}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Ferramentas de Avaliação</CardTitle>
                    <CardDescription>Instrumentos validados para avaliação clínica</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {assessmentTools.map((tool) => (<div key={tool.id} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium">{tool.name}</h4>
                                    <Badge variant="outline">{tool.type}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">{tool.description}</p>
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    {tool.reliability && <span>Confiabilidade: {tool.reliability}</span>}
                                    {tool.validity && <span>Validade: {tool.validity}</span>}
                                </div>
                            </div>))}
                    </div>
                </CardContent>
            </Card>
        </div>);
    if (isLoading) {
        return (<div className="space-y-6">
                <PageHeader title="Protocolos Clínicos Integrados" subtitle="Carregando protocolos..."/>
                <Skeleton className="h-96 w-full"/>
            </div>);
    }
    return (<div className="space-y-6">
            <PageHeader title="Protocolos Clínicos Integrados" subtitle="Biblioteca completa de protocolos baseados em evidências + conteúdo clínico especializado"/>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="library">Biblioteca</TabsTrigger>
                    <TabsTrigger value="prescriptions">Prescrições</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="evidence">Evidências</TabsTrigger>
                </TabsList>

                <TabsContent value="library" className="mt-6">
                    {renderLibrary()}
                </TabsContent>

                <TabsContent value="prescriptions" className="mt-6">
                    {renderPrescriptions()}
                </TabsContent>

                <TabsContent value="analytics" className="mt-6">
                    {renderAnalytics()}
                </TabsContent>

                <TabsContent value="evidence" className="mt-6">
                    {renderEvidence()}
                </TabsContent>
            </Tabs>

            {/* Protocol Detail Modal */}
            {selectedProtocol && (<div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b">
                            <div>
                                <h2 className="text-xl font-bold">{selectedProtocol.name}</h2>
                                <div className="flex items-center space-x-2 mt-1">
                                    <Badge variant="outline">{selectedProtocol.category}</Badge>
                                    {selectedProtocol.specialty && (<Badge className={getSpecialtyColor(selectedProtocol.specialty)}>
                                            {selectedProtocol.specialty}
                                        </Badge>)}
                                </div>
                            </div>
                            <Button variant="ghost" onClick={() => setSelectedProtocol(null)}>
                                <X className="w-5 h-5"/>
                            </Button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Descrição</h3>
                                    <p className="text-muted-foreground">{selectedProtocol.description}</p>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Critérios de Inclusão</h3>
                                    <ul className="list-disc list-inside space-y-1">
                                        {selectedProtocol.inclusionCriteria.map((criteria, index) => (<li key={index} className="text-sm">{criteria}</li>))}
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Fases do Tratamento</h3>
                                    <div className="space-y-4">
                                        {selectedProtocol.treatmentPlan.map((phase, index) => (<div key={index} className="border rounded-lg p-4">
                                                <h4 className="font-medium">{phase.name}</h4>
                                                <p className="text-sm text-muted-foreground mb-2">{phase.description}</p>
                                                <div className="text-sm">
                                                    <strong>Objetivos:</strong>
                                                    <ul className="list-disc list-inside mt-1">
                                                        {phase.objectives.map((objective, objIndex) => (<li key={objIndex}>{objective}</li>))}
                                                    </ul>
                                                </div>
                                            </div>))}
                                    </div>
                                </div>

                                {/* Show linked exercises for clinical protocols */}
                                {selectedProtocol.linkedExercises && selectedProtocol.linkedExercises.length > 0 && (<div>
                                        <h3 className="text-lg font-semibold mb-2">Exercícios Vinculados</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {selectedProtocol.linkedExercises.map((exercise, index) => (<div key={index} className="border rounded-lg p-3">
                                                    <h4 className="font-medium">{exercise.name}</h4>
                                                    <p className="text-sm text-muted-foreground">{exercise.description}</p>
                                                    <div className="flex items-center mt-2">
                                                        <Badge variant="secondary" className="text-xs">
                                                            {exercise.difficulty}
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground ml-2">
                                                            {exercise.targetMuscles?.join(', ')}
                                                        </span>
                                                    </div>
                                                </div>))}
                                        </div>
                                    </div>)}

                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Critérios de Alta</h3>
                                    <ul className="list-disc list-inside space-y-1">
                                        {selectedProtocol.dischargeCriteria.map((criteria, index) => (<li key={index} className="text-sm">{criteria}</li>))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="border-t p-6 flex justify-end space-x-3">
                            <Button variant="outline" onClick={() => setSelectedProtocol(null)}>
                                Fechar
                            </Button>
                            <Button onClick={() => handlePrescribeProtocol(selectedProtocol.id, 'patient-id')}>
                                <Zap className="w-4 h-4 mr-2"/>
                                Prescrever Protocolo
                            </Button>
                        </div>
                    </div>
                </div>)}
        </div>);
};
export default EnhancedProtocolsPage;
