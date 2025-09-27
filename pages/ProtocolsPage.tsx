// pages/ProtocolsPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '../components/PageHeader';
import { 
    Protocol,
    ProtocolCategory,
    EvidenceLevel,
    ProtocolPhase,
    ProtocolAnalytics,
    ProtocolLibraryStats,
    ProtocolPrescription,
    AssessmentTool,
    OutcomeMetric,
    ProtocolReference
} from '../types';
import * as protocolsService from '../services/protocolsService';
import { useToast } from '../contexts/ToastContext';
import { Skeleton } from '../components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
    BookOpen, 
    Search,
    Filter,
    Plus,
    Eye,
    Edit,
    Trash2,
    Download,
    Share,
    Star,
    TrendingUp,
    Users,
    Clock,
    Award,
    Target,
    BarChart3,
    FileText,
    Lightbulb,
    CheckCircle,
    AlertCircle,
    Activity,
    Zap,
    Globe,
    BookMarked,
    Stethoscope,
    Heart,
    Brain,
    Baby,
    Dumbbell
} from 'lucide-react';

const ProtocolsPage: React.FC = () => {
    // State management
    const [activeTab, setActiveTab] = useState('library');
    const [protocols, setProtocols] = useState<Protocol[]>([]);
    const [analytics, setAnalytics] = useState<ProtocolAnalytics[]>([]);
    const [libraryStats, setLibraryStats] = useState<ProtocolLibraryStats | null>(null);
    const [prescriptions, setPrescriptions] = useState<ProtocolPrescription[]>([]);
    const [assessmentTools, setAssessmentTools] = useState<AssessmentTool[]>([]);
    const [outcomeMetrics, setOutcomeMetrics] = useState<OutcomeMetric[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();

    // Filter states
    const [protocolFilters, setProtocolFilters] = useState<{
        category?: ProtocolCategory;
        evidenceLevel?: EvidenceLevel;
        isActive?: boolean;
        searchTerm?: string;
    }>({});

    const [selectedProtocol, setSelectedProtocol] = useState<Protocol | null>(null);

    // Data fetching
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [
                protocolsData,
                analyticsData,
                statsData,
                prescriptionsData,
                toolsData,
                metricsData
            ] = await Promise.all([
                protocolsService.getProtocols(),
                protocolsService.getProtocolAnalytics(),
                protocolsService.getProtocolLibraryStats(),
                protocolsService.getProtocolPrescriptions(),
                protocolsService.getAssessmentTools(),
                protocolsService.getOutcomeMetrics()
            ]);

            setProtocols(protocolsData);
            setAnalytics(analyticsData);
            setLibraryStats(statsData);
            setPrescriptions(prescriptionsData);
            setAssessmentTools(toolsData);
            setOutcomeMetrics(metricsData);
        } catch (error) {
            showToast('Erro ao carregar dados dos protocolos.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Event handlers
    const handleProtocolClick = (protocol: Protocol) => {
        setSelectedProtocol(protocol);
    };

    const handlePrescribeProtocol = async (protocolId: string, patientId: string) => {
        try {
            await protocolsService.prescribeProtocol(protocolId, patientId, 'current-user');
            showToast('Protocolo prescrito com sucesso!', 'success');
            fetchData();
        } catch (error) {
            showToast('Erro ao prescrever protocolo.', 'error');
        }
    };

    // Utility functions
    const getCategoryIcon = (category: ProtocolCategory) => {
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

    const getEvidenceLevelColor = (level: EvidenceLevel) => {
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

    // Render methods
    const renderLibrary = () => (
        <div className="space-y-6">
            {/* Header with stats */}
            {libraryStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total de Protocolos</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{libraryStats.totalProtocols}</div>
                            <p className="text-xs text-muted-foreground">
                                {libraryStats.pendingReview} aguardando revisão
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Taxa de Sucesso Média</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{libraryStats.averageSuccessRate.toFixed(1)}%</div>
                            <Progress value={libraryStats.averageSuccessRate} className="mt-2" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Mais Utilizados</CardTitle>
                            <Star className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{libraryStats.mostUsed.length}</div>
                            <p className="text-xs text-muted-foreground">
                                protocolos populares
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Evidência Nível 1A</CardTitle>
                            <Award className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{libraryStats.protocolsByEvidenceLevel['1A'] || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                alta qualidade de evidência
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                            <Label htmlFor="category">Categoria</Label>
                            <select 
                                id="category"
                                className="w-full mt-1 p-2 border rounded-md"
                                value={protocolFilters.category || ''}
                                onChange={(e) => setProtocolFilters(prev => ({ 
                                    ...prev, 
                                    category: e.target.value as ProtocolCategory || undefined 
                                }))}
                            >
                                <option value="">Todas as categorias</option>
                                {Object.values(ProtocolCategory).map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="evidence">Nível de Evidência</Label>
                            <select 
                                id="evidence"
                                className="w-full mt-1 p-2 border rounded-md"
                                value={protocolFilters.evidenceLevel || ''}
                                onChange={(e) => setProtocolFilters(prev => ({ 
                                    ...prev, 
                                    evidenceLevel: e.target.value as EvidenceLevel || undefined 
                                }))}
                            >
                                <option value="">Todos os níveis</option>
                                {Object.values(EvidenceLevel).map(level => (
                                    <option key={level} value={level}>Nível {level}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="status">Status</Label>
                            <select 
                                id="status"
                                className="w-full mt-1 p-2 border rounded-md"
                                value={protocolFilters.isActive?.toString() || ''}
                                onChange={(e) => setProtocolFilters(prev => ({ 
                                    ...prev, 
                                    isActive: e.target.value === 'true' ? true : e.target.value === 'false' ? false : undefined 
                                }))}
                            >
                                <option value="">Todos</option>
                                <option value="true">Ativo</option>
                                <option value="false">Inativo</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <Label htmlFor="search">Buscar</Label>
                            <div className="relative mt-1">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="search"
                                    type="text"
                                    placeholder="Buscar protocolos..."
                                    className="pl-10"
                                    value={protocolFilters.searchTerm || ''}
                                    onChange={(e) => setProtocolFilters(prev => ({ 
                                        ...prev, 
                                        searchTerm: e.target.value || undefined 
                                    }))}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Protocols Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {protocols
                    .filter(protocol => {
                        if (protocolFilters.category && protocol.category !== protocolFilters.category) return false;
                        if (protocolFilters.evidenceLevel && protocol.evidenceLevel !== protocolFilters.evidenceLevel) return false;
                        if (protocolFilters.isActive !== undefined && protocol.isActive !== protocolFilters.isActive) return false;
                        if (protocolFilters.searchTerm) {
                            const search = protocolFilters.searchTerm.toLowerCase();
                            return protocol.name.toLowerCase().includes(search) ||
                                   protocol.description.toLowerCase().includes(search) ||
                                   protocol.tags.some(tag => tag.toLowerCase().includes(search));
                        }
                        return true;
                    })
                    .map((protocol) => {
                        const IconComponent = getCategoryIcon(protocol.category);
                        
                        return (
                            <Card key={protocol.id} className="cursor-pointer hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <IconComponent className="w-5 h-5 text-blue-600" />
                                            <Badge variant="outline">{protocol.category}</Badge>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className={`w-3 h-3 rounded-full ${getEvidenceLevelColor(protocol.evidenceLevel)}`} />
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
                                                <Users className="w-4 h-4 mr-1" />
                                                {protocol.timesUsed} usos
                                            </span>
                                            {protocol.successRate && (
                                                <span className="flex items-center text-green-600">
                                                    <TrendingUp className="w-4 h-4 mr-1" />
                                                    {protocol.successRate}% sucesso
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Clock className="w-4 h-4 mr-1" />
                                            {protocol.estimatedDuration.min}-{protocol.estimatedDuration.max} {protocol.estimatedDuration.unit}
                                        </div>

                                        <div className="flex flex-wrap gap-1">
                                            {protocol.tags.slice(0, 3).map(tag => (
                                                <Badge key={tag} variant="secondary" className="text-xs">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>

                                        <div className="flex justify-between items-center pt-2">
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                onClick={() => handleProtocolClick(protocol)}
                                            >
                                                <Eye className="w-4 h-4 mr-1" />
                                                Ver Detalhes
                                            </Button>
                                            <Button 
                                                size="sm"
                                                onClick={() => handlePrescribeProtocol(protocol.id, 'patient-id')}
                                            >
                                                <Zap className="w-4 h-4 mr-1" />
                                                Prescrever
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                }
            </div>
        </div>
    );

    const renderPrescriptions = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Prescrições de Protocolos</h2>
                    <p className="text-muted-foreground">Gerencie protocolos prescritos para pacientes</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {prescriptions.map((prescription) => {
                    const protocol = protocols.find(p => p.id === prescription.protocolId);
                    if (!protocol) return null;

                    return (
                        <Card key={prescription.id}>
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
                                    <Progress value={prescription.adherenceRate} />

                                    <div className="text-sm text-muted-foreground">
                                        <strong>Próxima avaliação:</strong> Em 2 semanas
                                    </div>

                                    {prescription.outcomes.length > 0 && (
                                        <div className="text-sm">
                                            <strong>Resultados:</strong>
                                            <ul className="mt-1 space-y-1">
                                                {prescription.outcomes.slice(0, 2).map((outcome, index) => (
                                                    <li key={index} className="flex items-center">
                                                        {outcome.clinicallySignificant ? (
                                                            <CheckCircle className="w-3 h-3 text-green-500 mr-1" />
                                                        ) : (
                                                            <AlertCircle className="w-3 h-3 text-yellow-500 mr-1" />
                                                        )}
                                                        <span className="text-xs">
                                                            {outcome.metricName}: {outcome.percentChange.toFixed(1)}%
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center pt-2">
                                        <Button variant="outline" size="sm">
                                            <FileText className="w-4 h-4 mr-1" />
                                            Relatório
                                        </Button>
                                        <Button size="sm">
                                            <Edit className="w-4 h-4 mr-1" />
                                            Modificar
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );

    const renderAnalytics = () => (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Analytics de Protocolos</h2>
                <p className="text-muted-foreground">Métricas de desempenho e eficácia dos protocolos</p>
            </div>

            {analytics.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {analytics.map((analytic) => {
                        const protocol = protocols.find(p => p.id === analytic.protocolId);
                        if (!protocol) return null;

                        return (
                            <Card key={analytic.protocolId}>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <BarChart3 className="w-5 h-5 mr-2" />
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
                                            {Object.entries(analytic.outcomeMetrics).map(([metric, data]) => (
                                                <div key={metric} className="flex justify-between items-center text-sm mb-1">
                                                    <span>{metric}</span>
                                                    <span className="text-green-600">
                                                        +{data.averageImprovement.toFixed(1)}%
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        <div>
                                            <div className="text-sm font-medium mb-2">Tendência Mensal:</div>
                                            <div className="space-y-1">
                                                {analytic.monthlyTrends.slice(-3).map((trend) => (
                                                    <div key={trend.month} className="flex justify-between text-xs">
                                                        <span>{trend.month}</span>
                                                        <span>{trend.prescriptions} prescrições</span>
                                                        <span className="text-green-600">{trend.successRate.toFixed(1)}%</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );

    const renderEvidence = () => (
        <div className="space-y-6">
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
                        {libraryStats && (
                            <div className="space-y-3">
                                {Object.entries(libraryStats.protocolsByEvidenceLevel).map(([level, count]) => {
                                    const percentage = (count / libraryStats.totalProtocols) * 100;
                                    return (
                                        <div key={level} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <div className={`w-3 h-3 rounded-full ${getEvidenceLevelColor(level as EvidenceLevel)}`} />
                                                <span className="text-sm font-medium">Nível {level}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm text-muted-foreground">{count}</span>
                                                <div className="w-20">
                                                    <Progress value={percentage} />
                                                </div>
                                                <span className="text-sm text-muted-foreground w-10 text-right">
                                                    {percentage.toFixed(0)}%
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Protocolos Recentemente Atualizados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {libraryStats?.recentlyUpdated.slice(0, 5).map((protocol) => (
                                <div key={protocol.id} className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-medium">{protocol.name}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {new Date(protocol.lastUpdated).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <Badge variant="outline">v{protocol.version}</Badge>
                                </div>
                            ))}
                        </div>
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
                        {assessmentTools.map((tool) => (
                            <div key={tool.id} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-medium">{tool.name}</h4>
                                    <Badge variant="outline">{tool.type}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">{tool.description}</p>
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    {tool.reliability && <span>Confiabilidade: {tool.reliability}</span>}
                                    {tool.validity && <span>Validade: {tool.validity}</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="Protocolos Clínicos"
                    subtitle="Carregando protocolos..."
                />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Protocolos Clínicos"
                subtitle="Biblioteca completa de protocolos baseados em evidências para fisioterapia"
            />

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
            {selectedProtocol && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b">
                            <div>
                                <h2 className="text-xl font-bold">{selectedProtocol.name}</h2>
                                <p className="text-muted-foreground">{selectedProtocol.category}</p>
                            </div>
                            <Button variant="ghost" onClick={() => setSelectedProtocol(null)}>
                                <X className="w-5 h-5" />
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
                                        {selectedProtocol.inclusionCriteria.map((criteria, index) => (
                                            <li key={index} className="text-sm">{criteria}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Fases do Tratamento</h3>
                                    <div className="space-y-4">
                                        {selectedProtocol.treatmentPlan.map((phase, index) => (
                                            <div key={index} className="border rounded-lg p-4">
                                                <h4 className="font-medium">{phase.name}</h4>
                                                <p className="text-sm text-muted-foreground mb-2">{phase.description}</p>
                                                <div className="text-sm">
                                                    <strong>Objetivos:</strong>
                                                    <ul className="list-disc list-inside mt-1">
                                                        {phase.objectives.map((objective, objIndex) => (
                                                            <li key={objIndex}>{objective}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-2">Critérios de Alta</h3>
                                    <ul className="list-disc list-inside space-y-1">
                                        {selectedProtocol.dischargeCriteria.map((criteria, index) => (
                                            <li key={index} className="text-sm">{criteria}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="border-t p-6 flex justify-end space-x-3">
                            <Button variant="outline" onClick={() => setSelectedProtocol(null)}>
                                Fechar
                            </Button>
                            <Button onClick={() => handlePrescribeProtocol(selectedProtocol.id, 'patient-id')}>
                                <Zap className="w-4 h-4 mr-2" />
                                Prescrever Protocolo
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProtocolsPage;
