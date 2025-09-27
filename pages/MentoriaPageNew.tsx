// pages/MentoriaPageNew.tsx

import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '../components/PageHeader';
import { 
    Intern, 
    EducationalCase, 
    InternStatus, 
    MentorshipMetrics,
    EducationalResource,
    LearningPath,
    Certification,
    Competency,
    InternCompetency,
    CompetencyEvaluation,
    CompetencyLevel
} from '../types';
import * as mentoriaService from '../services/mentoriaService';
import { useToast } from '../contexts/ToastContext';
import { Skeleton } from '../components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { 
    Users, 
    BookOpen, 
    Award, 
    TrendingUp, 
    Calendar, 
    Clock, 
    Target, 
    Star,
    Plus,
    Filter,
    Search,
    Download,
    Eye,
    Edit,
    Trash2,
    UserPlus,
    GraduationCap,
    FileText,
    PlayCircle,
    CheckCircle,
    AlertCircle,
    BarChart3
} from 'lucide-react';

// Import modals and components (to be created)
import MentoriaStats from '../components/mentoria/MentoriaStats';
import InternsTable from '../components/mentoria/InternsTable';
import CasesList from '../components/mentoria/CasesList';
import InternFormModal from '../components/InternFormModal';
import CaseFormModal from '../components/CaseFormModal';
import CaseDetailModal from '../components/CaseDetailModal';

