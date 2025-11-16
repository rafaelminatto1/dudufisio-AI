// pages/EnhancedProtocolsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
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
    X,
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
    Dumbbell,
    Link,
    Sparkles
} from 'lucide-react';
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
import { integratedProtocolsService } from '../services/integratedProtocolsService';
import { exerciseProtocolService } from '../services/exerciseProtocolService';
import { useToast } from '../contexts/ToastContext';
import { Skeleton } from '../components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

const EnhancedProtocolsPage: React.FC = () => {
    // State management
    const [activeTab, setActiveTab] = useState('library');
    const [protocols, setProtocols] = useState<Protocol[]>([]);
    const [analytics, setAnalytics] = useState<ProtocolAnalytics[]>([]);
    const [libraryStats, setLibraryStats] = useState<ProtocolLibraryStats | null>(null);
    const [prescriptions, setPrescriptions] = useState<ProtocolPrescription[]>([]);
    const [assessmentTools, setAssessmentTools] = useState<AssessmentTool[]>([]);
    const [outcomeMetrics, setOutcomeMetrics] = useState<OutcomeMetric[]>([]);
    const [integratedStats, setIntegratedStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();

    // Filter states
    const [protocolFilters, setProtocolFilters] = useState<{
        category?: ProtocolCategory;
        evidenceLevel?: EvidenceLevel;
        isActive?: boolean;
        searchTerm?: string;
        specialty?: string;
        includeClinical?: boolean;
        includeSystem?: boolean;
    }>({
        includeClinical: true,
        includeSystem: true
    });

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
                metricsData,
                integratedStatsData
            ] = await Promise.all([
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
        } catch (error) {
            showToast('Erro ao carregar dados dos protocolos.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [protocolFilters, showToast]);

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
                return 'bg-success-light0';
            case EvidenceLevel.IB:
                return 'bg-green-400';
            case EvidenceLevel.IIA:
                return 'bg-warning-light0';
            case EvidenceLevel.IIB:
                return 'bg-yellow-400';
            default:
                return 'bg-gray-400';
        }
    };

    const getSpecialtyColor = (specialty: string) => {
        switch (specialty) {
            case 'esportiva':
                return 'bg-primary-light text-blue-800';
            case 'pos-operatoria':
                return 'bg-success-light text-success';
            case 'geriatrica':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-neutral-bgDark text-gray-800';
        }
    };

    // Render methods
    const renderLibrary = () => (
        <div className="space-y-xl">
            {/* Header with integrated stats */}
            {integratedStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total de Protocolos</CardTitle>
                            <BookOpen className="h-4 w-4 text-neutral-textSecondary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{integratedStats.totalProtocols}</div>
                            <p className="text-xs text-neutral-textSecondary">
                                {integratedStats.clinicalProtocols} clínicos + {integratedStats.systemProtocols} sistema
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Com Exercícios</CardTitle>
                            <Link className="h-4 w-4 text-neutral-textSecondary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{integratedStats.protocolsWithExercises}</div>
                            <p className="text-xs text-neutral-textSecondary">
                                protocolos vinculados
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Especialidades</CardTitle>
                            <Sparkles className="h-4 w-4 text-neutral-textSecondary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{Object.keys(integratedStats.specialties).length}</div>
                            <p className="text-xs text-neutral-textSecondary">
                                áreas especializadas
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Nível 1A</CardTitle>
                            <Award className="h-4 w-4 text-neutral-textSecondary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{integratedStats.evidenceLevels['IA'] || 0}</div>
                            <p className="text-xs text-neutral-textSecondary">
                                alta evidência científica
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Enhanced Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-md">
                        <div>
                            <Label htmlFor="category">Categoria</Label>
                            <select 
                                id="category"
                                title="Filtrar por categoria de protocolo"
                                className="w-full mt-xs p-sm border rounded-md"
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
                            <Label htmlFor="specialty">Especialidade</Label>
                            <select 
                                id="specialty"
                                title="Filtrar por especialidade"
                                className="w-full mt-xs p-sm border rounded-md"
                                value={protocolFilters.specialty || ''}
                                onChange={(e) => setProtocolFilters(prev => ({ 
                                    ...prev, 
                                    specialty: e.target.value || undefined 
                                }))}
                            >
                                <option value="">Todas as especialidades</option>
                                <option value="esportiva">Fisioterapia Esportiva</option>
                                <option value="pos-operatoria">Fisioterapia Pós-Operatória</option>
                                <option value="geriatrica">Fisioterapia Gerontológica</option>
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="evidence">Nível de Evidência</Label>
                            <select 
                                id="evidence"
                                title="Filtrar por nível de evidência"
                                className="w-full mt-xs p-sm border rounded-md"
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
                                title="Filtrar por status"
                                className="w-full mt-xs p-sm border rounded-md"
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
                            <div className="relative mt-xs">
                                <Search className="absolute left-3 top-sm.5 h-4 w-4 text-neutral-textSecondary" />
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

                    {/* Source filters */}
                    <div className="mt-md flex gap-md">
                        <div className="flex items-center">
                            <input
                                id="include-clinical"
                                type="checkbox"
                                checked={protocolFilters.includeClinical !== false}
                                onChange={(e) => setProtocolFilters(prev => ({ 
                                    ...prev, 
                                    includeClinical: e.target.checked 
                                }))}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-blue-500"
                            />
                            <label htmlFor="include-clinical" className="ml-sm text-sm text-gray-700">
                                Incluir Protocolos Clínicos
                            </label>
                        </div>
                        <div className="flex items-center">
                            <input
                                id="include-system"
                                type="checkbox"
                                checked={protocolFilters.includeSystem !== false}
                                onChange={(e) => setProtocolFilters(prev => ({ 
                                    ...prev, 
                                    includeSystem: e.target.checked 
                                }))}
                                className="h-4 w-4 rounded border-gray-300 text-success focus:ring-green-500"
                            />
                            <label htmlFor="include-system" className="ml-sm text-sm text-gray-700">
                                Incluir Protocolos do Sistema
                            </label>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Enhanced Protocols Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
                {protocols.map((protocol: any) => {
                    const IconComponent = getCategoryIcon(protocol.category);
                    const isClinical = protocol.id.startsWith('clinical-');
                    
                    return (
                        <Card key={protocol.id} className="cursor-pointer hover:shadow-cardHover transition-shadow">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <IconComponent className="w-5 h-5 text-primary" />
                                        <Badge variant="outline">{protocol.category}</Badge>
                                        {isClinical && (
                                            <Badge className={getSpecialtyColor(protocol.specialty)}>
                                                {protocol.specialty}
                                            </Badge>
                                        )}
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
                                <div className="space-y-sm">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center">
                                            <Users className="w-4 h-4 mr-xs" />
                                            {protocol.timesUsed} usos
                                        </span>
                                        {protocol.successRate && (
                                            <span className="flex items-center text-success">
                                                <TrendingUp className="w-4 h-4 mr-xs" />
                                                {protocol.successRate}% sucesso
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center text-sm text-neutral-textSecondary">
                                        <Clock className="w-4 h-4 mr-xs" />
                                        {protocol.estimatedDuration.min}-{protocol.estimatedDuration.max} {protocol.estimatedDuration.unit}
                                    </div>

                                    {/* Show linked exercises for clinical protocols */}
                                    {isClinical && protocol.linkedExercises && protocol.linkedExercises.length > 0 && (
                                        <div className="flex items-center text-sm text-primary">
                                            <Link className="w-4 h-4 mr-xs" />
                                            {protocol.linkedExercises.length} exercícios vinculados
                                        </div>
                                    )}

                                    <div className="flex flex-wrap gap-1">
                                        {protocol.tags.slice(0, 3).map((tag: any) => (
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
                                            <Eye className="w-4 h-4 mr-xs" />
                                            Ver Detalhes
                                        </Button>
                                        <Button 
                                            size="sm"
                                            onClick={() => handlePrescribeProtocol(protocol.id, 'patient-id')}
                                        >
                                            <Zap className="w-4 h-4 mr-xs" />
                                            Prescrever
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

    // Keep existing render methods for other tabs
    const renderPrescriptions = () => (
        <div className="space-y-xl">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Prescrições de Protocolos</h2>
                    <p className="text-neutral-textSecondary">Gerencie protocolos prescritos para pacientes</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
                {prescriptions.map((prescription: any) => {
                    const protocol = protocols.find(p => p.id === prescription.protocolId);
                    if (!protocol) return null;

                    return (
                        <Card key={prescription.id}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <Badge variant={prescription.status === 'active' ? 'default' : 'secondary'}>
                                        {prescription.status}
                                    </Badge>
                                    <span className="text-sm text-neutral-textSecondary">
                                        Fase: {prescription.currentPhase}
                                    </span>
                                </div>
                                <CardTitle className="text-lg">{protocol.name}</CardTitle>
                                <CardDescription>
                                    Paciente: {prescription.patientId} | Prescrito em: {new Date(prescription.prescribedAt).toLocaleDateString()}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-sm">
                                    <div className="flex items-center justify-between text-sm">
                                        <span>Aderência</span>
                                        <span className="font-medium">{prescription.adherenceRate}%</span>
                                    </div>
                                    <Progress value={prescription.adherenceRate} />

                                    <div className="text-sm text-neutral-textSecondary">
                                        <strong>Próxima avaliação:</strong> Em 2 semanas
                                    </div>

                                    {prescription.outcomes.length > 0 && (
                                        <div className="text-sm">
                                            <strong>Resultados:</strong>
                                            <ul className="mt-xs space-y-1">
                                                {prescription.outcomes.slice(0, 2).map((outcome: any, index: number) => (
                                                    <li key={index} className="flex items-center">
                                                        {outcome.clinicallySignificant ? (
                                                            <CheckCircle className="w-3 h-3 text-green-500 mr-xs" />
                                                        ) : (
                                                            <AlertCircle className="w-3 h-3 text-yellow-500 mr-xs" />
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
                                            <FileText className="w-4 h-4 mr-xs" />
                                            Relatório
                                        </Button>
                                        <Button size="sm">
                                            <Edit className="w-4 h-4 mr-xs" />
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
        <div className="space-y-xl">
            <div>
                <h2 className="text-2xl font-bold">Analytics de Protocolos</h2>
                <p className="text-neutral-textSecondary">Métricas de desempenho e eficácia dos protocolos</p>
            </div>

            {analytics.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
                    {analytics.map((analytic: any) => {
                        const protocol = protocols.find(p => p.id === analytic.protocolId);
                        if (!protocol) return null;

                        return (
                            <Card key={analytic.protocolId}>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <BarChart3 className="w-5 h-5 mr-sm" />
                                        {analytic.protocolName}
                                    </CardTitle>
                                    <CardDescription>
                                        Análise de {analytic.totalPrescriptions} prescrições
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-md">
                                        <div className="grid grid-cols-2 gap-md">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-success">
                                                    {analytic.successRate.toFixed(1)}%
                                                </div>
                                                <div className="text-xs text-neutral-textSecondary">Taxa de Sucesso</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-primary">
                                                    {analytic.adherenceRate.toFixed(1)}%
                                                </div>
                                                <div className="text-xs text-neutral-textSecondary">Aderência Média</div>
                                            </div>
                                        </div>

                                        <div>
                                            <div className="text-sm font-medium mb-sm">Resultados por Métrica:</div>
                                            {Object.entries(analytic.outcomeMetrics).map(([metric, data]) => (
                                                <div key={metric} className="flex justify-between items-center text-sm mb-1">
                                                    <span>{metric}</span>
                                                    <span className="text-success">
                                                        +{(data as any).averageImprovement.toFixed(1)}%
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        <div>
                                            <div className="text-sm font-medium mb-sm">Tendência Mensal:</div>
                                            <div className="space-y-1">
                                                {analytic.monthlyTrends.slice(-3).map((trend: any) => (
                                                    <div key={trend.month} className="flex justify-between text-xs">
                                                        <span>{trend.month}</span>
                                                        <span>{trend.prescriptions} prescrições</span>
                                                        <span className="text-success">{trend.successRate.toFixed(1)}%</span>
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
        <div className="space-y-xl">
            <div>
                <h2 className="text-2xl font-bold">Base de Evidências</h2>
                <p className="text-neutral-textSecondary">Referências científicas e atualizações dos protocolos</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
                <Card>
                    <CardHeader>
                        <CardTitle>Distribuição por Nível de Evidência</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {integratedStats && (
                            <div className="space-y-sm">
                                {Object.entries(integratedStats.evidenceLevels).map(([level, count]) => {
                                    const percentage = (count as number / integratedStats.totalProtocols) * 100;
                                    return (
                                        <div key={level} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <div className={`w-3 h-3 rounded-full ${getEvidenceLevelColor(level as EvidenceLevel)}`} />
                                                <span className="text-sm font-medium">Nível {level}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm text-neutral-textSecondary">{count}</span>
                                                <div className="w-20">
                                                    <Progress value={percentage} />
                                                </div>
                                                <span className="text-sm text-neutral-textSecondary w-10 text-right">
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
                        <CardTitle>Protocolos por Especialidade</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {integratedStats && (
                            <div className="space-y-sm">
                                {Object.entries(integratedStats.specialties).map(([specialty, count]) => (
                                    <div key={specialty} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <div className={`w-3 h-3 rounded-full ${getSpecialtyColor(specialty).replace('text-', 'bg-').replace('100', '500')}`} />
                                            <span className="text-sm font-medium">{specialty}</span>
                                        </div>
                                        <span className="text-sm text-neutral-textSecondary">{count}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Ferramentas de Avaliação</CardTitle>
                    <CardDescription>Instrumentos validados para avaliação clínica</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                        {assessmentTools.map((tool: any) => (
                            <div key={tool.id} className="border rounded-lg p-md">
                                <div className="flex items-center justify-between mb-sm">
                                    <h4 className="font-medium">{tool.name}</h4>
                                    <Badge variant="outline">{tool.type}</Badge>
                                </div>
                                <p className="text-sm text-neutral-textSecondary mb-sm">{tool.description}</p>
                                <div className="flex justify-between text-xs text-neutral-textSecondary">
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
            <div className="space-y-xl">
                <PageHeader
                    title="Protocolos Clínicos Integrados"
                    subtitle="Carregando protocolos..."
                />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-xl">
            <PageHeader
                title="Protocolos Clínicos Integrados"
                subtitle="Biblioteca completa de protocolos baseados em evidências + conteúdo clínico especializado"
            />

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="library">Biblioteca</TabsTrigger>
                    <TabsTrigger value="prescriptions">Prescrições</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="evidence">Evidências</TabsTrigger>
                </TabsList>

                <TabsContent value="library" className="mt-xl">
                    {renderLibrary()}
                </TabsContent>

                <TabsContent value="prescriptions" className="mt-xl">
                    {renderPrescriptions()}
                </TabsContent>

                <TabsContent value="analytics" className="mt-xl">
                    {renderAnalytics()}
                </TabsContent>

                <TabsContent value="evidence" className="mt-xl">
                    {renderEvidence()}
                </TabsContent>
            </Tabs>

            {/* Protocol Detail Modal */}
            {selectedProtocol && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-md">
                    <div className="bg-white rounded-cardLarge shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between p-lg border-b">
                            <div>
                                <h2 className="text-xl font-bold">{selectedProtocol.name}</h2>
                                <div className="flex items-center space-x-2 mt-xs">
                                    <Badge variant="outline">{selectedProtocol.category}</Badge>
                                    {(selectedProtocol as any).specialty && (
                                        <Badge className={getSpecialtyColor((selectedProtocol as any).specialty)}>
                                            {(selectedProtocol as any).specialty}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <Button variant="ghost" onClick={() => setSelectedProtocol(null)}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-lg">
                            <div className="space-y-xl">
                                <div>
                                    <h3 className="text-lg font-semibold mb-sm">Descrição</h3>
                                    <p className="text-neutral-textSecondary">{selectedProtocol.description}</p>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-sm">Critérios de Inclusão</h3>
                                    <ul className="list-disc list-inside space-y-1">
                                        {selectedProtocol.inclusionCriteria.map((criteria, index) => (
                                            <li key={index} className="text-sm">{criteria}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-sm">Fases do Tratamento</h3>
                                    <div className="space-y-md">
                                        {selectedProtocol.treatmentPlan.map((phase, index) => (
                                            <div key={index} className="border rounded-lg p-md">
                                                <h4 className="font-medium">{phase.name}</h4>
                                                <p className="text-sm text-neutral-textSecondary mb-sm">{phase.description}</p>
                                                <div className="text-sm">
                                                    <strong>Objetivos:</strong>
                                                    <ul className="list-disc list-inside mt-xs">
                                                        {phase.objectives.map((objective, objIndex) => (
                                                            <li key={objIndex}>{objective}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Show linked exercises for clinical protocols */}
                                {(selectedProtocol as any).linkedExercises && (selectedProtocol as any).linkedExercises.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold mb-sm">Exercícios Vinculados</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                                            {(selectedProtocol as any).linkedExercises.map((exercise: any, index: number) => (
                                                <div key={index} className="border rounded-lg p-md">
                                                    <h4 className="font-medium">{exercise.name}</h4>
                                                    <p className="text-sm text-neutral-textSecondary">{exercise.description}</p>
                                                    <div className="flex items-center mt-sm">
                                                        <Badge variant="secondary" className="text-xs">
                                                            {exercise.difficulty}
                                                        </Badge>
                                                        <span className="text-xs text-neutral-textSecondary ml-sm">
                                                            {exercise.targetMuscles?.join(', ')}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <h3 className="text-lg font-semibold mb-sm">Critérios de Alta</h3>
                                    <ul className="list-disc list-inside space-y-1">
                                        {selectedProtocol.dischargeCriteria.map((criteria, index) => (
                                            <li key={index} className="text-sm">{criteria}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div className="border-t p-lg flex justify-end space-x-3">
                            <Button variant="outline" onClick={() => setSelectedProtocol(null)}>
                                Fechar
                            </Button>
                            <Button onClick={() => handlePrescribeProtocol(selectedProtocol.id, 'patient-id')}>
                                <Zap className="w-4 h-4 mr-sm" />
                                Prescrever Protocolo
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnhancedProtocolsPage;