const MentoriaPage: React.FC = () => {
    // State management
    const [activeTab, setActiveTab] = useState('dashboard');
    const [interns, setInterns] = useState<Intern[]>([]);
    const [cases, setCases] = useState<EducationalCase[]>([]);
    const [metrics, setMetrics] = useState<MentorshipMetrics | null>(null);
    const [resources, setResources] = useState<EducationalResource[]>([]);
    const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
    const [certifications, setCertifications] = useState<Certification[]>([]);
    const [competencies, setCompetencies] = useState<Competency[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();

    // Modal states
    const [isInternModalOpen, setIsInternModalOpen] = useState(false);
    const [internToEdit, setInternToEdit] = useState<Intern | undefined>(undefined);
    const [isCaseModalOpen, setIsCaseModalOpen] = useState(false);
    const [caseToEdit, setCaseToEdit] = useState<EducationalCase | undefined>(undefined);
    const [caseToView, setCaseToView] = useState<EducationalCase | undefined>(undefined);

    // Filter states
    const [internFilter, setInternFilter] = useState<{
        status?: InternStatus;
        supervisor?: string;
        search?: string;
    }>({});
    const [caseFilter, setCaseFilter] = useState<{
        specialty?: string;
        difficulty?: number;
        isPublished?: boolean;
        search?: string;
    }>({});

    // Data fetching
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [
                mentoriaData,
                resourcesData,
                learningPathsData,
                certificationsData,
                competenciesData
            ] = await Promise.all([
                mentoriaService.getMentoriaData(),
                mentoriaService.getEducationalResources(),
                mentoriaService.getLearningPaths(),
                mentoriaService.getCertifications(),
                mentoriaService.getCompetencies()
            ]);

            setInterns(mentoriaData.interns);
            setCases(mentoriaData.cases);
            setMetrics(mentoriaData.metrics);
            setResources(resourcesData);
            setLearningPaths(learningPathsData);
            setCertifications(certificationsData);
            setCompetencies(competenciesData);
        } catch (error) {
            showToast('Erro ao carregar dados de mentoria.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Event handlers
    const handleAddIntern = () => {
        setInternToEdit(undefined);
        setIsInternModalOpen(true);
    };

    const handleEditIntern = (intern: Intern) => {
        setInternToEdit(intern);
        setIsInternModalOpen(true);
    };

    const handleSaveIntern = async (data: Omit<Intern, 'id' | 'avatarUrl' | 'competencies' | 'clinicalCases'> & { id?: string }) => {
        try {
            await mentoriaService.saveIntern(data);
            showToast(data.id ? 'Estagiário atualizado!' : 'Estagiário adicionado!', 'success');
            setIsInternModalOpen(false);
            fetchData();
        } catch (error) {
            showToast('Erro ao salvar estagiário.', 'error');
        }
    };

    const handleAddCase = () => {
        setCaseToEdit(undefined);
        setIsCaseModalOpen(true);
    };

    const handleEditCase = (clinicalCase: EducationalCase) => {
        setCaseToEdit(clinicalCase);
        setIsCaseModalOpen(true);
    };

    const handleSaveCase = async (data: Omit<EducationalCase, 'id' | 'createdAt' | 'createdBy' | 'lastUpdated' | 'discussions' | 'evaluations'> & { id?: string }) => {
        try {
            await mentoriaService.saveCase(data);
            showToast(data.id ? 'Caso clínico atualizado!' : 'Caso clínico adicionado!', 'success');
            setIsCaseModalOpen(false);
            fetchData();
        } catch (error) {
            showToast('Erro ao salvar caso clínico.', 'error');
        }
    };

    const handleDeleteIntern = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este estagiário?')) {
            try {
                await mentoriaService.deleteIntern(id);
                showToast('Estagiário excluído com sucesso!', 'success');
                fetchData();
            } catch (error) {
                showToast('Erro ao excluir estagiário.', 'error');
            }
        }
    };

    const handleDeleteCase = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este caso clínico?')) {
            try {
                await mentoriaService.deleteCase(id);
                showToast('Caso clínico excluído com sucesso!', 'success');
                fetchData();
            } catch (error) {
                showToast('Erro ao excluir caso clínico.', 'error');
            }
        }
    };

    // Render methods
    const renderDashboard = () => (
        <div className="space-y-6">
            {/* Main Statistics */}
            {metrics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Estagiários Ativos</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.activeInterns}</div>
                            <p className="text-xs text-muted-foreground">
                                {metrics.totalInterns} total
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Progresso Médio</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.averageCompetencyProgress.toFixed(1)}%</div>
                            <Progress value={metrics.averageCompetencyProgress} className="mt-2" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Casos Clínicos</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.totalCases}</div>
                            <p className="text-xs text-muted-foreground">
                                Avaliação média: {metrics.averageCaseRating.toFixed(1)}/5
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Recursos Educacionais</CardTitle>
                            <Award className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.totalResources}</div>
                            <p className="text-xs text-muted-foreground">
                                {metrics.totalLearningPaths} trilhas de aprendizagem
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Progress Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Progresso Mensal</CardTitle>
                        <CardDescription>Evolução dos indicadores de mentoria</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {metrics && (
                            <div className="space-y-4">
                                {metrics.monthlyProgress.map((month, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                        <span className="text-sm font-medium">{month.month}</span>
                                        <div className="flex space-x-4 text-sm">
                                            <span className="text-green-600">+{month.newInterns} estagiários</span>
                                            <span className="text-blue-600">{month.completedCases} casos</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Distribuição de Competências</CardTitle>
                        <CardDescription>Níveis de competência por categoria</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {metrics && (
                            <div className="space-y-4">
                                {Object.entries(metrics.competencyDistribution).map(([category, levels]) => (
                                    <div key={category} className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium">{category}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {Object.values(levels).reduce((a, b) => a + b, 0)} avaliações
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-4 gap-1">
                                            {Object.entries(levels).map(([level, count]) => (
                                                <div key={level} className="text-center">
                                                    <div className="text-xs font-medium">{count}</div>
                                                    <div className="text-xs text-muted-foreground">{level}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle>Atividades Recentes</CardTitle>
                    <CardDescription>Últimas atividades de mentoria e ensino</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {interns.slice(0, 5).map((intern) => (
                            <div key={intern.id} className="flex items-center space-x-4">
                                <img 
                                    src={intern.avatarUrl} 
                                    alt={intern.name}
                                    className="w-8 h-8 rounded-full"
                                />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{intern.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {intern.completedHours}h de {intern.totalHours}h completadas
                                    </p>
                                </div>
                                <Badge variant={intern.status === InternStatus.Active ? 'default' : 'secondary'}>
                                    {intern.status}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    const renderInterns = () => (
        <div className="space-y-6">
            {/* Header with actions */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold">Gestão de Estagiários</h2>
                    <p className="text-muted-foreground">Gerencie estagiários, competências e cronogramas</p>
                </div>
                <Button onClick={handleAddIntern}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Novo Estagiário
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="text-sm font-medium">Status</label>
                            <select 
                                className="w-full mt-1 p-2 border rounded-md"
                                value={internFilter.status || ''}
                                onChange={(e) => setInternFilter(prev => ({ 
                                    ...prev, 
                                    status: e.target.value as InternStatus || undefined 
                                }))}
                            >
                                <option value="">Todos</option>
                                {Object.values(InternStatus).map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Supervisor</label>
                            <select 
                                className="w-full mt-1 p-2 border rounded-md"
                                value={internFilter.supervisor || ''}
                                onChange={(e) => setInternFilter(prev => ({ 
                                    ...prev, 
                                    supervisor: e.target.value || undefined 
                                }))}
                            >
                                <option value="">Todos</option>
                                <option value="Dr. Roberto">Dr. Roberto</option>
                                <option value="Dra. Camila">Dra. Camila</option>
                                <option value="Dr. Fernando">Dr. Fernando</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium">Buscar</label>
                            <div className="relative mt-1">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nome ou instituição..."
                                    className="w-full pl-10 pr-4 py-2 border rounded-md"
                                    value={internFilter.search || ''}
                                    onChange={(e) => setInternFilter(prev => ({ 
                                        ...prev, 
                                        search: e.target.value || undefined 
                                    }))}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Interns Table */}
            <InternsTable
                interns={interns.filter(intern => {
                    if (internFilter.status && intern.status !== internFilter.status) return false;
                    if (internFilter.supervisor && intern.supervisorName !== internFilter.supervisor) return false;
                    if (internFilter.search) {
                        const search = internFilter.search.toLowerCase();
                        return intern.name.toLowerCase().includes(search) ||
                               intern.institution.toLowerCase().includes(search);
                    }
                    return true;
                })}
                onAdd={handleAddIntern}
                onEdit={handleEditIntern}
                onDelete={handleDeleteIntern}
            />
        </div>
    );

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageHeader
                    title="Módulo de Mentoria e Ensino"
                    subtitle="Carregando dados de mentoria..."
                />
                <Skeleton className="h-96 w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Módulo de Mentoria e Ensino"
                subtitle="Centro completo de educação continuada e desenvolvimento profissional"
            />

            {/* Modals */}
            <InternFormModal
                isOpen={isInternModalOpen}
                onClose={() => setIsInternModalOpen(false)}
                onSave={handleSaveIntern}
                internToEdit={internToEdit}
            />
            <CaseFormModal
                isOpen={isCaseModalOpen}
                onClose={() => setIsCaseModalOpen(false)}
                onSave={handleSaveCase}
                caseToEdit={caseToEdit}
            />
            <CaseDetailModal
                clinicalCase={caseToView}
                onClose={() => setCaseToView(undefined)}
            />

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-7">
                    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                    <TabsTrigger value="interns">Estagiários</TabsTrigger>
                    <TabsTrigger value="cases">Casos Clínicos</TabsTrigger>
                    <TabsTrigger value="resources">Recursos</TabsTrigger>
                    <TabsTrigger value="paths">Trilhas</TabsTrigger>
                    <TabsTrigger value="certifications">Certificações</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard" className="mt-6">
                    {renderDashboard()}
                </TabsContent>

                <TabsContent value="interns" className="mt-6">
                    {renderInterns()}
                </TabsContent>

                <TabsContent value="cases" className="mt-6">
                    <div className="text-center py-12">
                        <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Casos Clínicos</h3>
                        <p className="text-muted-foreground">Funcionalidade em desenvolvimento</p>
                    </div>
                </TabsContent>

                <TabsContent value="resources" className="mt-6">
                    <div className="text-center py-12">
                        <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Recursos Educacionais</h3>
                        <p className="text-muted-foreground">Funcionalidade em desenvolvimento</p>
                    </div>
                </TabsContent>

                <TabsContent value="paths" className="mt-6">
                    <div className="text-center py-12">
                        <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Trilhas de Aprendizagem</h3>
                        <p className="text-muted-foreground">Funcionalidade em desenvolvimento</p>
                    </div>
                </TabsContent>

                <TabsContent value="certifications" className="mt-6">
                    <div className="text-center py-12">
                        <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Certificações</h3>
                        <p className="text-muted-foreground">Funcionalidade em desenvolvimento</p>
                    </div>
                </TabsContent>

                <TabsContent value="analytics" className="mt-6">
                    <div className="text-center py-12">
                        <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Analytics de Mentoria</h3>
                        <p className="text-muted-foreground">Funcionalidade em desenvolvimento</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default MentoriaPage;
